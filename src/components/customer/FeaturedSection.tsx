import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion-variants";
import { Sparkles, CreditCard, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Đọc Bài Tarot AI",
    desc: "AI phân tích chuyên sâu 78 lá bài với hơn 10 kiểu trải bài phổ biến.",
  },
  {
    icon: CreditCard,
    title: "Sưu Tập Thẻ NFC",
    desc: "Thẻ bài vật lý tích hợp NFC — quét để mở khóa nội dung bí ẩn.",
  },
  {
    icon: Zap,
    title: "Marketplace",
    desc: "Mua bán bộ bài nghệ thuật từ các nghệ sĩ hàng đầu trên nền tảng.",
  },
];

const FeaturedSection = () => (
  <section id="features" className="py-24 relative">
    <div className="container mx-auto px-6">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="text-center mb-14"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Tính Năng Nổi Bật</h2>
        <p className="text-muted-foreground">Khám phá thế giới Tarot theo cách chưa từng có</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-3 gap-8"
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="glass-card rounded-2xl p-8 group hover:glow-gold transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-xl gradient-gold-purple-bg flex items-center justify-center mb-5">
              <f.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default FeaturedSection;
