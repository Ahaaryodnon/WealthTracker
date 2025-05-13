import { Link } from "wouter";
import { Twitter, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Wealth Transparency</h3>
            <p className="text-gray-400 text-sm">
              Revealing passive income sources and wealth tax implications for public figures through official data.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/methodology">
                  <a className="text-gray-300 hover:text-white transition">Methodology</a>
                </Link>
              </li>
              <li>
                <Link href="/data-sources">
                  <a className="text-gray-300 hover:text-white transition">Data Sources</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">API Documentation</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Research Papers</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about">
                  <a className="text-gray-300 hover:text-white transition">Our Mission</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-300 hover:text-white transition">The Team</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Partners</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Contact Us</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to receive updates when new data is added.
            </p>
            <div className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-primary-800 text-white border-primary-800 rounded-r-none focus:ring-sky-500"
              />
              <Button variant="default" className="bg-sky-500 hover:bg-sky-600 rounded-l-none">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2023 Wealth Transparency Project. All data sourced from public records.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
