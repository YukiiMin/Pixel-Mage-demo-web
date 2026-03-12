import DownloadSection from "@/components/customer/DownloadSection";
import FeaturedSection from "@/components/customer/FeaturedSection";
import HeroSection from "@/components/customer/HeroSection";
import HowItWorks from "@/components/customer/HowItWorks";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import StarBackground from "@/components/ui/star-background";

export default function HomePage() {
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
}
