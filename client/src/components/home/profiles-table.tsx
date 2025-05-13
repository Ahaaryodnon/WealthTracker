import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PublicFigure } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfilesTableProps {
  profiles: PublicFigure[];
  isLoading: boolean;
  error: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export default function ProfilesTable({
  profiles,
  isLoading,
  error,
  totalCount,
  currentPage,
  totalPages,
  itemsPerPage,
  setCurrentPage,
  sortBy,
  setSortBy,
}: ProfilesTableProps) {
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Politicians":
        return "bg-blue-100 text-blue-800";
      case "Business Leaders":
        return "bg-purple-100 text-purple-800";
      case "Celebrities":
        return "bg-pink-100 text-pink-800";
      case "Sports":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };
  
  if (error) {
    return (
      <section>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Failed to load data</h3>
              <p className="text-gray-600">There was an error fetching the public figures data. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }
  
  if (isLoading) {
    return (
      <section>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Public Figures</h3>
            <Skeleton className="h-10 w-48" />
          </div>
          
          <div className="hidden md:block">
            <Skeleton className="h-96 w-full" />
          </div>
          
          <div className="md:hidden space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Public Figures</h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Passive Income (Highest)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Passive Income (Highest)">Passive Income (Highest)</SelectItem>
                <SelectItem value="Wealth Tax Impact (Highest)">Wealth Tax Impact (Highest)</SelectItem>
                <SelectItem value="Total Wealth (Highest)">Total Wealth (Highest)</SelectItem>
                <SelectItem value="Name (A-Z)">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table for desktop */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Estimated Wealth</TableHead>
                <TableHead className="text-right">Annual Passive Income</TableHead>
                <TableHead className="text-right">Potential Wealth Tax</TableHead>
                <TableHead>Data Sources</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 bg-gray-200 text-gray-500">
                        <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                        <div className="text-sm text-gray-500">{profile.title}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(profile.category)}>
                      {profile.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(profile.estimatedWealth, true)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(profile.passiveIncome, true)}
                    </div>
                    <div className="text-xs text-gray-500">per year</div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(profile.wealthTax, true)}
                    </div>
                    <div className="text-xs text-gray-500">per year</div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {profile.dataSources.map((source, idx) => (
                        <Badge key={idx} variant="outline" className="bg-gray-100 text-xs font-normal">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {profiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">No public figures matching your criteria</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Cards for mobile view */}
        <div className="md:hidden space-y-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Avatar className="h-10 w-10 bg-gray-200 text-gray-500">
                  <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                  <div className="flex items-center">
                    <Badge variant="outline" className={getCategoryColor(profile.category)}>
                      {profile.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">Estimated Wealth</div>
                  <div className="text-gray-900 font-medium font-mono">
                    {formatCurrency(profile.estimatedWealth, true)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">Annual Passive Income</div>
                  <div className="text-gray-900 font-medium font-mono">
                    {formatCurrency(profile.passiveIncome, true)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">Potential Wealth Tax</div>
                  <div className="text-green-600 font-medium font-mono">
                    {formatCurrency(profile.wealthTax, true)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded">
                  <div className="text-gray-500">Data Sources</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.dataSources.map((source, idx) => (
                      <Badge key={idx} variant="outline" className="bg-gray-100 text-xs font-normal">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {profiles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No public figures matching your criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative rounded-l-md"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
                    const pageToShow = totalPages <= 5 
                      ? i + 1 
                      : currentPage <= 3 
                        ? i + 1 
                        : currentPage >= totalPages - 2 
                          ? totalPages - 4 + i 
                          : currentPage - 2 + i;
                    
                    return (
                      <Button
                        key={pageToShow}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        className={`relative ${currentPage === pageToShow ? "bg-sky-500 hover:bg-sky-500" : ""}`}
                        onClick={() => setCurrentPage(pageToShow)}
                      >
                        {pageToShow}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <Button variant="outline" disabled className="relative">
                          ...
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="relative hidden md:inline-flex"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative rounded-r-md"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
            
            {/* Mobile pagination */}
            <div className="flex sm:hidden w-full justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700 self-center">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
