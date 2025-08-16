# Componente de Nota Fiscal

Este módulo implementa a funcionalidade de importação e processamento de notas fiscais para entrada de itens no estoque.

## Funcionalidades

### 📄 Importação de Arquivos
- **Imagens (OCR)**: Suporte para JPG, JPEG, PNG
- **PDF**: Processamento de notas fiscais em PDF
- **XML**: Leitura de arquivos XML de notas fiscais

### 🔍 Processamento Inteligente
- Extração automática de dados dos arquivos
- Identificação automática de itens no banco de dados
- Algoritmo de correspondência por similaridade de texto

### ✏️ Edição e Conferência
- Edição inline de descrições e quantidades
- Seleção manual de itens correspondentes
- Opção de cadastrar novos itens não encontrados

### 📊 Visualização
- Interface responsiva (desktop e mobile)
- Estatísticas em tempo real
- Status visual dos itens (identificados/não identificados)

### 🎯 Entrada no Estoque
- Adição em lote de todos os itens conferidos
- Validação antes da entrada
- Feedback visual do processo

## Componentes

### InvoiceManager
Componente principal que gerencia todo o fluxo de importação e processamento de notas fiscais.

**Props**: Nenhuma

**Funcionalidades**:
- Upload de arquivos
- Processamento e extração de dados
- Gerenciamento da lista de itens
- Interface de conferência e edição

### NewItemForm
Formulário para cadastro de novos itens quando não encontrados no banco de dados.

**Props**:
- `initialDescription?: string` - Descrição inicial baseada na NF
- `onSuccess?: (itemId: string) => void` - Callback de sucesso
- `onCancel?: () => void` - Callback de cancelamento

## Fluxo de Uso

1. **Upload**: Usuário seleciona arquivo (imagem, PDF ou XML)
2. **Processamento**: Sistema extrai dados automaticamente
3. **Correspondência**: Sistema tenta identificar itens no banco
4. **Conferência**: Usuário revisa e ajusta correspondências
5. **Cadastro**: Novos itens podem ser cadastrados se necessário
6. **Entrada**: Todos os itens são adicionados ao estoque

## Tecnologias Utilizadas

- React + TypeScript
- Shadcn/ui para componentes
- Lucide React para ícones
- Hooks customizados para integração com Supabase

## Melhorias Futuras

- [ ] Integração real com OCR (Tesseract.js ou API externa)
- [ ] Parser real para arquivos XML de NF-e
- [ ] Processamento de PDF com PDF.js
- [ ] Cache de correspondências para melhor performance
- [ ] Histórico de notas fiscais processadas
- [ ] Validação de CNPJ/CPF do fornecedor
- [ ] Integração com API da Receita Federal