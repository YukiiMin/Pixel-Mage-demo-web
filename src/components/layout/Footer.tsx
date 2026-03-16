const Footer = () => (
	<footer id="footer" className="py-12 border-t border-border">
		<div className="container mx-auto px-6">
			<div className="grid md:grid-cols-3 gap-8">
				<div>
					<span className="text-xl font-heading font-bold gradient-gold-purple">
						PixelMage
					</span>
					<p className="text-sm text-muted-foreground mt-2 max-w-xs">
						Nền tảng Tarot AI hàng đầu — đọc bài, sưu tập thẻ NFC, kết nối vũ
						trụ.
					</p>
				</div>
				<div>
					<h4 className="font-heading font-semibold mb-3 text-sm">Liên kết</h4>
					<ul className="space-y-2 text-sm text-muted-foreground">
						<li>
							<a href="#hero" className="hover:text-primary transition-colors">
								Trang chủ
							</a>
						</li>
						<li>
							<a
								href="#how-it-works"
								className="hover:text-primary transition-colors"
							>
								Cách dùng
							</a>
						</li>
						<li>
							<a
								href="#download"
								className="hover:text-primary transition-colors"
							>
								Tải App
							</a>
						</li>
						<li>
							<a
								href="/marketplace"
								className="hover:text-primary transition-colors"
							>
								Marketplace
							</a>
						</li>
						<li>
							<a
								href="/my-cards"
								className="hover:text-primary transition-colors"
							>
								My Cards
							</a>
						</li>
						<li>
							<a href="/orders" className="hover:text-primary transition-colors">
								Orders
							</a>
						</li>
						<li>
							<a href="/profile" className="hover:text-primary transition-colors">
								Profile
							</a>
						</li>
						<li>
							<a href="/login" className="hover:text-primary transition-colors">
								Đăng Nhập
							</a>
						</li>
						<li>
							<a href="/register" className="hover:text-primary transition-colors">
								Đăng Ký
							</a>
						</li>
					</ul>
				</div>
				<div>
					<h4 className="font-heading font-semibold mb-3 text-sm">Liên hệ</h4>
					<p className="text-sm text-muted-foreground">contact@pixelmage.vn</p>
					<p className="text-sm text-muted-foreground mt-1">
						© 2026 PixelMage. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	</footer>
);

export default Footer;
