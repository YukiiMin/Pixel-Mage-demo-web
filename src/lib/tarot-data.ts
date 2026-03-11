export interface TarotCardData {
  id: number;
  name: string;
  nameVi: string;
  uprightMeaning: string;
  reversedMeaning: string;
}

export const MAJOR_ARCANA: TarotCardData[] = [
  { id: 0, name: "The Fool", nameVi: "Kẻ Ngốc", uprightMeaning: "Khởi đầu mới, tự do, phiêu lưu", reversedMeaning: "Liều lĩnh, thiếu suy nghĩ" },
  { id: 1, name: "The Magician", nameVi: "Nhà Ảo Thuật", uprightMeaning: "Sáng tạo, ý chí, kỹ năng", reversedMeaning: "Lừa dối, thiếu kế hoạch" },
  { id: 2, name: "The High Priestess", nameVi: "Nữ Tư Tế", uprightMeaning: "Trực giác, bí ẩn, nội tâm", reversedMeaning: "Bí mật, xa rời trực giác" },
  { id: 3, name: "The Empress", nameVi: "Hoàng Hậu", uprightMeaning: "Phong phú, nuôi dưỡng, tự nhiên", reversedMeaning: "Phụ thuộc, sáng tạo bị chặn" },
  { id: 4, name: "The Emperor", nameVi: "Hoàng Đế", uprightMeaning: "Quyền lực, cấu trúc, ổn định", reversedMeaning: "Độc đoán, thiếu kỷ luật" },
  { id: 5, name: "The Hierophant", nameVi: "Giáo Hoàng", uprightMeaning: "Truyền thống, hướng dẫn, đức tin", reversedMeaning: "Nổi loạn, thách thức quy tắc" },
  { id: 6, name: "The Lovers", nameVi: "Đôi Tình Nhân", uprightMeaning: "Tình yêu, hòa hợp, lựa chọn", reversedMeaning: "Mất cân bằng, xung đột" },
  { id: 7, name: "The Chariot", nameVi: "Cỗ Xe", uprightMeaning: "Chiến thắng, quyết tâm, kiểm soát", reversedMeaning: "Mất phương hướng, hung hăng" },
  { id: 8, name: "Strength", nameVi: "Sức Mạnh", uprightMeaning: "Can đảm, kiên nhẫn, nội lực", reversedMeaning: "Yếu đuối, tự nghi ngờ" },
  { id: 9, name: "The Hermit", nameVi: "Ẩn Sĩ", uprightMeaning: "Suy ngẫm, tìm kiếm sự thật", reversedMeaning: "Cô lập, cô đơn" },
  { id: 10, name: "Wheel of Fortune", nameVi: "Bánh Xe Vận Mệnh", uprightMeaning: "Vận may, chu kỳ, bước ngoặt", reversedMeaning: "Vận xui, kháng cự thay đổi" },
  { id: 11, name: "Justice", nameVi: "Công Lý", uprightMeaning: "Công bằng, sự thật, nhân quả", reversedMeaning: "Bất công, thiếu trách nhiệm" },
  { id: 12, name: "The Hanged Man", nameVi: "Người Treo", uprightMeaning: "Buông bỏ, góc nhìn mới", reversedMeaning: "Trì hoãn, kháng cự" },
  { id: 13, name: "Death", nameVi: "Tử Thần", uprightMeaning: "Kết thúc, chuyển đổi, tái sinh", reversedMeaning: "Sợ thay đổi, trì trệ" },
  { id: 14, name: "Temperance", nameVi: "Tiết Chế", uprightMeaning: "Cân bằng, kiên nhẫn, hài hòa", reversedMeaning: "Mất cân bằng, thái quá" },
  { id: 15, name: "The Devil", nameVi: "Ác Quỷ", uprightMeaning: "Ràng buộc, cám dỗ, bóng tối", reversedMeaning: "Giải phóng, thoát ràng buộc" },
  { id: 16, name: "The Tower", nameVi: "Tháp", uprightMeaning: "Sụp đổ, thức tỉnh, giải phóng", reversedMeaning: "Tránh thảm họa, sợ thay đổi" },
  { id: 17, name: "The Star", nameVi: "Ngôi Sao", uprightMeaning: "Hy vọng, cảm hứng, bình yên", reversedMeaning: "Tuyệt vọng, mất niềm tin" },
  { id: 18, name: "The Moon", nameVi: "Mặt Trăng", uprightMeaning: "Ảo ảnh, trực giác, tiềm thức", reversedMeaning: "Giải tỏa sợ hãi, rõ ràng" },
  { id: 19, name: "The Sun", nameVi: "Mặt Trời", uprightMeaning: "Niềm vui, thành công, sức sống", reversedMeaning: "Bi quan tạm thời" },
  { id: 20, name: "Judgement", nameVi: "Phán Xét", uprightMeaning: "Tái sinh, đánh giá, tha thứ", reversedMeaning: "Tự phán xét, nghi ngờ" },
  { id: 21, name: "The World", nameVi: "Thế Giới", uprightMeaning: "Hoàn thành, tích hợp, thành tựu", reversedMeaning: "Chưa hoàn thành, thiếu kết nối" },
];

export const TOPICS = [
  { key: "love" as const, emoji: "❤️", label: "Tình Yêu", color: "hsl(350, 80%, 55%)" },
  { key: "career" as const, emoji: "💼", label: "Sự Nghiệp", color: "hsl(210, 70%, 55%)" },
  { key: "general" as const, emoji: "⭐", label: "Tổng Quát", color: "hsl(45, 65%, 55%)" },
  { key: "finance" as const, emoji: "💰", label: "Tài Chính", color: "hsl(140, 60%, 45%)" },
];

export const SPREADS = [
  { key: "1-card" as const, label: "1 Lá", description: "Nhanh gọn, trả lời trực tiếp", count: 1 },
  { key: "3-cards" as const, label: "3 Lá", description: "Quá Khứ — Hiện Tại — Tương Lai", count: 3 },
  { key: "celtic-cross" as const, label: "Celtic Cross", description: "Phân tích chuyên sâu 10 lá", count: 10 },
];
