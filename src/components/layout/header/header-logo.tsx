import Link from "next/link";

const HeaderLogo = () => (
	<Link
		href="/"
		className="flex items-center gap-2"
		aria-label="Đi tới trang chủ PixelMage"
	>
		<span className="text-2xl font-heading font-bold gradient-gold-purple">
			PixelMage
		</span>
	</Link>
);

export default HeaderLogo;
