'use client'

import tarotCard from '@/assets/tarot-the-fool.png'
import {
  fadeInLeft,
  fadeInRight,
  staggerContainer,
} from '@/lib/motion-variants'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const CounterStat = ({ end, label }: { end: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [val, setVal] = useState('0')

  useEffect(() => {
    if (!inView) return
    const num = parseInt(end.replace(/[^0-9]/g, '10'))
    const suffix = end.replace(/[0-9]/g, '')
    const duration = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - p) ** 3
      setVal(Math.round(num * eased) + suffix)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, end])

  return (
    <div ref={ref} className="text-center">
      <span className="text-2xl md:text-3xl font-bold text-primary">{val}</span>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

const FloatingBadge = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    className={`glass-card rounded-xl px-3 py-2 text-xs font-medium text-foreground absolute animate-orbit ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </motion.div>
)

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
    >
      {/* Gold radial glow */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-[55%_45%] gap-12 items-center"
        >
          {/* LEFT */}
          <motion.div variants={fadeInLeft} className="space-y-6">
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1.5 text-xs font-medium text-primary animate-pulse-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🔮 #1 AI Tarot Platform
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Khám Phá
              <br />
              <span className="gradient-gold-purple animate-shimmer inline-block">
                Thế Giới Tarot
              </span>
              <br />
              Huyền Bí
            </h1>

            <p className="text-muted-foreground text-base md:text-lg max-w-lg font-light">
              Đọc bài AI · Sưu tập thẻ NFC · Kết nối vũ trụ
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#"
                className="gradient-gold-purple-bg text-primary-foreground font-semibold rounded-full px-7 py-3 glow-gold transition-transform hover:scale-105"
              >
                🔮 Bắt Đầu Đọc Bài
              </a>
              <a
                href="#how-it-works"
                className="border border-primary/40 text-primary font-medium rounded-full px-7 py-3 hover:bg-primary/10 transition-colors"
              >
                {'>'} Tìm Hiểu Thêm
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {['M', 'T', 'B', 'H'].map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full gradient-gold-purple-bg flex items-center justify-center text-xs font-bold text-primary-foreground ring-2 ring-background"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-primary">★★★★★</span>{' '}
                <span className="text-muted-foreground">
                  1,000+ Tarot Readers tin tưởng
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <CounterStat end="78" label="Lá Bài" />
              <div className="w-px bg-border" />
              <CounterStat end="2K+" label="Readings" />
              <div className="w-px bg-border" />
              <CounterStat end="4.9★" label="Đánh Giá" />
            </div>
          </motion.div>

          {/* RIGHT — 3D Card */}
          <motion.div
            variants={fadeInRight}
            className="relative flex justify-center"
          >
            <motion.div
              className="relative z-10"
              whileHover={{ rotateY: 12, rotateX: -5 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ perspective: 800, transformStyle: 'preserve-3d' }}
            >
              <Image
                src={tarotCard}
                alt="The Fool Tarot Card"
                className="w-64 md:w-72 lg:w-80 rounded-2xl shadow-2xl h-auto"
                priority
              />
            </motion.div>

            {/* Floating badges */}
            <FloatingBadge className="top-8 -right-4 md:right-4" delay={2}>
              ✨ +1 The Moon
            </FloatingBadge>
            <FloatingBadge className="bottom-24 -left-4 md:left-0" delay={3}>
              🔮 AI Interpretation
            </FloatingBadge>
            <FloatingBadge className="top-1/3 -left-8 md:-left-4" delay={4}>
              📱 NFC Linked!
            </FloatingBadge>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
