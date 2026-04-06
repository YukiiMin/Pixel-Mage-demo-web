import { Facebook, Mail, Phone } from "lucide-react";
import Link from "next/link";
import {
	PrivacyPolicyDialog,
	TermsOfServiceDialog,
} from "@/components/shared/legal-modals";

const Footer = () => (
	<footer
		id="footer"
		className="py-16 border-t border-border bg-background/50 backdrop-blur-md"
	>
		<div className="container mx-auto px-6">
			<div className="grid md:grid-cols-4 gap-12">
				<div className="col-span-1 md:col-span-1">
					<span className="text-2xl font-heading font-bold gradient-gold-purple">
						PixelMage
					</span>
					<p className="text-sm text-muted-foreground mt-4 leading-relaxed">
						Nền tảng Tarot AI hàng đầu — Trải nghiệm thế giới Tarot huyền bí,
						sưu tập thẻ NFC độc bản và kết nối năng lượng vũ trụ.
					</p>
				</div>

				<div>
					<h4 className="font-heading font-semibold mb-6 text-sm uppercase tracking-wider text-foreground/80">
						Liên kết nhanh
					</h4>
					<ul className="space-y-3 text-sm text-muted-foreground">
						<li>
							<a
								href="/"
								className="hover:text-primary transition-colors flex items-center gap-2"
							>
								Trang chủ
							</a>
						</li>
						<li>
							<a
								href="/tarot"
								className="hover:text-primary transition-colors flex items-center gap-2"
							>
								Explore Deck
							</a>
						</li>
						<li>
							<a
								href="/marketplace"
								className="hover:text-primary transition-colors flex items-center gap-2"
							>
								Marketplace
							</a>
						</li>
						<li>
							<a
								href="/my-cards"
								className="hover:text-primary transition-colors flex items-center gap-2"
							>
								Bộ sưu tập thẻ
							</a>
						</li>
					</ul>
				</div>

				<div>
					<h4 className="font-heading font-semibold mb-6 text-sm uppercase tracking-wider text-foreground/80">
						Kết nối với chúng tôi
					</h4>
					<div className="flex gap-4">
						<a
							href="https://www.facebook.com/PixelMageB"
							target="_blank"
							rel="noopener noreferrer"
							className="p-2 rounded-full border border-border hover:bg-primary/10 hover:text-primary hover:border-primary transition-all shadow-sm"
							aria-label="Facebook"
						>
							<Facebook size={20} />
						</a>
						<a
							href="https://www.tiktok.com/@pixelmage48?_r=1&_t=ZS-95BsxUw1jaH"
							target="_blank"
							rel="noopener noreferrer"
							className="p-2 rounded-full border border-border hover:bg-primary/10 hover:text-primary hover:border-primary transition-all shadow-sm"
							aria-label="TikTok"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
							</svg>
						</a>
					</div>
				</div>

				<div>
					<h4 className="font-heading font-semibold mb-6 text-sm uppercase tracking-wider text-foreground/80">
						Thông tin liên hệ
					</h4>
					<ul className="space-y-4 text-sm text-muted-foreground font-medium">
						<li className="flex items-center gap-3">
							<Mail className="text-primary/70" size={18} />
							<a
								href="mailto:hoangtuanminh1104@gmail.com"
								className="underline hover:text-primary transition-colors"
							>
								hoangtuanminh1104@gmail.com
							</a>
						</li>
						<li className="flex items-center gap-3">
							<Phone className="text-primary/70" size={18} />
							<a
								href="tel:0903731347"
								className="hover:text-primary transition-colors"
							>
								0903731347 (Hotline)
							</a>
						</li>
					</ul>
				</div>
			</div>

			<div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
				<p className="text-xs text-muted-foreground/60">
					© 2026 PixelMage Studio. All rights reserved. Registered for EXE201.
				</p>
				<div className="flex gap-6 text-xs text-muted-foreground/60">
					<TermsOfServiceDialog>
						<button
							type="button"
							className="hover:text-primary transition-colors focus:outline-none"
						>
							Điều khoản dịch vụ
						</button>
					</TermsOfServiceDialog>
					<PrivacyPolicyDialog>
						<button
							type="button"
							className="hover:text-primary transition-colors focus:outline-none"
						>
							Chính sách bảo mật
						</button>
					</PrivacyPolicyDialog>
				</div>
			</div>
		</div>
	</footer>
);

export default Footer;
