'use client'

import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import StarBackground from '@/components/ui/star-background'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { fadeInUp, staggerContainer } from '@/lib/motion-variants'
import { SPREADS, TOPICS } from '@/lib/tarot-data'
import { useTarotSessionStore } from '@/stores/useTarotSessionStore'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  History,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const steps = ['Chọn Chủ Đề', 'Câu Hỏi', 'Kiểu Trải Bài']

export default function TarotSetupPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const store = useTarotSessionStore()

  const canNext = () => {
    if (step === 0) return !!store.setup.topic
    if (step === 1) return true // question is optional
    if (step === 2) return true
    return false
  }

  const handleStart = () => {
    const sessionId = Date.now().toString(36)
    router.push(`/tarot/session/${sessionId}`)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <Header />
      <main className="relative z-10 pt-28 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i === step
                      ? 'bg-primary text-primary-foreground glow-gold scale-110'
                      : i < step
                        ? 'bg-primary/30 text-primary cursor-pointer'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 transition-colors duration-300 ${i < step ? 'bg-primary/50' : 'bg-muted'}`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Topic */}
            {step === 0 && (
              <motion.div
                key="step0"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -60 }}
                className="space-y-6"
              >
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl font-bold text-center"
                >
                  Bạn muốn hỏi về{' '}
                  <span className="gradient-gold-purple">điều gì?</span>
                </motion.h2>
                <motion.div
                  variants={fadeInUp}
                  className="grid grid-cols-2 gap-4"
                >
                  {TOPICS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => store.setTopic(t.key)}
                      className={`glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 group ${
                        store.setup.topic === t.key
                          ? 'ring-2 ring-primary glow-gold'
                          : 'hover:border-primary/30'
                      }`}
                    >
                      <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">
                        {t.emoji}
                      </span>
                      <span className="font-semibold text-foreground">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* STEP 2: Question */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -60 }}
                className="space-y-6"
              >
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl font-bold text-center"
                >
                  Bạn muốn hỏi{' '}
                  <span className="gradient-gold-purple">câu gì?</span>
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="text-center text-muted-foreground text-sm"
                >
                  Tùy chọn — bạn có thể bỏ qua nếu muốn đọc bài tổng quát
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <Textarea
                    value={store.setup.question}
                    onChange={(e) => store.setQuestion(e.target.value)}
                    placeholder="Ví dụ: Mối quan hệ hiện tại của tôi sẽ đi về đâu?"
                    className="bg-card/60 border-border/50 min-h-[120px] text-foreground placeholder:text-muted-foreground/60 resize-none rounded-xl"
                    maxLength={500}
                  />
                  <p className="text-right text-xs text-muted-foreground mt-1">
                    {store.setup.question.length}/500
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* STEP 3: Spread + Mode */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -60 }}
                className="space-y-6"
              >
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl font-bold text-center"
                >
                  Chọn{' '}
                  <span className="gradient-gold-purple">kiểu trải bài</span>
                </motion.h2>

                <motion.div variants={fadeInUp} className="space-y-3">
                  {SPREADS.map((sp) => (
                    <button
                      key={sp.key}
                      onClick={() => store.setSpreadType(sp.key)}
                      className={`w-full glass-card rounded-xl p-5 text-left transition-all duration-300 hover:scale-[1.02] ${
                        store.setup.spreadType === sp.key
                          ? 'ring-2 ring-primary glow-gold'
                          : 'hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-lg text-foreground">
                            {sp.label}
                          </span>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {sp.description}
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-primary">
                          {sp.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>

                {/* Mode toggle */}
                <motion.div
                  variants={fadeInUp}
                  className="glass-card rounded-xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        Chế độ bộ bài
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {store.setup.deckMode === 'EXPLORE'
                          ? 'Rút từ 78 lá Major & Minor Arcana'
                          : 'Rút từ các lá bạn đang sở hữu (NFC linked)'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium ${store.setup.deckMode === 'EXPLORE' ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        EXPLORE
                      </span>
                      <Switch
                        checked={store.setup.deckMode === 'YOUR_DECK'}
                        onCheckedChange={(c) =>
                          store.setDeckMode(c ? 'YOUR_DECK' : 'EXPLORE')
                        }
                      />
                      <span
                        className={`text-xs font-medium ${store.setup.deckMode === 'YOUR_DECK' ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        YOUR DECK
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              className={step === 0 ? 'invisible' : ''}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Quay Lại
            </Button>
            {step < 2 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="gradient-gold-purple-bg text-primary-foreground font-semibold rounded-full px-6 glow-gold hover:scale-105 transition-transform"
              >
                Tiếp Theo <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="gradient-gold-purple-bg text-primary-foreground font-semibold rounded-full px-8 glow-gold hover:scale-105 transition-transform"
              >
                <Sparkles className="w-4 h-4 mr-1" /> Bắt Đầu Đọc Bài
              </Button>
            )}
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="glass-card rounded-xl p-4 mt-12 flex gap-3 items-start"
          >
            <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Lưu ý</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tarot là công cụ suy ngẫm, không phải lời tiên tri. Kết quả chỉ
                mang tính tham khảo, hãy luôn dùng phán đoán của riêng bạn cho
                các quyết định quan trọng.
              </p>
            </div>
          </motion.div>

          {/* Reading History placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16"
          >
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-primary" /> Lịch Sử Đọc Bài
            </h3>
            <div className="glass-card rounded-xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Chưa có lịch sử đọc bài. Bắt đầu trải bài đầu tiên nào!
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
