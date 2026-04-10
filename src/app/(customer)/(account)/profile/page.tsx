import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { ProfilePage } from "@/features/profile/";

export default function ProfileRoute() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<StarBackground />
			<Header />
			<main className="relative z-10 pb-20 pt-28">
				<ProfilePage />
			</main>
			<Footer />
		</div>
	);
}
