import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ searchQuery, setSearchQuery }: HeroSectionProps) {
  return (
    <section className="bg-primary-900 text-white pt-4 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            Revealing Passive Income & Potential Wealth Tax
          </h2>
          <p className="text-gray-300 mb-8">
            Explore how much passive income public figures earn and what a 1% wealth tax above £2 million would mean.
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search by name (e.g., 'Rishi Sunak')"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="h-5 w-5 absolute right-4 top-3.5 text-gray-400" />
          </div>
        </div>
      </div>
    </section>
  );
}
