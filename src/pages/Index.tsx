import StarBackground from "@/components/ui/star-background";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/customer/HeroSection";
import FeaturedSection from "@/components/customer/FeaturedSection";
import HowItWorks from "@/components/customer/HowItWorks";
import DownloadSection from "@/components/customer/DownloadSection";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <FeaturedSection />
        <HowItWorks />
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
