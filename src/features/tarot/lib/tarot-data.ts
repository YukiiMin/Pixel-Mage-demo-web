// Tarot Data Constants
export const TOPICS = [
	{ key: "love", name: "Tình Yêu", icon: "❤️", emoji: "❤️", label: "Tình Yêu" },
	{
		key: "career",
		name: "Sự Nghiệp",
		icon: "💼",
		emoji: "💼",
		label: "Sự Nghiệp",
	},
	{
		key: "general",
		name: "Tổng Quan",
		icon: "🔮",
		emoji: "🔮",
		label: "Tổng Quan",
	},
	{
		key: "finance",
		name: "Tài Chính",
		icon: "💰",
		emoji: "💰",
		label: "Tài Chính",
	},
] as const;

export const SPREADS = [
	{
		id: "1-card",
		name: "1 Lá Bài",
		description: "Tư vấn nhanh cho một câu hỏi cụ thể",
		minCards: 1,
		maxCards: 1,
	},
	{
		id: "3-cards",
		name: "3 Lá Bài",
		description: "Quá khứ - Hiện tại - Tương lai",
		minCards: 3,
		maxCards: 3,
	},
	{
		id: "celtic-cross",
		name: "Celtic Cross",
		description: "Phân tích sâu về nhiều khía cạnh cuộc sống",
		minCards: 10,
		maxCards: 10,
	},
] as const;

export const CARD_MEANINGS = {
	// Major Arcana
	"0": { name: "The Fool", meaning: "Bắt đầu mới, sự ngây thơ" },
	"1": { name: "The Magician", meaning: "Sức mạnh nội tại, sự sáng tạo" },
	"2": { name: "The High Priestess", meaning: "Trực giác, bí ẩn" },
	"3": { name: "The Empress", meaning: "Sự nuôi dưỡng, sự phong phú" },
	"4": { name: "The Emperor", meaning: "Quyền lực, cấu trúc" },
	"5": { name: "The Hierophant", meaning: "Truyền thống, giáo dục" },
	"6": { name: "The Lovers", meaning: "Sự lựa chọn, mối quan hệ" },
	"7": { name: "The Chariot", meaning: "Sự kiểm soát, ý chí" },
	"8": { name: "Strength", meaning: "Sức mạnh nội tâm, kiên nhẫn" },
	"9": { name: "The Hermit", meaning: "Sự nội tâm, chiêm nghiệm" },
	"10": { name: "Wheel of Fortune", meaning: "Sự thay đổi, vận may" },
	"11": { name: "Justice", meaning: "Sự công bằng, sự thật" },
	"12": { name: "The Hanged Man", meaning: "Sự hy sinh, góc nhìn mới" },
	"13": { name: "Death", meaning: "Sự kết thúc, sự chuyển mình" },
	"14": { name: "Temperance", meaning: "Sự cân bằng, điều độ" },
	"15": { name: "The Devil", meaning: "Sự ràng buộc, vật chất" },
	"16": { name: "The Tower", meaning: "Sự thay đổi đột ngột" },
	"17": { name: "The Star", meaning: "Hy vọng, sự hướng dẫn" },
	"18": { name: "The Moon", meaning: "Ilusion, trực giác" },
	"19": { name: "The Sun", meaning: "Sự thành công, sự rõ ràng" },
	"20": { name: "Judgement", meaning: "Sự đánh giá, sự tái sinh" },
	"21": { name: "The World", meaning: "Sự hoàn thành, sự viên mãn" },
} as const;
