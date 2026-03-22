"use client";

import dynamic from "next/dynamic";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import HeroSection from "@/features/landing/components/hero-section";

// StarBackground is purely visual canvas — no SSR needed
const StarBackground = dynamic(
	() => import("@/components/ui/star-background"),
	{ ssr: false },
);

// Below-fold sections: lazy load with skeleton placeholders
const FeaturedSection = dynamic(
	() => import("@/features/landing/components/featured-section"),
	{
		loading: () => (
			<section className="py-24">
				<div className="container mx-auto px-6 space-y-6">
					<Skeleton className="h-8 w-48 mx-auto" />
					<div className="grid md:grid-cols-3 gap-6">
						<Skeleton className="h-44 rounded-2xl" />
						<Skeleton className="h-44 rounded-2xl" />
						<Skeleton className="h-44 rounded-2xl" />
					</div>
				</div>
			</section>
		),
	},
);

const HowItWorks = dynamic(
	() => import("@/features/landing/components/how-it-works"),
	{
		loading: () => (
			<section className="py-24">
				<div className="container mx-auto px-6 space-y-6">
					<Skeleton className="h-8 w-56 mx-auto" />
					<div className="grid md:grid-cols-2 gap-6">
						<Skeleton className="h-36 rounded-2xl" />
						<Skeleton className="h-36 rounded-2xl" />
					</div>
				</div>
			</section>
		),
	},
);

const DownloadSection = dynamic(
	() => import("@/features/landing/components/download-section"),
	{
		loading: () => (
			<section className="py-24">
				<div className="container mx-auto px-6 flex flex-col md:flex-row gap-8 items-center">
					<Skeleton className="h-48 w-full md:w-1/2 rounded-2xl" />
					<Skeleton className="h-48 w-full md:w-1/2 rounded-2xl" />
				</div>
			</section>
		),
	},
);

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
