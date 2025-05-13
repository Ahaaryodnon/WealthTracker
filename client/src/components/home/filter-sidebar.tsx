import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterSidebarProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  wealthRange: string;
  setWealthRange: (range: string) => void;
  incomeRange: string;
  setIncomeRange: (range: string) => void;
  dataSources: string[];
  setDataSources: (sources: string[]) => void;
}

export default function FilterSidebar({
  selectedCategories,
  setSelectedCategories,
  wealthRange,
  setWealthRange,
  incomeRange,
  setIncomeRange,
  dataSources,
  setDataSources
}: FilterSidebarProps) {
  
  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  const handleDataSourceChange = (source: string) => {
    if (dataSources.includes(source)) {
      setDataSources(dataSources.filter(s => s !== source));
    } else {
      setDataSources([...dataSources, source]);
    }
  };

  return (
    <aside className="w-full lg:w-64 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-lg font-semibold mb-4">Filter Results</h3>
        
        {/* Category filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Category</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="category-politicians" 
                checked={selectedCategories.includes("Politicians")}
                onCheckedChange={() => handleCategoryChange("Politicians")}
              />
              <Label htmlFor="category-politicians" className="text-sm">Politicians</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="category-business" 
                checked={selectedCategories.includes("Business Leaders")}
                onCheckedChange={() => handleCategoryChange("Business Leaders")}
              />
              <Label htmlFor="category-business" className="text-sm">Business Leaders</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="category-celebrities" 
                checked={selectedCategories.includes("Celebrities")}
                onCheckedChange={() => handleCategoryChange("Celebrities")}
              />
              <Label htmlFor="category-celebrities" className="text-sm">Celebrities</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="category-sports" 
                checked={selectedCategories.includes("Sports")}
                onCheckedChange={() => handleCategoryChange("Sports")}
              />
              <Label htmlFor="category-sports" className="text-sm">Sports Personalities</Label>
            </div>
          </div>
        </div>
        
        {/* Wealth range filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Wealth Range</Label>
          <Select value={wealthRange} onValueChange={setWealthRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All ranges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All ranges">All ranges</SelectItem>
              <SelectItem value="£2M - £10M">£2M - £10M</SelectItem>
              <SelectItem value="£10M - £100M">£10M - £100M</SelectItem>
              <SelectItem value="£100M - £1B">£100M - £1B</SelectItem>
              <SelectItem value="Over £1B">Over £1B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Passive income filter */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Annual Passive Income</Label>
          <Select value={incomeRange} onValueChange={setIncomeRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All ranges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All ranges">All ranges</SelectItem>
              <SelectItem value="Under £100K">Under £100K</SelectItem>
              <SelectItem value="£100K - £1M">£100K - £1M</SelectItem>
              <SelectItem value="£1M - £10M">£1M - £10M</SelectItem>
              <SelectItem value="Over £10M">Over £10M</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Data source filter */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Data Sources</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="source-mps" 
                checked={dataSources.includes("MPs' Register")}
                onCheckedChange={() => handleDataSourceChange("MPs' Register")}
              />
              <Label htmlFor="source-mps" className="text-sm">MPs' Financial Register</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="source-companies" 
                checked={dataSources.includes("Companies House")}
                onCheckedChange={() => handleDataSourceChange("Companies House")}
              />
              <Label htmlFor="source-companies" className="text-sm">Companies House</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="source-forbes" 
                checked={dataSources.includes("Forbes Lists")}
                onCheckedChange={() => handleDataSourceChange("Forbes Lists")}
              />
              <Label htmlFor="source-forbes" className="text-sm">Forbes Lists</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="source-land" 
                checked={dataSources.includes("Land Registry")}
                onCheckedChange={() => handleDataSourceChange("Land Registry")}
              />
              <Label htmlFor="source-land" className="text-sm">Land Registry</Label>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
