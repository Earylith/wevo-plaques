import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import DemoPreviewSection from "@/components/DemoPreviewSection";
import LivretsDemoSection from "@/components/LivretsDemoSection";
import { chargerVitrines } from "@/lib/server/vitrines";
import FeaturesSection from "@/components/FeaturesSection";
import DifferentiationSection from "@/components/DifferentiationSection";
import PricingSection from "@/components/PricingSection";
import ProSection from "@/components/ProSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default async function Home() {
  const vitrines = await chargerVitrines();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <DifferentiationSection />
        <SolutionSection />
        <DemoPreviewSection />
        <LivretsDemoSection vitrines={vitrines} />
        <FeaturesSection />
        <PricingSection />
        <ProSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
