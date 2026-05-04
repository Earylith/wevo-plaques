import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DemoPreviewSection from "@/components/DemoPreviewSection";
import FeaturesSection from "@/components/FeaturesSection";
import DifferentiationSection from "@/components/DifferentiationSection";
import PricingSection from "@/components/PricingSection";
import ProSection from "@/components/ProSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <DemoPreviewSection />
        <FeaturesSection />
        <DifferentiationSection />
        <PricingSection />
        <ProSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
