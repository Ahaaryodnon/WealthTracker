import { Skeleton } from "@/components/ui/skeleton";
import { PublicFigure } from "@shared/schema";
import { BarChart, ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { useEffect, useState } from "react";

interface DataVisualizationProps {
  profiles: PublicFigure[];
  isLoading: boolean;
}

export default function DataVisualization({ profiles, isLoading }: DataVisualizationProps) {
  const [incomeDistributionData, setIncomeDistributionData] = useState<any[]>([]);
  const [wealthTaxData, setWealthTaxData] = useState<any[]>([]);
  const [incomeSourcesData, setIncomeSourcesData] = useState<any[]>([]);
  
  useEffect(() => {
    if (profiles.length > 0) {
      // Prepare income distribution data
      const incomeRanges = [
        { name: '<100K', min: 0, max: 100000 },
        { name: '100K-1M', min: 100000, max: 1000000 },
        { name: '1M-10M', min: 1000000, max: 10000000 },
        { name: '10M-100M', min: 10000000, max: 100000000 },
        { name: '>100M', min: 100000000, max: Infinity }
      ];
      
      const incomeData = incomeRanges.map(range => {
        const count = profiles.filter(p => 
          p.passiveIncome >= range.min && p.passiveIncome < range.max
        ).length;
        
        return {
          name: range.name,
          count
        };
      });
      setIncomeDistributionData(incomeData);
      
      // Prepare wealth tax data by category
      const categoryTaxMap = new Map<string, number>();
      profiles.forEach(profile => {
        const category = profile.category;
        const currentTax = categoryTaxMap.get(category) || 0;
        categoryTaxMap.set(category, currentTax + profile.wealthTax);
      });
      
      const taxData = Array.from(categoryTaxMap.entries()).map(([name, value]) => ({
        name,
        value
      }));
      setWealthTaxData(taxData);
      
      // Prepare income sources data
      const sourceData = [
        { name: 'Q1', dividends: 0, property: 0, investments: 0, royalties: 0 },
        { name: 'Q2', dividends: 0, property: 0, investments: 0, royalties: 0 },
        { name: 'Q3', dividends: 0, property: 0, investments: 0, royalties: 0 },
        { name: 'Q4', dividends: 0, property: 0, investments: 0, royalties: 0 }
      ];
      
      // In a real app, we would have actual source breakdown data
      // This is just an example visualization with mock data
      profiles.slice(0, 4).forEach((profile, idx) => {
        const total = profile.passiveIncome;
        sourceData[idx].dividends = Math.floor(total * 0.35);
        sourceData[idx].property = Math.floor(total * 0.25);
        sourceData[idx].investments = Math.floor(total * 0.3);
        sourceData[idx].royalties = Math.floor(total * 0.1);
      });
      
      setIncomeSourcesData(sourceData);
    }
  }, [profiles]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Insights Overview</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="mt-8">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Insights Overview</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Passive Income Distribution */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Passive Income Distribution</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeDistributionData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3e48e5" name="Number of Individuals" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">Distribution of annual passive income across different wealth brackets</p>
          </div>
          
          {/* Chart 2: Wealth Tax Impact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Potential 1% Wealth Tax Impact</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={wealthTaxData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {wealthTaxData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `£${(value as number).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-2">Breakdown of potential tax revenue from a 1% wealth tax above £2 million</p>
          </div>
        </div>
        
        <div className="mt-8">
          {/* Chart 3: Passive Income Sources */}
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Passive Income Sources</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={incomeSourcesData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `£${(value as number).toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="dividends" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="property" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="investments" stackId="1" stroke="#ffc658" fill="#ffc658" />
                <Area type="monotone" dataKey="royalties" stackId="1" stroke="#ff8042" fill="#ff8042" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">Breakdown of passive income sources including dividends, property, investments, and royalties</p>
        </div>
      </div>
    </section>
  );
}
