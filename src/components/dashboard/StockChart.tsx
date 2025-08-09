
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockItems, categories, mockStockMovements } from "@/data/mockData";

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))'
];

export function StockChart() {
  // Calculate stock by category for pie chart
  const stockByCategory = categories
    .filter(category => category !== "Todos")
    .map(category => {
      const categoryItems = mockItems.filter(item => item.category === category);
      const totalStock = categoryItems.reduce((sum, item) => sum + item.currentStock, 0);
      const totalValue = categoryItems.length;
      
      return {
        name: category,
        value: totalValue,
        stock: totalStock,
        percentage: totalValue > 0 ? ((totalValue / mockItems.length) * 100).toFixed(1) : "0"
      };
    })
    .filter(category => category.value > 0);

  // Calculate movement trends for bar chart
  const movementTrends = categories
    .filter(category => category !== "Todos")
    .map(category => {
      const categoryItems = mockItems.filter(item => item.category === category);
      const itemIds = categoryItems.map(item => item.id);
      
      const entries = mockStockMovements
        .filter(movement => itemIds.includes(movement.itemId) && movement.type === 'entrada')
        .reduce((sum, movement) => sum + movement.quantity, 0);
      
      const exits = mockStockMovements
        .filter(movement => itemIds.includes(movement.itemId) && movement.type === 'saida')
        .reduce((sum, movement) => sum + movement.quantity, 0);
      
      return {
        category,
        entradas: entries,
        saidas: exits,
        saldo: entries - exits
      };
    })
    .filter(category => category.entradas > 0 || category.saidas > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'percentage' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: payload[0].color }}>
            Tipos de itens: {data.value}
          </p>
          <p style={{ color: payload[0].color }}>
            Estoque total: {data.stock} unidades
          </p>
          <p style={{ color: payload[0].color }}>
            Porcentagem: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart - Stock Distribution by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição do Estoque por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stockByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {stockByCategory.map((category, index) => (
              <div key={category.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{category.name}: {category.value} itens</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Movement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentação por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={movementTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="entradas" fill="hsl(var(--success))" name="Entradas" radius={[2, 2, 0, 0]} />
              <Bar dataKey="saidas" fill="hsl(var(--destructive))" name="Saídas" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
