import MethodologySection from "@/components/methodology/methodology-section";

export default function Methodology() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-primary-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Methodology</h1>
          <p className="text-gray-300">
            Learn about how we calculate passive income and wealth tax statistics
          </p>
        </div>
      </section>
      
      <MethodologySection />
    </div>
  );
}
