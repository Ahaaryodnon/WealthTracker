import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LineChart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Methodology", path: "/methodology" },
  { name: "Data Sources", path: "/data-sources" },
  { name: "About", path: "/about" },
];

export default function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-primary-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <LineChart className="h-6 w-6 text-sky-400" />
          <h1 className="text-xl font-bold md:text-2xl">Wealth Transparency</h1>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`text-sm transition ${
                  location === item.path
                    ? "text-white font-medium"
                    : "text-gray-200 hover:text-white"
                }`}
              >
                {item.name}
              </a>
            </Link>
          ))}
        </div>
        
        {/* Mobile Navigation */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px] bg-primary-900 text-white border-none">
            <nav className="flex flex-col space-y-4 mt-8">
              {navItems.map((item) => (
                <SheetClose asChild key={item.path}>
                  <Link href={item.path}>
                    <a
                      className={`py-2 px-4 rounded-md ${
                        location === item.path
                          ? "bg-primary-800 text-white font-medium"
                          : "text-gray-200 hover:bg-primary-800 hover:text-white"
                      }`}
                    >
                      {item.name}
                    </a>
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
