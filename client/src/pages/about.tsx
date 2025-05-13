import { Card, CardContent } from "@/components/ui/card";
import { Info, Lightbulb, Check, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-primary-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">About The Project</h1>
          <p className="text-gray-300">
            Transparency on wealth and passive income of public figures
          </p>
        </div>
      </section>
      
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                The Wealth Transparency Project aims to increase public awareness and understanding of wealth distribution, passive income sources, and potential tax implications for public figures in the UK.
              </p>
              <p className="text-gray-600">
                By making this information accessible and understandable, we hope to promote informed public debate on economic policy, taxation, and financial transparency.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-primary-900 to-sky-700 rounded-xl text-white p-8 flex items-center justify-center">
              <div className="text-center">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-90" />
                <h3 className="text-xl font-semibold mb-2">Knowledge is Power</h3>
                <p className="opacity-80">
                  Democratizing access to financial information that affects public policy
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Principles</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Factual Accuracy</h3>
                      <p className="text-gray-600 text-sm">
                        We are committed to providing accurate information based solely on official and reputable sources.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Transparency</h3>
                      <p className="text-gray-600 text-sm">
                        We disclose our methodology, data sources, and any limitations in our analysis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Data Protection</h3>
                      <p className="text-gray-600 text-sm">
                        We only use publicly available information and respect privacy laws.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Educational Focus</h3>
                      <p className="text-gray-600 text-sm">
                        Our goal is to educate, not to sensationalize or vilify wealth.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">The Team</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600 mb-6">
                The Wealth Transparency Project is run by a team of economists, data scientists, and financial transparency advocates who believe in the public's right to understand wealth distribution and its implications.
              </p>
              
              <p className="text-gray-600 mb-6">
                Our team has backgrounds in economics, public policy, data analysis, and investigative journalism. We collaborate with academic institutions and non-profit organizations to ensure the rigor and accuracy of our methodologies.
              </p>
              
              <p className="text-gray-600">
                We are funded through grants and donations, and do not accept any funding that would compromise our independence or impartiality.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              For inquiries, collaboration opportunities, or feedback, please contact us at:
            </p>
            <p className="font-semibold mt-2">info@wealthtransparency.org</p>
          </div>
        </div>
      </section>
    </div>
  );
}
