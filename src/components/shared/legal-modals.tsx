"use client";

import type React from "react";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Component nội dung Điều khoản dịch vụ - Tách ra để dùng chung cho cả Pop-up và Page
 */
export function TermsOfServiceContent() {
	return (
		<div className="space-y-6 text-sm text-foreground/80 leading-relaxed pb-6">
			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					1. Giới Thiệu Chung
				</h3>
				<p>
					1.1. Pixel Mage là nền tảng kỹ thuật số kết hợp công nghệ Tarot AI,
					Sưu tầm Thẻ bài kỹ thuật số (Gacha/Marketplace) và Thẻ NFC vật lý.
				</p>
				<p>
					1.2. Khi đăng ký tài khoản, truy cập và sử dụng dịch vụ trên trang web
					("Pixel Mage"), bạn đồng ý chịu sự ràng buộc của toàn bộ Điều khoản
					Dịch vụ này.
				</p>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					2. Tài Khoản và Bảo Mật
				</h3>
				<p>
					2.1. Bạn phải cung cấp thông tin chính xác, đầy đủ (bao gồm tên,
					email, số điện thoại) khi đăng ký Tài khoản. Bạn cam kết không sử dụng
					thông tin của người khác.
				</p>
				<p>
					2.2. Bạn tự chịu trách nhiệm bảo mật mật khẩu, mã OTP và bất cứ hoạt
					động nào được thực hiện dưới tài khoản của mình.
				</p>
				<p>
					2.3. Cấm tuyệt đối hành vi mua bán, sang nhượng tài khoản bên ngoài hệ
					thống chính thức của Pixel Mage.
				</p>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					3. Giao Dịch và Gacha Pool / Marketplace
				</h3>
				<p>
					3.1. <b>Gacha Pool:</b> Khách hàng mua các gói phần thưởng ngẫu nhiên
					(Pack) thừa nhận rằng kết quả thẻ mở ra hoàn toàn dựa trên xác suất hệ
					thống. Pixel Mage không đảm bảo bạn sẽ luôn nhận được loại thẻ mong
					muốn.
				</p>
				<p>
					3.2. <b>Marketplace:</b> Các giao dịch mua bán thẻ giữa người chơi với
					người chơi trên Marketplace (nếu có) phải tuân theo khung định giá thị
					trường nội bộ. Tranh chấp do chuyển tiền ngoài hệ thống sẽ không được
					Pixel Mage giải quyết.
				</p>
				<p>
					3.3. Hành vi lợi dụng lỗi hệ thống (bug), gian lận thẻ hoặc bôi nhọ
					tính công bằng của nền kinh tế trong game sẽ dẫn đến khóa tài khoản
					vĩnh viễn.
				</p>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					4. Thẻ NFC Cứng Tích Hợp
				</h3>
				<p>
					4.1. Đối với thẻ vật lý NFC (nếu bạn yêu cầu ship/đổi mảnh thẻ), bạn
					chịu trách nhiệm khai báo đúng địa chỉ. Mọi rủi ro thất lạc do khai
					sai thông tin sẽ do bạn tự gánh chịu.
				</p>
				<p>
					4.2. Thẻ NFC chịu sự bảo hành do lỗi phần cứng (không đọc được chip)
					trong vòng 30 ngày kể từ ngày nhận. Lỗi do tác động vật lý (gãy, vô
					nước) sẽ không được bảo hành.
				</p>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					5. Tarot AI và Tính Chất Giải Trí
				</h3>
				<p>
					5.1. Dịch vụ phân tích Tarot bằng AI của chúng tôi (Explore Deck) hoàn
					toàn mang tính chất <b>Giải Trí, Tham Khảo và Tâm Linh giả định</b>.
				</p>
				<p>
					5.2. Pixel Mage hoàn toàn không chịu trách nhiệm liên quan đến các
					quyết định cá nhân, công việc, tâm lý, tài chính hoặc y tế mà bạn thực
					hiện dựa trên hệ thống Tarot AI cung cấp.
				</p>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					6. Quyền Sở Hữu Trí Tuệ
				</h3>
				<p>
					6.1. Tất cả nội dung trang web (bao gồm artwork thẻ, thiết kế, code,
					câu chữ AI) thuộc bản quyền độc quyền của Pixel Mage Team.
				</p>
				<p>
					6.2. Cấm mọi hành vi sao chép, làm giả thẻ NFC, bán lại artwork chưa
					có sự cho phép bằng văn bản.
				</p>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					7. Chấm Dứt Dịch Vụ
				</h3>
				<p>
					7.1. Ban quản trị Pixel Mage có quyền đơn phương từ chối phục vụ,
					khóa, hoặc xóa vĩnh viễn tài khoản mà không cần báo trước nếu phát
					hiện vi phạm bất kỳ điều khoản nào trên đây.
				</p>
				<p className="mt-4 italic text-xs text-muted-foreground">
					* Các Điều khoản Dịch vụ này có thể được chúng tôi thay đổi bất cứ lúc
					nào và sẽ có hiệu lực ngay khi đăng tải. Bạn nên thường xuyên kiểm tra
					chuyên mục này.
				</p>
			</section>
		</div>
	);
}

