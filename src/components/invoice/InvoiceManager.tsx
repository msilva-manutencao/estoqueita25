import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
    FileText,
    Upload,
    Image as ImageIcon,
    FileX,
    Edit,
    Trash2,
    Plus,
    Check,
    X,
    Package,
    AlertTriangle,
    RefreshCw
} from "lucide-react";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useToast } from "@/hooks/use-toast";
import { NewItemForm } from "./NewItemForm";

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    entryQuantity: number; // Quantidade para entrada no estoque
    unit?: string;
    matchedItemId?: string;
    matchedItemName?: string;
    isEditing?: boolean;
    isNew?: boolean;
}

export function InvoiceManager() {
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showNewItemDialog, setShowNewItemDialog] = useState(false);
    const [selectedItemForNewCadaster, setSelectedItemForNewCadaster] = useState<InvoiceItem | null>(null);

    const { items, addStockMovement, addItem, fetchItems } = useSupabaseItems();
    const { toast } = useToast();

    // Processa o arquivo real da nota fiscal (OCR/PDF/XML)
    const processFile = async (file: File) => {
        setIsProcessing(true);

        try {
            let extractedItems: InvoiceItem[] = [];

            if (file.type.startsWith('image/')) {
                // Processamento OCR para imagens
                extractedItems = await processImageOCR(file);
            } else if (file.type === 'application/pdf') {
                // Processamento PDF
                extractedItems = await processPDF(file);
            } else if (file.type === 'application/xml' || file.name.endsWith('.xml')) {
                // Processamento XML
                extractedItems = await processXML(file);
            } else {
                throw new Error('Tipo de arquivo não suportado');
            }

            // Tenta fazer match automático com itens existentes
            const itemsWithMatches = extractedItems.map(item => {
                const matchedItem = findBestMatch(item.description);
                return {
                    ...item,
                    matchedItemId: matchedItem?.id,
                    matchedItemName: matchedItem?.name
                };
            });

            setInvoiceItems(itemsWithMatches);

            toast({
                title: "Arquivo processado com sucesso",
                description: `${itemsWithMatches.length} itens extraídos da nota fiscal`
            });

        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            toast({
                title: "Erro no processamento",
                description: error instanceof Error ? error.message : "Não foi possível processar o arquivo",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Processamento OCR para imagens
    const processImageOCR = async (file: File): Promise<InvoiceItem[]> => {
        try {
            toast({
                title: "Processando OCR...",
                description: "Extraindo texto da imagem, isso pode levar alguns segundos"
            });

            // Converte arquivo para base64
            const imageData = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Tenta usar Tesseract.js
            try {
                const Tesseract = await import('tesseract.js');
                const { data: { text } } = await Tesseract.recognize(imageData, 'por', {
                    logger: m => console.log('OCR:', m)
                });

                console.log('Texto extraído do OCR:', text);

                if (text && text.trim().length > 10) {
                    const extractedItems = await extractItemsFromText(text);
                    if (extractedItems.length > 0) {
                        return extractedItems;
                    }
                }
            } catch (ocrError) {
                console.error('Erro específico do OCR:', ocrError);
            }

            // Fallback: se OCR falhar ou não encontrar itens
            toast({
                title: "OCR concluído",
                description: "Não foi possível extrair itens automaticamente. Use 'Adicionar Item Manual'",
                variant: "default"
            });

            return [];

        } catch (error) {
            console.error('Erro geral no processamento de imagem:', error);
            toast({
                title: "Erro no processamento",
                description: "Não foi possível processar a imagem. Use 'Adicionar Item Manual'",
                variant: "destructive"
            });
            return [];
        }
    };

    // Processamento PDF
    const processPDF = async (file: File): Promise<InvoiceItem[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target?.result as ArrayBuffer;

                    // Importação dinâmica do PDF.js
                    const pdfjsLib = await import('pdfjs-dist');

                    // Configurar worker
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

                    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                    let fullText = '';

                    toast({
                        title: "Processando PDF...",
                        description: `Extraindo texto de ${pdf.numPages} página(s)`
                    });

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        fullText += pageText + '\n';
                    }

                    console.log('Texto extraído do PDF:', fullText);

                    const extractedItems = await extractItemsFromText(fullText);
                    resolve(extractedItems);

                } catch (error) {
                    console.error('Erro no PDF:', error);
                    reject(new Error('Erro no processamento PDF: ' + error));
                }
            };
            reader.onerror = () => reject(new Error('Erro ao ler o arquivo PDF'));
            reader.readAsArrayBuffer(file);
        });
    };

    // Processamento XML
    const processXML = async (file: File): Promise<InvoiceItem[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const xmlText = e.target?.result as string;
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

                    // Verifica se há erros de parsing
                    const parseError = xmlDoc.querySelector('parsererror');
                    if (parseError) {
                        throw new Error('XML inválido');
                    }

                    const extractedItems = await extractItemsFromXML(xmlDoc);
                    resolve(extractedItems);

                } catch (error) {
                    reject(new Error('Erro no processamento XML: ' + error));
                }
            };
            reader.onerror = () => reject(new Error('Erro ao ler o arquivo XML'));
            reader.readAsText(file);
        });
    };

    // Extrai itens do XML da NFe
    const extractItemsFromXML = async (xmlDoc: Document): Promise<InvoiceItem[]> => {
        const items: InvoiceItem[] = [];

        // Busca pelos itens da nota fiscal (det)
        const detElements = xmlDoc.querySelectorAll('det');

        detElements.forEach((det, index) => {
            const prod = det.querySelector('prod');
            if (prod) {
                const description = prod.querySelector('xProd')?.textContent || '';
                const quantity = parseFloat(prod.querySelector('qCom')?.textContent || '0');
                const unit = prod.querySelector('uCom')?.textContent || 'UN';

                if (description && quantity > 0) {
                    items.push({
                        id: `xml-${index + 1}`,
                        description: description.trim(),
                        quantity: quantity,
                        entryQuantity: quantity,
                        unit: unit
                    });
                }
            }
        });

        return items;
    };

    // Extrai itens do texto (OCR ou PDF)
    const extractItemsFromText = async (text: string): Promise<InvoiceItem[]> => {
        const items: InvoiceItem[] = [];

        try {
            // Padrões regex para diferentes formatos de nota fiscal
            const patterns = [
                // Padrão 1: PRODUTO QUANTIDADE UNIDADE
                /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(UN|KG|LT|PC|CX|PCT|MT|M2|M3)\s*$/gm,

                // Padrão 2: PRODUTO | QUANTIDADE | UNIDADE (com separadores)
                /^(.+?)\s*[\|\t]\s*(\d+(?:[.,]\d+)?)\s*[\|\t]\s*(UN|KG|LT|PC|CX|PCT|MT|M2|M3)/gm,

                // Padrão 3: Para notas com códigos - CODIGO PRODUTO QUANTIDADE UNIDADE
                /^\d+\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s+(UN|KG|LT|PC|CX|PCT|MT|M2|M3)/gm,

                // Padrão 4: Formato específico com valores - PRODUTO QTD VALOR_UNIT VALOR_TOTAL
                /^(.+?)\s+(\d+(?:[.,]\d+)?)\s+\d+[.,]\d+\s+\d+[.,]\d+/gm
            ];

            let itemCount = 0;

            for (const pattern of patterns) {
                const matches = [...text.matchAll(pattern)];

                for (const match of matches) {
                    const description = match[1]?.trim();
                    const quantityStr = match[2]?.replace(',', '.');
                    const quantity = parseFloat(quantityStr || '0');
                    const unit = match[3]?.toUpperCase() || 'UN';

                    if (description && description.length > 3 && quantity > 0) {
                        // Filtrar linhas que não são produtos (cabeçalhos, totais, etc.)
                        const excludeWords = ['total', 'subtotal', 'desconto', 'acrescimo', 'valor', 'quantidade', 'unidade', 'codigo', 'item'];
                        const isProduct = !excludeWords.some(word =>
                            description.toLowerCase().includes(word.toLowerCase())
                        );

                        if (isProduct) {
                            items.push({
                                id: `extracted-${++itemCount}`,
                                description: description,
                                quantity: quantity,
                                entryQuantity: quantity,
                                unit: unit
                            });
                        }
                    }
                }

                // Se encontrou itens com este padrão, para de tentar outros
                if (items.length > 0) break;
            }

            // Se não encontrou nada com regex, tenta uma abordagem mais simples
            if (items.length === 0) {
                const lines = text.split('\n').filter(line => line.trim().length > 0);

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();

                    // Procura por linhas que contenham números (possíveis quantidades)
                    const numberMatch = line.match(/(\d+(?:[.,]\d+)?)/);
                    if (numberMatch && line.length > 10) {
                        const quantity = parseFloat(numberMatch[1].replace(',', '.'));

                        if (quantity > 0 && quantity < 1000000) { // Filtro de quantidade razoável
                            items.push({
                                id: `manual-${i + 1}`,
                                description: line,
                                quantity: quantity,
                                entryQuantity: quantity,
                                unit: 'UN'
                            });
                        }
                    }
                }
            }

            // Remove duplicatas baseado na descrição
            const uniqueItems = items.filter((item, index, self) =>
                index === self.findIndex(i => i.description.toLowerCase() === item.description.toLowerCase())
            );

            if (uniqueItems.length > 0) {
                toast({
                    title: "Itens extraídos com sucesso",
                    description: `${uniqueItems.length} itens foram identificados no documento`
                });
            } else {
                toast({
                    title: "Nenhum item identificado automaticamente",
                    description: "Use o botão 'Adicionar Item Manual' para inserir os itens",
                    variant: "default"
                });
            }

            return uniqueItems;

        } catch (error) {
            console.error('Erro na extração de texto:', error);
            toast({
                title: "Erro na extração",
                description: "Use o botão 'Adicionar Item Manual' para inserir os itens",
                variant: "default"
            });
            return [];
        }
    };

    // Algoritmo melhorado para encontrar o item mais próximo
    const findBestMatch = (description: string) => {
        if (!items.length) return null;

        const searchTerms = description.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove pontuação
            .split(' ')
            .filter(term => term.length > 2); // Ignora palavras muito pequenas

        let bestMatch = null;
        let bestScore = 0;

        items.forEach(item => {
            const itemName = item.name.toLowerCase();
            let score = 0;
            let exactMatches = 0;

            searchTerms.forEach(term => {
                if (itemName.includes(term)) {
                    score += term.length;
                    if (itemName.split(' ').includes(term)) {
                        exactMatches += 1;
                        score += 5; // Bonus para palavras exatas
                    }
                }
            });

            // Bonus adicional para múltiplas correspondências
            if (exactMatches > 1) {
                score += exactMatches * 3;
            }

            if (score > bestScore && score > 3) { // Threshold mínimo
                bestScore = score;
                bestMatch = item;
            }
        });

        return bestMatch;
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            processFile(file);
        }
    };

    const handleItemMatch = (itemId: string, matchedItemId: string) => {
        const matchedItem = items.find(item => item.id === matchedItemId);
        setInvoiceItems(prev => prev.map(item =>
            item.id === itemId
                ? {
                    ...item,
                    matchedItemId: matchedItemId,
                    matchedItemName: matchedItem?.name || ""
                }
                : item
        ));
    };

    const handleEditItem = (itemId: string, field: string, value: any) => {
        setInvoiceItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const handleDeleteItem = (itemId: string) => {
        setInvoiceItems(prev => prev.filter(item => item.id !== itemId));
    };

    // Função auxiliar para lidar com o sucesso do cadastro de novo item
    const handleNewItemSuccess = async (invoiceItemId: string, newItemId: string, itemName: string) => {
        try {
            // Atualiza a lista de itens para incluir o novo item
            await fetchItems();

            // Aguarda um pouco para garantir que o item foi carregado
            setTimeout(() => {
                // Procura o item recém-criado na lista atualizada
                const newItem = items.find(dbItem =>
                    dbItem.name.toLowerCase().trim() === itemName.toLowerCase().trim()
                );

                if (newItem) {
                    handleItemMatch(invoiceItemId, newItem.id);
                    toast({
                        title: "Item vinculado",
                        description: `Item "${itemName}" foi cadastrado e vinculado com sucesso`
                    });
                } else {
                    toast({
                        title: "Item cadastrado",
                        description: "Item cadastrado com sucesso. Selecione-o manualmente na lista.",
                        variant: "default"
                    });
                }
            }, 1000);

        } catch (error) {
            console.error('Erro ao atualizar lista:', error);
        }

        setShowNewItemDialog(false);
        setSelectedItemForNewCadaster(null);
    };

    const handleAddToStock = async () => {
        const itemsToAdd = invoiceItems.filter(item => item.matchedItemId && item.entryQuantity > 0);

        if (itemsToAdd.length === 0) {
            toast({
                title: "Nenhum item selecionado",
                description: "Selecione pelo menos um item com quantidade maior que zero para adicionar ao estoque",
                variant: "destructive"
            });
            return;
        }

        try {
            let successCount = 0;
            let errorCount = 0;

            // Processa cada item individualmente
            for (const item of itemsToAdd) {
                const success = await addStockMovement(
                    item.matchedItemId!,
                    item.entryQuantity,
                    'entrada',
                    `Entrada via Nota Fiscal - ${item.description}`
                );

                if (success) {
                    successCount++;
                } else {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: "Entrada realizada com sucesso",
                    description: `${successCount} ${successCount === 1 ? 'item foi adicionado' : 'itens foram adicionados'} ao estoque${errorCount > 0 ? `. ${errorCount} ${errorCount === 1 ? 'item falhou' : 'itens falharam'}.` : '.'}`
                });

                // Limpa a lista apenas se todos foram processados com sucesso
                if (errorCount === 0) {
                    setInvoiceItems([]);
                    setUploadedFile(null);
                } else {
                    // Remove apenas os itens que foram processados com sucesso
                    setInvoiceItems(prev => prev.filter(item =>
                        !itemsToAdd.some(addedItem => addedItem.id === item.id)
                    ));
                }
            } else {
                toast({
                    title: "Erro na entrada",
                    description: "Não foi possível adicionar nenhum item ao estoque. Verifique sua conexão e tente novamente.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Erro ao processar entrada:', error);
            toast({
                title: "Erro inesperado",
                description: "Ocorreu um erro ao processar a entrada. Tente novamente.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Nota Fiscal</span>
                    </CardTitle>
                    <CardDescription>
                        Importe notas fiscais e gerencie a entrada de itens no estoque
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Upload de arquivo */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center space-x-4">
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                <FileText className="h-12 w-12 text-muted-foreground" />
                                <FileX className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Importar Nota Fiscal</h3>
                                <p className="text-muted-foreground">
                                    Selecione uma imagem (OCR), PDF ou arquivo XML da nota fiscal
                                </p>
                            </div>
                            <div className="flex justify-center">
                                <Label htmlFor="file-upload" className="cursor-pointer">
                                    <Button asChild disabled={isProcessing}>
                                        <span>
                                            <Upload className="h-4 w-4 mr-2" />
                                            {isProcessing ? "Processando..." : "Selecionar Arquivo"}
                                        </span>
                                    </Button>
                                </Label>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf,.xml"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>
                            {uploadedFile && (
                                <p className="text-sm text-muted-foreground">
                                    Arquivo selecionado: {uploadedFile.name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Loading */}
                    {isProcessing && (
                        <Card>
                            <CardContent className="p-8">
                                <div className="flex items-center justify-center space-x-2">
                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                    <span>Processando arquivo...</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lista de itens extraídos */}
                    {invoiceItems.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Itens Extraídos da Nota Fiscal</CardTitle>
                                <CardDescription>
                                    Confira os itens extraídos e faça a correspondência com seu cadastro
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Estatísticas */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold">{invoiceItems.length}</div>
                                                <p className="text-sm text-muted-foreground">Itens extraídos</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {invoiceItems.filter(item => item.matchedItemId).length}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Itens identificados</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {invoiceItems.filter(item => !item.matchedItemId).length}
                                                </div>
                                                <p className="text-sm text-muted-foreground">Itens não identificados</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Tabela de itens - Desktop */}
                                    <div className="hidden md:block border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Descrição da NF</TableHead>
                                                    <TableHead>Qtd. NF</TableHead>
                                                    <TableHead>Qtd. Entrada</TableHead>
                                                    <TableHead>Item Correspondente</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {invoiceItems.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>
                                                            {item.isEditing ? (
                                                                <Textarea
                                                                    value={item.description}
                                                                    onChange={(e) => handleEditItem(item.id, 'description', e.target.value)}
                                                                    className="min-h-[60px]"
                                                                />
                                                            ) : (
                                                                <div className="font-medium">{item.description}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.isEditing ? (
                                                                <Input
                                                                    type="number"
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleEditItem(item.id, 'quantity', Number(e.target.value))}
                                                                />
                                                            ) : (
                                                                <span>{item.quantity} {item.unit}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={item.entryQuantity}
                                                                onChange={(e) => handleEditItem(item.id, 'entryQuantity', Number(e.target.value))}
                                                                className="w-20"
                                                                placeholder="0"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={item.matchedItemId || "none"}
                                                                onValueChange={(value) => handleItemMatch(item.id, value === "none" ? "" : value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecionar item..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">Nenhum item</SelectItem>
                                                                    {items.map((dbItem) => (
                                                                        <SelectItem key={dbItem.id} value={dbItem.id}>
                                                                            {dbItem.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.matchedItemId ? (
                                                                <Badge variant="default" className="bg-green-100 text-green-800">
                                                                    <Check className="h-3 w-3 mr-1" />
                                                                    Identificado
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                                    Não identificado
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                {item.isEditing ? (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleEditItem(item.id, 'isEditing', false)}
                                                                        >
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleEditItem(item.id, 'isEditing', false)}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleEditItem(item.id, 'isEditing', true)}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        {!item.matchedItemId && (
                                                                            <Dialog
                                                                                open={showNewItemDialog && selectedItemForNewCadaster?.id === item.id}
                                                                                onOpenChange={(open) => {
                                                                                    setShowNewItemDialog(open);
                                                                                    if (!open) setSelectedItemForNewCadaster(null);
                                                                                }}
                                                                            >
                                                                                <DialogTrigger asChild>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        onClick={() => {
                                                                                            setSelectedItemForNewCadaster(item);
                                                                                            setShowNewItemDialog(true);
                                                                                        }}
                                                                                    >
                                                                                        <Plus className="h-4 w-4" />
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                                <DialogContent className="max-w-2xl">
                                                                                    <DialogHeader>
                                                                                        <DialogTitle>Cadastrar Novo Item</DialogTitle>
                                                                                        <DialogDescription>
                                                                                            Cadastre um novo item baseado na descrição da nota fiscal
                                                                                        </DialogDescription>
                                                                                    </DialogHeader>
                                                                                    <NewItemForm
                                                                                        initialDescription={item.description}
                                                                                        onSuccess={(newItemId, itemName) =>
                                                                                            handleNewItemSuccess(item.id, newItemId, itemName)
                                                                                        }
                                                                                        onCancel={() => {
                                                                                            setShowNewItemDialog(false);
                                                                                            setSelectedItemForNewCadaster(null);
                                                                                        }}
                                                                                    />
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        )}
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteItem(item.id)}
                                                                            className="text-destructive hover:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Cards para Mobile */}
                                    <div className="md:hidden space-y-4">
                                        {invoiceItems.map((item) => (
                                            <Card key={item.id} className="border">
                                                <CardContent className="p-4">
                                                    <div className="space-y-4">
                                                        {/* Header com status */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                {item.matchedItemId ? (
                                                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Identificado
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                                        Não identificado
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2 ml-2">
                                                                {item.isEditing ? (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleEditItem(item.id, 'isEditing', false)}
                                                                        >
                                                                            <Check className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleEditItem(item.id, 'isEditing', false)}
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleEditItem(item.id, 'isEditing', true)}
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        {!item.matchedItemId && (
                                                                            <Dialog
                                                                                open={showNewItemDialog && selectedItemForNewCadaster?.id === item.id}
                                                                                onOpenChange={(open) => {
                                                                                    setShowNewItemDialog(open);
                                                                                    if (!open) setSelectedItemForNewCadaster(null);
                                                                                }}
                                                                            >
                                                                                <DialogTrigger asChild>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        onClick={() => {
                                                                                            setSelectedItemForNewCadaster(item);
                                                                                            setShowNewItemDialog(true);
                                                                                        }}
                                                                                    >
                                                                                        <Plus className="h-4 w-4" />
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                                <DialogContent className="max-w-2xl">
                                                                                    <DialogHeader>
                                                                                        <DialogTitle>Cadastrar Novo Item</DialogTitle>
                                                                                        <DialogDescription>
                                                                                            Cadastre um novo item baseado na descrição da nota fiscal
                                                                                        </DialogDescription>
                                                                                    </DialogHeader>
                                                                                    <NewItemForm
                                                                                        initialDescription={item.description}
                                                                                        onSuccess={(newItemId, itemName) =>
                                                                                            handleNewItemSuccess(item.id, newItemId, itemName)
                                                                                        }
                                                                                        onCancel={() => {
                                                                                            setShowNewItemDialog(false);
                                                                                            setSelectedItemForNewCadaster(null);
                                                                                        }}
                                                                                    />
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        )}
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteItem(item.id)}
                                                                            className="text-destructive hover:text-destructive"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Descrição */}
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Descrição da NF</Label>
                                                            {item.isEditing ? (
                                                                <Textarea
                                                                    value={item.description}
                                                                    onChange={(e) => handleEditItem(item.id, 'description', e.target.value)}
                                                                    className="min-h-[60px] mt-1"
                                                                />
                                                            ) : (
                                                                <p className="font-medium mt-1">{item.description}</p>
                                                            )}
                                                        </div>

                                                        {/* Quantidades */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label className="text-sm text-muted-foreground">Qtd. NF</Label>
                                                                {item.isEditing ? (
                                                                    <Input
                                                                        type="number"
                                                                        value={item.quantity}
                                                                        onChange={(e) => handleEditItem(item.id, 'quantity', Number(e.target.value))}
                                                                        className="mt-1"
                                                                    />
                                                                ) : (
                                                                    <p className="font-medium mt-1">{item.quantity} {item.unit}</p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <Label className="text-sm text-muted-foreground">Qtd. Entrada</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    value={item.entryQuantity}
                                                                    onChange={(e) => handleEditItem(item.id, 'entryQuantity', Number(e.target.value))}
                                                                    className="mt-1"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Item correspondente */}
                                                        <div>
                                                            <Label className="text-sm text-muted-foreground">Item Correspondente</Label>
                                                            <Select
                                                                value={item.matchedItemId || "none"}
                                                                onValueChange={(value) => handleItemMatch(item.id, value === "none" ? "" : value)}
                                                            >
                                                                <SelectTrigger className="mt-1">
                                                                    <SelectValue placeholder="Selecionar item..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">Nenhum item</SelectItem>
                                                                    {items.map((dbItem) => (
                                                                        <SelectItem key={dbItem.id} value={dbItem.id}>
                                                                            {dbItem.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Ações finais */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const newItem: InvoiceItem = {
                                                    id: `manual-${Date.now()}`,
                                                    description: "Item adicionado manualmente",
                                                    quantity: 1,
                                                    entryQuantity: 1,
                                                    unit: "UN",
                                                    isEditing: true,
                                                    isNew: true
                                                };
                                                setInvoiceItems(prev => [...prev, newItem]);
                                            }}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Adicionar Item Manual
                                        </Button>

                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setInvoiceItems([]);
                                                    setUploadedFile(null);
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleAddToStock}
                                                disabled={invoiceItems.filter(item => item.matchedItemId && item.entryQuantity > 0).length === 0}
                                            >
                                                <Package className="h-4 w-4 mr-2" />
                                                Adicionar ao Estoque ({invoiceItems.filter(item => item.matchedItemId && item.entryQuantity > 0).length})
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}