import Link from "next/link";

// Favicon URL for the project
const FAVICON_URL =
	"https://res.cloudinary.com/yukiimin-cloud/image/upload/v1775797205/favicon_pto0em.png";

const HeaderLogo = () => (
	<Link
		href="/"
		className="flex items-center gap-2"
		aria-label="Đi tới trang chủ PixelMage"
	>
		<img src={FAVICON_URL} alt="PixelMage" className="h-7 w-7 object-contain" />
		<span className="text-2xl font-heading font-bold gradient-gold-purple">
			PixelMage
		</span>
	</Link>
);

export default HeaderLogo;
