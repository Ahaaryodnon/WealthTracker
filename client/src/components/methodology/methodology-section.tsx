import { FileText, Building, Home, BarChart3 } from "lucide-react";

export default function MethodologySection() {
  return (
    <section className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Methodology & Data Sources</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">How We Calculate</h3>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 mb-2">Passive Income Calculation</h4>
                <p className="text-sm text-gray-600">
                  We aggregate income from dividends, property rentals, investment yields, and other non-salary sources as reported in official financial disclosures. Data is normalized across different reporting periods to provide annual figures.
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-base font-medium text-gray-900 mb-2">Wealth Estimation</h4>
                <p className="text-sm text-gray-600">
                  Total wealth is estimated using a combination of public declarations, company filings, equity holdings, property portfolios, and reputable third-party valuations such as the Forbes Billionaires list.
                </p>
              </div>
              
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-2">Wealth Tax Simulation</h4>
                <p className="text-sm text-gray-600">
                  We apply a hypothetical 1% annual tax on wealth exceeding £2 million. This calculation is meant to illustrate potential policy outcomes and is not a prediction of any specific tax legislation.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <ul className="space-y-4">
                <li className="flex">
                  <FileText className="h-5 w-5 text-sky-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-base font-medium text-gray-900">MPs' Register of Financial Interests</h4>
                    <p className="text-sm text-gray-600">Official parliamentary disclosures of income, property, shareholdings, and other financial interests.</p>
                    <a href="#" className="text-xs text-sky-600 hover:text-sky-800">Source Documentation →</a>
                  </div>
                </li>
                
                <li className="flex">
                  <Building className="h-5 w-5 text-sky-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-base font-medium text-gray-900">Companies House</h4>
                    <p className="text-sm text-gray-600">UK official corporate registry containing directorship information, company accounts, and shareholding data.</p>
                    <a href="#" className="text-xs text-sky-600 hover:text-sky-800">Source Documentation →</a>
                  </div>
                </li>
                
                <li className="flex">
                  <Home className="h-5 w-5 text-sky-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-base font-medium text-gray-900">HM Land Registry</h4>
                    <p className="text-sm text-gray-600">Official property ownership records including property values and transaction history.</p>
                    <a href="#" className="text-xs text-sky-600 hover:text-sky-800">Source Documentation →</a>
                  </div>
                </li>
                
                <li className="flex">
                  <BarChart3 className="h-5 w-5 text-sky-500 mt-1 mr-3" />
                  <div>
                    <h4 className="text-base font-medium text-gray-900">Forbes Billionaires List</h4>
                    <p className="text-sm text-gray-600">Reputable third-party valuations of the world's wealthiest individuals updated in real-time.</p>
                    <a href="#" className="text-xs text-sky-600 hover:text-sky-800">Source Documentation →</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Concept image: wealth tax visualization */}
        <div className="mt-12">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="w-full h-64 bg-gradient-to-r from-primary-900 to-sky-700 flex items-center justify-center">
              <svg width="600" height="200" viewBox="0 0 600 200" className="opacity-80">
                <rect x="50" y="150" width="50" height="30" fill="#ffffff" opacity="0.2" />
                <rect x="110" y="130" width="50" height="50" fill="#ffffff" opacity="0.3" />
                <rect x="170" y="100" width="50" height="80" fill="#ffffff" opacity="0.4" />
                <rect x="230" y="70" width="50" height="110" fill="#ffffff" opacity="0.5" />
                <rect x="290" y="50" width="50" height="130" fill="#ffffff" opacity="0.6" />
                <rect x="350" y="30" width="50" height="150" fill="#ffffff" opacity="0.7" />
                <rect x="410" y="20" width="50" height="160" fill="#ffffff" opacity="0.8" />
                <rect x="470" y="10" width="50" height="170" fill="#ffffff" opacity="0.9" />
                
                {/* Tax line */}
                <line x1="50" y1="50" x2="520" y2="50" stroke="#9ae6b4" strokeWidth="2" strokeDasharray="5,5" />
                <text x="520" y="45" fill="#ffffff" fontSize="12">Wealth Tax Threshold</text>
              </svg>
            </div>
            <div className="bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Understanding Wealth Inequality</h3>
              <p className="text-sm text-gray-600">
                Our transparency tool aims to provide factual, objective information about wealth distribution and passive income generation among public figures in the UK. By making this data accessible, we hope to inform public debate around taxation and economic policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
