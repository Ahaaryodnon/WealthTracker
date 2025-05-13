import { Coins, Users, PiggyBank } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppStats } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface StatsSummaryProps {
  isLoading: boolean;
  error: boolean;
  stats?: AppStats;
}

export default function StatsSummary({ isLoading, error, stats }: StatsSummaryProps) {
  return (
    <section className="py-8 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total figures monitored */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Total Public Figures Monitored</p>
            <div className="flex items-center space-x-4">
              <Users className="h-10 w-10 text-primary-700" />
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : error ? (
                <span className="text-3xl font-bold font-mono text-red-500">Error</span>
              ) : (
                <span className="text-3xl font-bold font-mono text-primary-800">
                  {stats?.totalProfiles.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          {/* Combined passive income */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Combined Annual Passive Income</p>
            <div className="flex items-center space-x-4">
              <Coins className="h-10 w-10 text-sky-500" />
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : error ? (
                <span className="text-3xl font-bold font-mono text-red-500">Error</span>
              ) : (
                <span className="text-3xl font-bold font-mono text-primary-800">
                  {formatCurrency(stats?.totalPassiveIncome || 0, true)}
                </span>
              )}
            </div>
          </div>
          
          {/* Potential wealth tax */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm mb-1">Potential 1% Wealth Tax Revenue</p>
            <div className="flex items-center space-x-4">
              <PiggyBank className="h-10 w-10 text-green-600" />
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : error ? (
                <span className="text-3xl font-bold font-mono text-red-500">Error</span>
              ) : (
                <span className="text-3xl font-bold font-mono text-primary-800">
                  {formatCurrency(stats?.potentialTaxRevenue || 0, true)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
