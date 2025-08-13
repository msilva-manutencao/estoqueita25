
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockItems, categories } from "@/data/mockData";



const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))', 
  'hsl(var(--accent))',
  'hsl(var(--destructive))'
];

export function StockChart() {
  // Calculate stock by category for pie chart
  const totalGlobalStock = mockItems.reduce((sum, item) => sum + item.currentStock, 0);
  
  const stockByCategory = categories
    .filter(category => category !== "Todos")
    .map(category => {
      const categoryItems = mockItems.filter(item => item.category === category);
      const totalStock = categoryItems.reduce((sum, item) => sum + item.currentStock, 0);
      const itemCount = categoryItems.length;
      
      return {
        name: category,
        value: totalStock, // Usar estoque total para o gráfico de pizza
        itemCount: itemCount,
        stock: totalStock,
        percentage: totalStock > 0 ? ((totalStock / totalGlobalStock) * 100).toFixed(1) : "0"
      };
    })
    .filter(category => category.stock > 0)
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 4); // Pegar apenas as 4 maiores categorias

  // Debug log
  console.log("Top 4 categories by stock:", stockByCategory);





  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            <span className="font-medium">{data.itemCount}</span> tipos de itens
          </p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            <span className="font-medium">{data.value}</span> unidades em estoque
          </p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            <span className="font-medium">{data.percentage}%</span> do estoque total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Pie Chart - Top 4 Categories by Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição do Estoque por Categoria</CardTitle>
          <p className="text-sm text-muted-foreground">Top 4 categorias com maior estoque</p>
        </CardHeader>
        <CardContent>
          {stockByCategory.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">Nenhum dado disponível para exibir</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={stockByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {stockByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload?.percentage}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
