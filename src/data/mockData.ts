// Centralized mock data for the stock management system

export interface Item {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  expiryDate?: string;
}

export interface StandardList {
  id: string;
  name: string;
  description: string;
  items: ListItem[];
  createdAt: string;
}

export interface ListItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'entrada' | 'saida';
  quantity: number;
  date: string;
  description?: string;
}

// Categories
export const categories = [
  "Todos",
  "Alimentação",
  "Limpeza", 
  "Escritório",
  "Descartáveis",
  "Bebidas"
];

// Units
export const units = [
  "kg",
  "g", 
  "l",
  "ml",
  "unidade",
  "pacote",
  "caixa",
  "lata",
  "garrafa"
];

// Mock Items
export const mockItems: Item[] = [
  { id: "1", name: "Arroz branco", category: "Alimentação", unit: "kg", currentStock: 25, expiryDate: "2024-12-31" },
  { id: "2", name: "Feijão preto", category: "Alimentação", unit: "kg", currentStock: 15, expiryDate: "2024-11-30" },
  { id: "3", name: "Molho de tomate", category: "Alimentação", unit: "lata", currentStock: 30, expiryDate: "2025-06-15" },
  { id: "4", name: "Copo descartável", category: "Descartáveis", unit: "pacote", currentStock: 8, expiryDate: "2026-01-01" },
  { id: "5", name: "Detergente", category: "Limpeza", unit: "l", currentStock: 12, expiryDate: "2025-03-20" },
  { id: "6", name: "Papel A4", category: "Escritório", unit: "pacote", currentStock: 20, expiryDate: "" },
  { id: "7", name: "Água mineral", category: "Bebidas", unit: "garrafa", currentStock: 45, expiryDate: "2024-08-20" },
  { id: "8", name: "Café em pó", category: "Alimentação", unit: "kg", currentStock: 5, expiryDate: "2024-10-15" },
  { id: "9", name: "Sabão em pó", category: "Limpeza", unit: "kg", currentStock: 3, expiryDate: "2025-07-10" },
  { id: "10", name: "Guardanapo", category: "Descartáveis", unit: "pacote", currentStock: 18, expiryDate: "2025-12-01" }
];

// Mock Standard Lists
export const mockStandardLists: StandardList[] = [
  {
    id: "1",
    name: "Café da Manhã",
    description: "Lista padrão para café da manhã",
    items: [
      { itemId: "1", itemName: "Arroz branco", quantity: 2, unit: "kg" },
      { itemId: "2", itemName: "Feijão preto", quantity: 1, unit: "kg" },
      { itemId: "3", itemName: "Molho de tomate", quantity: 3, unit: "lata" },
      { itemId: "8", itemName: "Café em pó", quantity: 0.5, unit: "kg" }
    ],
    createdAt: "2024-01-15"
  },
  {
    id: "2", 
    name: "Almoço Completo",
    description: "Lista padrão para almoço",
    items: [
      { itemId: "1", itemName: "Arroz branco", quantity: 5, unit: "kg" },
      { itemId: "2", itemName: "Feijão preto", quantity: 3, unit: "kg" },
      { itemId: "4", itemName: "Copo descartável", quantity: 2, unit: "pacote" },
      { itemId: "10", itemName: "Guardanapo", quantity: 1, unit: "pacote" }
    ],
    createdAt: "2024-01-20"
  },
  {
    id: "3",
    name: "Limpeza Geral",
    description: "Materiais para limpeza completa",
    items: [
      { itemId: "5", itemName: "Detergente", quantity: 2, unit: "l" },
      { itemId: "9", itemName: "Sabão em pó", quantity: 1, unit: "kg" }
    ],
    createdAt: "2024-01-25"
  }
];

// Mock Stock Movements (for reports and charts)
export const mockStockMovements: StockMovement[] = [
  { id: "1", itemId: "1", itemName: "Arroz branco", type: "entrada", quantity: 10, date: "2024-01-01", description: "Compra mensal" },
  { id: "2", itemId: "1", itemName: "Arroz branco", type: "saida", quantity: 3, date: "2024-01-05", description: "Café da manhã" },
  { id: "3", itemId: "2", itemName: "Feijão preto", type: "entrada", quantity: 8, date: "2024-01-02", description: "Compra mensal" },
  { id: "4", itemId: "2", itemName: "Feijão preto", type: "saida", quantity: 2, date: "2024-01-06", description: "Almoço" },
  { id: "5", itemId: "3", itemName: "Molho de tomate", type: "entrada", quantity: 20, date: "2024-01-03", description: "Estoque de segurança" },
  { id: "6", itemId: "4", itemName: "Copo descartável", type: "saida", quantity: 1, date: "2024-01-07", description: "Evento" },
  { id: "7", itemId: "5", itemName: "Detergente", type: "entrada", quantity: 5, date: "2024-01-04", description: "Compra trimestral" },
  { id: "8", itemId: "7", itemName: "Água mineral", type: "saida", quantity: 10, date: "2024-01-08", description: "Consumo diário" },
  { id: "9", itemId: "8", itemName: "Café em pó", type: "saida", quantity: 1, date: "2024-01-09", description: "Café da manhã" }
];

// Helper functions
export const getItemById = (id: string): Item | undefined => {
  return mockItems.find(item => item.id === id);
};

export const getStandardListById = (id: string): StandardList | undefined => {
  return mockStandardLists.find(list => list.id === id);
};

export const getItemsByCategory = (category: string): Item[] => {
  if (category === "Todos") return mockItems;
  return mockItems.filter(item => item.category === category);
};

export const getExpiringItems = (daysAhead = 30): Item[] => {
  const today = new Date();
  const futureDate = new Date(today.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
  
  return mockItems.filter(item => {
    if (!item.expiryDate) return false;
    const expiry = new Date(item.expiryDate);
    return expiry <= futureDate && expiry > today;
  });
};

export const getLowStockItems = (threshold = 10): Item[] => {
  return mockItems.filter(item => item.currentStock <= threshold);
};