/**
 * Component hiển thị Điều khoản dịch vụ dưới dạng Popup (Dialog)
 */
export function TermsOfServiceDialog({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden border-border/50 glass-card bg-background/95 backdrop-blur-xl">
				<DialogHeader className="p-6 pb-4 border-b border-border/40">
					<DialogTitle className="text-2xl font-heading font-bold gradient-gold-purple">
						Điều khoản Dịch vụ - Pixel Mage
					</DialogTitle>
					<DialogDescription>
						Vui lòng đọc kỹ các điều khoản trước khi sử dụng hệ sinh thái trò
						chơi và dịch vụ của chúng tôi.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(85vh-100px)] p-6">
					<TermsOfServiceContent />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

/**
 * Component nội dung Chính sách bảo mật - Tách ra để dùng chung
 */
export function PrivacyPolicyContent() {
	return (
		<div className="space-y-6 text-sm text-foreground/80 leading-relaxed pb-6">
			<p>
				Tại Pixel Mage, bảo vệ quyền riêng tư của thiết bị và dữ liệu cá nhân
				của người dùng là ưu tiên cực kỳ quan trọng.
			</p>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					1. Thông Tin Chúng Tôi Thu Thập
				</h3>
				<p>Chúng tôi chỉ thu thập thông tin hợp pháp và phục vụ dịch vụ:</p>
				<ul className="list-disc pl-5 mt-2 space-y-1">
					<li>
						Dữ liệu tạo tài khoản: Họ tên, Email, Số điện thoại (dùng để vận
						chuyển thẻ NFC).
					</li>
					<li>
						Dữ liệu từ Google OAuth: Danh tính ID, Ảnh đại diện Google (nếu chọn
						Login Google).
					</li>
					<li>
						Dữ liệu hệ thống: Địa chỉ IP, trình duyệt (phục vụ chặn spam,
						hacker).
					</li>
				</ul>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					2. Sử Dụng Thông Tin Cá Nhân
				</h3>
				<ul className="list-disc pl-5 mt-2 space-y-1">
					<li>
						Hiển thị tên định danh trong bảng xếp hạng người chơi/Marketplace.
					</li>
					<li>Gửi email xác thực, OTP quên mật khẩu và biên lai thanh toán.</li>
					<li>
						Sử dụng thông tin thẻ bài (Lịch sử Roll Gacha) để minh bạch tính
						năng Random.
					</li>
					<li>
						Không bao giờ bán lịch sử bốc bài Tarot, thông tin ví cá nhân cho
						bất kỳ bên thứ ba nào.
					</li>
				</ul>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					3. Quyền của Chủ Thể Dữ Liệu (Nghị định 13/2023/NĐ-CP)
				</h3>
				<p>Với tư cách là Công dân/Người dùng web ở Việt Nam, bạn có quyền:</p>
				<ul className="list-disc pl-5 mt-2 space-y-1">
					<li>
						<b>Quyền được biết & Truy cập:</b> Yêu cầu xem dữ liệu nào đang được
						chúng tôi lưu giữ.
					</li>
					<li>
						<b>Quyền xóa dữ liệu (Right to Erasure):</b> Yêu cầu Pixel Mage xóa
						lịch sử dữ liệu tài khoản khỏi Hệ quản trị cơ sở dữ liệu. (Ngoại trừ
						các hóa đơn giao dịch theo pháp luật hiện hành).
					</li>
					<li>
						<b>Quyền rút lại sự đồng ý:</b> Ngừng sử dụng Dịch vụ và xóa tài
						khoản bất cứ lúc nào.
					</li>
				</ul>
				<p className="mt-2 text-xs text-muted-foreground italic">
					Để thực hiện quyền lợi này, hãy dùng email đăng ký của bạn gửi thư xác
					thực tới địa chỉ hỗ trợ của chúng tôi.
				</p>
			</section>

			<section>
				<h3 className="text-lg font-bold text-foreground mb-2">
					4. Bảo vệ Trẻ em
				</h3>
				<p>
					Pixel Mage tuyệt đối nghiêm cấm việc thu thập dữ liệu cá nhân của
					người dùng dưới 16 tuổi. Trẻ em dưới độ tuổi này chỉ được sử dụng nền
					tảng khi có sự bảo trợ vật lý từ người giám hộ.
				</p>
			</section>
		</div>
	);
}

/**
 * Component hiển thị Chính sách bảo mật dưới dạng Popup (Dialog)
 */
export function PrivacyPolicyDialog({
	children,
}: {
	children: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden border-border/50 glass-card bg-background/95 backdrop-blur-xl">
				<DialogHeader className="p-6 pb-4 border-b border-border/40">
					<DialogTitle className="text-2xl font-heading font-bold gradient-gold-purple">
						Chính sách Bảo mật - Pixel Mage
					</DialogTitle>
					<DialogDescription>
						Cập nhật mới nhất bởi Pixel Mage Studio nhằm tuân thủ pháp luật Việt
						Nam.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="h-full max-h-[calc(85vh-100px)] p-6">
					<PrivacyPolicyContent />
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
