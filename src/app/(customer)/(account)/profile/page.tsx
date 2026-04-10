import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header/index";
import StarBackground from "@/components/ui/star-background";
import { ProfilePage } from "@/features/profile/";

export default function ProfileRoute() {
	return (
		<div className="relative min-h-screen overflow-x-hidden">
			<main className="relative z-10 pb-20">
				<ProfilePage />
			</main>
		</div>
	);
}
