import { FileText, Building, Home, BarChart3, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DataSources() {
  const sources = [
    {
      title: "MPs' Register of Financial Interests",
      icon: FileText,
      description: "The Register of Members' Financial Interests is maintained by the Parliamentary Commissioner for Standards. It lists MPs' financial interests, including income, property, shareholdings, and gifts.",
      url: "https://www.parliament.uk/mps-lords-and-offices/standards-and-financial-interests/parliamentary-commissioner-for-standards/registers-of-interests/register-of-members-financial-interests/",
      color: "text-blue-600"
    },
    {
      title: "Companies House",
      icon: Building,
      description: "Companies House is the United Kingdom's registrar of companies. It contains information about all limited companies including directors, shareholders, annual accounts, and corporate structure.",
      url: "https://www.gov.uk/government/organisations/companies-house",
      color: "text-purple-600"
    },
    {
      title: "HM Land Registry",
      icon: Home,
      description: "HM Land Registry maintains property ownership information across England and Wales. It provides data on property transactions, prices, and ownership.",
      url: "https://www.gov.uk/government/organisations/land-registry",
      color: "text-green-600"
    },
    {
      title: "Forbes Real-Time Billionaires",
      icon: BarChart3,
      description: "The Forbes Real-Time Billionaires list tracks the daily ups and downs of the world's richest people. The wealth estimates are updated in real-time during market hours.",
      url: "https://www.forbes.com/real-time-billionaires/",
      color: "text-amber-600"
    },
    {
      title: "SEC EDGAR Database",
      icon: FileText,
      description: "The Electronic Data Gathering, Analysis, and Retrieval (EDGAR) database provides free access to corporate information, allowing you to research a company's financial information and operations.",
      url: "https://www.sec.gov/edgar/searchedgar/companysearch.html",
      color: "text-red-600"
    },
    {
      title: "Sunday Times Rich List",
      icon: BarChart3,
      description: "The Sunday Times Rich List is the definitive guide to wealth in the United Kingdom, published annually by The Sunday Times.",
      url: "https://www.thetimes.co.uk/sunday-times-rich-list",
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-primary-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Data Sources</h1>
          <p className="text-gray-300">
            We aggregate data from these official and reputable sources
          </p>
        </div>
      </section>
      
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Our Data Sources</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {sources.map((source, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <source.icon className={`h-5 w-5 ${source.color}`} />
                    <CardTitle className="text-lg">{source.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4">
                    {source.description}
                  </CardDescription>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-sky-600 hover:text-sky-800"
                  >
                    Visit Source <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Data Collection & Processing</h3>
            <p className="text-gray-600 mb-4">
              Our team collects data from these sources using a combination of automated scraping tools and manual research. The data is then cleaned, normalized, and processed to ensure consistency across different reporting standards.
            </p>
            
            <h3 className="text-lg font-semibold mb-3">Data Freshness</h3>
            <p className="text-gray-600 mb-4">
              We update our database on the following schedule:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>MPs' Register of Financial Interests - Updated within 48 hours of official releases</li>
              <li>Companies House data - Updated weekly</li>
              <li>Land Registry data - Updated monthly</li>
              <li>Forbes Billionaires list - Updated daily</li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">Data Accuracy</h3>
            <p className="text-gray-600">
              While we strive for accuracy, all figures should be treated as estimates based on publicly available information. The actual wealth and income of individuals may differ from our calculations due to undisclosed assets, varying valuation methods, and timing differences.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
