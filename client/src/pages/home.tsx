import HeroSection from "@/components/home/hero-section";
import StatsSummary from "@/components/home/stats-summary";
import FilterSidebar from "@/components/home/filter-sidebar";
import DataVisualization from "@/components/home/data-visualization";
import ProfilesTable from "@/components/home/profiles-table";
import MethodologySection from "@/components/methodology/methodology-section";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicFigure, AppStats } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Politicians", "Business Leaders", "Celebrities", "Sports"
  ]);
  const [wealthRange, setWealthRange] = useState("All ranges");
  const [incomeRange, setIncomeRange] = useState("All ranges");
  const [dataSources, setDataSources] = useState<string[]>([
    "MPs' Register", "Companies House", "Forbes Lists", "Land Registry"
  ]);
  const [sortBy, setSortBy] = useState("Passive Income (Highest)");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch public figures data
  const {
    data: profiles = [],
    isLoading: isProfilesLoading,
    error: profilesError
  } = useQuery<PublicFigure[]>({
    queryKey: ['/api/public-figures'],
  });
  
  // Fetch stats summary data
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError
  } = useQuery<AppStats>({
    queryKey: ['/api/stats'],
  });
  
  // Filter profiles based on search and filter criteria
  const filteredProfiles = profiles.filter((profile) => {
    // Search by name
    if (searchQuery && !profile.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategories.length && !selectedCategories.includes(profile.category)) {
      return false;
    }
    
    // Filter by wealth range
    if (wealthRange !== "All ranges") {
      const wealth = profile.estimatedWealth;
      if (wealthRange === "£2M - £10M" && (wealth < 2000000 || wealth > 10000000)) return false;
      if (wealthRange === "£10M - £100M" && (wealth < 10000000 || wealth > 100000000)) return false;
      if (wealthRange === "£100M - £1B" && (wealth < 100000000 || wealth > 1000000000)) return false;
      if (wealthRange === "Over £1B" && wealth < 1000000000) return false;
    }
    
    // Filter by income range
    if (incomeRange !== "All ranges") {
      const income = profile.passiveIncome;
      if (incomeRange === "Under £100K" && income > 100000) return false;
      if (incomeRange === "£100K - £1M" && (income < 100000 || income > 1000000)) return false;
      if (incomeRange === "£1M - £10M" && (income < 1000000 || income > 10000000)) return false;
      if (incomeRange === "Over £10M" && income < 10000000) return false;
    }
    
    // Filter by data sources
    if (dataSources.length && !profile.dataSources.some(ds => dataSources.includes(ds))) {
      return false;
    }
    
    return true;
  });
  
  // Sort profiles based on selected sort option
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortBy === "Passive Income (Highest)") return b.passiveIncome - a.passiveIncome;
    if (sortBy === "Wealth Tax Impact (Highest)") return b.wealthTax - a.wealthTax;
    if (sortBy === "Total Wealth (Highest)") return b.estimatedWealth - a.estimatedWealth;
    if (sortBy === "Name (A-Z)") return a.name.localeCompare(b.name);
    return 0;
  });
  
  // Pagination
  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(sortedProfiles.length / ITEMS_PER_PAGE);
  const paginatedProfiles = sortedProfiles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <HeroSection 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      <StatsSummary 
        isLoading={isStatsLoading} 
        error={statsError !== null}
        stats={stats}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar 
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            wealthRange={wealthRange}
            setWealthRange={setWealthRange}
            incomeRange={incomeRange}
            setIncomeRange={setIncomeRange}
            dataSources={dataSources}
            setDataSources={setDataSources}
          />
          
          <div className="flex-1">
            <DataVisualization 
              profiles={profiles}
              isLoading={isProfilesLoading}
            />
            
            <ProfilesTable 
              profiles={paginatedProfiles}
              isLoading={isProfilesLoading}
              error={profilesError !== null}
              totalCount={sortedProfiles.length}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              sortBy={sortBy}
              setSortBy={setSortBy}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </div>
      </div>
      
      <MethodologySection />
    </>
  );
}
