'use client'

import { fadeInUp, staggerContainer } from '@/lib/motion-variants'
import { motion } from 'framer-motion'
import { Brain, Grid3X3, Hand, Link, Smartphone, Sparkles } from 'lucide-react'
import { useState } from 'react'

const tabs = [
  {
    id: 'online',
    label: '🔮 Đọc Bài Online',
    steps: [
      {
        icon: Sparkles,
        title: 'Chọn chủ đề & trải bài',
        desc: 'Chọn câu hỏi và kiểu trải bài phù hợp',
      },
      {
        icon: Hand,
        title: 'Rút lá bài đặc biệt',
        desc: 'Kết nối trực giác, chọn lá bài dành cho bạn',
      },
      {
        icon: Brain,
        title: 'Nhận giải mã AI chi tiết',
        desc: 'AI phân tích chuyên sâu ý nghĩa lá bài',
      },
    ],
  },
  {
    id: 'nfc',
    label: '📱 Quét NFC Thẻ Vật Lý',
    steps: [
      {
        icon: Smartphone,
        title: 'Mở app, đặt thẻ gần điện thoại',
        desc: 'Quét NFC tự động nhận diện thẻ bài',
      },
      {
        icon: Link,
        title: 'Xác nhận liên kết thẻ',
        desc: 'Xác minh quyền sở hữu lá bài vật lý',
      },
      {
        icon: Grid3X3,
        title: 'Xem nội dung + sưu tập',
        desc: 'Khám phá câu chuyện bí ẩn & bộ sưu tập',
      },
    ],
  },
]

const HowItWorks = () => {
  const [active, setActive] = useState('online')
  const current = tabs.find((t) => t.id === active)!

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Làm sao hoạt động?
          </h2>
          <p className="text-muted-foreground">
            3 bước đơn giản để bắt đầu hành trình Tarot
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-12">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                active === t.id
                  ? 'gradient-gold-purple-bg text-primary-foreground glow-gold'
                  : 'glass-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Steps */}
        <motion.div
          key={active}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {current.steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="glass-card rounded-2xl p-6 text-center group hover:glow-gold transition-shadow"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full gradient-gold-purple-bg flex items-center justify-center text-primary-foreground font-bold text-lg">
                {i + 1}
              </div>
              <step.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
              <h3 className="font-heading font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
