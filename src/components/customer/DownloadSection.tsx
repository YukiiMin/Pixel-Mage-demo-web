import { motion } from "framer-motion";
import { fadeInLeft, fadeInRight, staggerContainer } from "@/lib/motion-variants";
import { Check, Smartphone } from "lucide-react";

const benefits = [
  "Quét NFC liên kết thẻ bài vật lý",
  "Đọc bài Tarot AI mọi lúc",
  "Sưu tập bộ bài riêng",
];

const DownloadSection = () => {
  return (
    <section id="download" className="py-24 gradient-bg-section relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* LEFT */}
          <motion.div variants={fadeInLeft} className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1.5 text-xs font-medium text-primary">
              📲 Tải PixelMage App
            </div>

            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Quét NFC · Đọc Tarot
              <br />
              <span className="gradient-gold-purple">Mọi Lúc Mọi Nơi</span>
            </h2>

            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#"
                className="gradient-gold-purple-bg text-primary-foreground font-semibold rounded-full px-6 py-3 glow-gold transition-transform hover:scale-105 flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Tải Android APK
              </a>
              <span className="glass-card rounded-full px-6 py-3 text-muted-foreground opacity-60 cursor-not-allowed">
                🍎 iOS — Sắp ra mắt
              </span>
            </div>

            <div className="flex gap-6 pt-4 text-sm text-muted-foreground">
              <span><strong className="text-primary">4.8★</strong> Rating</span>
              <span><strong className="text-primary">10K+</strong> Downloads</span>
              <span><strong className="text-primary">100%</strong> Free</span>
            </div>
          </motion.div>

          {/* RIGHT — Phone mockup */}
          <motion.div variants={fadeInRight} className="relative flex justify-center">
            <div className="relative w-64 h-[500px] rounded-[2.5rem] border-2 border-primary/30 bg-card/40 backdrop-blur-sm overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-background rounded-b-2xl" />
              {/* Screen content mockup */}
              <div className="p-6 pt-10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl gradient-gold-purple-bg flex items-center justify-center text-2xl">
                  🔮
                </div>
                <p className="text-sm font-heading text-center">PixelMage</p>
                <div className="w-full h-32 rounded-xl bg-muted/30 animate-pulse" />
                <div className="w-full h-8 rounded-lg bg-muted/20" />
                <div className="w-full h-8 rounded-lg bg-muted/20" />
              </div>
            </div>

            {/* Floating notifications */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card rounded-xl px-3 py-2 text-xs absolute top-20 -right-4 animate-float"
            >
              🔔 Scan thành công!
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 3.5, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass-card rounded-xl px-3 py-2 text-xs absolute bottom-32 -left-4 animate-float"
              style={{ animationDelay: "1s" }}
            >
              ✅ +1 The Fool đã thêm
            </motion.div>

            {/* Glow behind phone */}
            <div className="absolute inset-0 -z-10 rounded-full bg-primary/10 blur-[80px]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default DownloadSection;
