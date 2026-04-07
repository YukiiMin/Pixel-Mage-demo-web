'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CardContent as CardContentData, CardContentType, CardTemplateWithContent, ContentAccessLevel } from '@/types/card-gallery'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Crown,
  Droplets,
  Eye,
  FileText,
  Flame,
  Heart,
  ImageIcon,
  Lock,
  Mountain,
  Percent,
  Play,
  ShoppingBag,
  Sparkles,
  Users,
  Wind,
  Zap
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

// ─────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────
interface CardDetailModalProps {
  card: CardTemplateWithContent | null
  open: boolean
  onClose: () => void
  isAuthenticated: boolean
  frameworkName?: string
}

// ─────────────────────────────────────────────
// Animation Variants
// ─────────────────────────────────────────────
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
}

const contentVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const }
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

const cardImageVariants = {
  initial: { scale: 1, rotateY: 0 },
  hover: {
    scale: 1.05,
    rotateY: 5,
    transition: { duration: 0.4, ease: "easeOut" as const }
  }
}

const glowVariants = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    scale: [1, 1.1, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
  }
}

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────
const getRarityConfig = (rarity: string) => {
  const configs: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
    LEGENDARY: {
      color: 'text-yellow-400',
      bg: 'bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-yellow-500/20',
      border: 'border-yellow-500/40',
      icon: <Crown className="h-4 w-4" />
    },
    RARE: {
      color: 'text-blue-400',
      bg: 'bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-blue-500/20',
      border: 'border-blue-500/40',
      icon: <Sparkles className="h-4 w-4" />
    },
    COMMON: {
      color: 'text-gray-400',
      bg: 'bg-gradient-to-br from-gray-500/10 via-slate-500/10 to-gray-500/10',
      border: 'border-gray-500/30',
      icon: <Zap className="h-4 w-4" />
    }
  }
  return configs[rarity] || configs.COMMON
}

const getElementIcon = (element?: string) => {
  switch (element?.toLowerCase()) {
    case 'fire': return <Flame className="h-4 w-4 text-red-400" />
    case 'water': return <Droplets className="h-4 w-4 text-blue-400" />
    case 'earth': return <Mountain className="h-4 w-4 text-green-400" />
    case 'air': return <Wind className="h-4 w-4 text-cyan-400" />
    default: return <Sparkles className="h-4 w-4 text-purple-400" />
  }
}

const getContentTypeConfig = (type: CardContentType) => {
  const configs: Record<CardContentType, { icon: React.ReactNode; label: string; color: string }> = {
    TEXT: { icon: <FileText className="h-4 w-4" />, label: 'Văn bản', color: 'text-blue-400' },
    IMAGE: { icon: <ImageIcon className="h-4 w-4" />, label: 'Hình ảnh', color: 'text-green-400' },
    VIDEO: { icon: <Play className="h-4 w-4" />, label: 'Video', color: 'text-red-400' },
    GIF: { icon: <ImageIcon className="h-4 w-4" />, label: 'GIF', color: 'text-purple-400' },
    AUDIO: { icon: <Zap className="h-4 w-4" />, label: 'Audio', color: 'text-yellow-400' }
  }
  return configs[type]
}

// ─────────────────────────────────────────────
// Content Access Hook
// ─────────────────────────────────────────────
function useContentAccess(card: CardTemplateWithContent | null, isAuthenticated: boolean): ContentAccessLevel {
  if (!card) {
    return {
      canViewFullContent: false,
      canViewPartialContent: false,
      requiredAction: 'LOGIN',
      blurredContent: [],
      visibleContent: []
    }
  }

  if (isAuthenticated) {
    return {
      canViewFullContent: true,
      canViewPartialContent: true,
      requiredAction: 'NONE',
      visibleContent: card.cardContents || [],
      blurredContent: []
    }
  }

  const contents = card.cardContents || []
  const publicContent = contents.filter(content => content.isPublic)
  const privateContent = contents.filter(content => !content.isPublic)

  return {
    canViewFullContent: false,
    canViewPartialContent: publicContent.length > 0,
    requiredAction: 'LOGIN',
    blurredContent: privateContent,
    visibleContent: publicContent
  }
}

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
function CardImageSection({ card, rarityConfig }: { card: CardTemplateWithContent; rarityConfig: ReturnType<typeof getRarityConfig> }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative flex-shrink-0">
      {/* Glow Effect */}
      <motion.div
        className={`absolute inset-0 rounded-2xl blur-3xl ${rarityConfig.bg}`}
        variants={glowVariants}
        initial="initial"
        animate="animate"
      />

      {/* Card Frame */}
      <motion.div
        className={`relative rounded-2xl overflow-hidden border-2 ${rarityConfig.border} shadow-2xl`}
        style={{ perspective: '1000px' }}
        variants={cardImageVariants}
        initial="initial"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Card Image */}
        <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {card.imagePath ? (
            <Image
              src={card.imagePath}
              alt={card.name}
              fill
              className="object-cover transition-transform duration-500"
              style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Sparkles className="h-24 w-24 text-primary/20" />
            </div>
          )}

          {/* Card Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Rarity Badge on Card */}
          <div className="absolute top-4 left-4">
            <Badge className={`${rarityConfig.bg} ${rarityConfig.color} border ${rarityConfig.border} px-3 py-1`}>
              {rarityConfig.icon}
              <span className="ml-1 font-semibold">{card.rarity}</span>
            </Badge>
          </div>

          {/* Edition Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-black/50 text-white/80 border-white/20 px-2 py-1 text-xs">
              1st Edition
            </Badge>
          </div>

          {/* Card Number */}
          <div className="absolute bottom-4 left-4">
            <span className="text-white/60 text-sm font-mono">
              #{String(card.cardTemplateId).padStart(3, '0')}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function CardStats({ card }: { card: CardTemplateWithContent }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="bg-card/50 border-border/30">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Số người sở hữu</p>
            <p className="text-lg font-bold text-foreground">{card.ownerCount?.toLocaleString() || 0}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/30">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10">
            <Percent className="h-4 w-4 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tỷ lệ rơi</p>
            <p className="text-lg font-bold text-foreground">{card.dropRate || 0}%</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/30 col-span-2">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Độ hiếm</span>
            <span className="text-sm font-semibold">{card.rarity}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((card.dropRate || 0) * 10, 100)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ContentSection({
  card,
  accessLevel,
  isAuthenticated
}: {
  card: CardTemplateWithContent
  accessLevel: ContentAccessLevel
  isAuthenticated: boolean
}) {
  const [activeTab, setActiveTab] = useState('all')
  const contents = card.cardContents || []

  const filteredContents = contents.filter(content => {
    if (activeTab === 'all') return true
    return content.contentType.toLowerCase() === activeTab
  })

  return (
    <div className="space-y-4">
      {/* Content Lock Banner for Guests */}
      {!isAuthenticated && accessLevel.blurredContent && accessLevel.blurredContent.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-4"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjUxLCAxOTEsIDM2LCAwLjEpIi8+PC9zdmc+')] opacity-50" />

          <div className="relative flex items-start gap-4">
            <div className="p-3 rounded-full bg-amber-500/20">
              <Lock className="h-6 w-6 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-200 mb-1">
                Nội dung độc quyền đã bị khóa
              </h4>
              <p className="text-sm text-amber-100/70 mb-3">
                Đăng nhập để xem toàn bộ {accessLevel.blurredContent.length} nội dung độc quyền về lá bài này,
                bao gồm câu chuyện, hình ảnh hiếm và video đặc biệt.
              </p>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                  asChild
                >
                  <Link href={`/login?returnUrl=${encodeURIComponent(`/card-gallery/${card.frameworkId}?card=${card.cardTemplateId}`)}`}>
                    Đăng nhập
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500/30 text-amber-200 hover:bg-amber-500/10"
                  asChild
                >
                  <Link href={`/register?returnUrl=${encodeURIComponent(`/card-gallery/${card.frameworkId}?card=${card.cardTemplateId}`)}`}>
                    Đăng ký
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Tabs */}
      {contents.length > 0 && (
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border border-border/30">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="text">Lore</TabsTrigger>
            <TabsTrigger value="image">Hình ảnh</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {filteredContents.map((content, index) => (
                  <ContentItem
                    key={content.contentId}
                    content={content}
                    isLocked={!isAuthenticated && !content.isPublic}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="text" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {filteredContents
                  .filter(c => c.contentType === 'TEXT')
                  .map((content, index) => (
                    <ContentItem
                      key={content.contentId}
                      content={content}
                      isLocked={!isAuthenticated && !content.isPublic}
                      delay={index * 0.1}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {filteredContents
                  .filter(c => c.contentType === 'IMAGE' || c.contentType === 'GIF')
                  .map((content, index) => (
                    <ContentItem
                      key={content.contentId}
                      content={content}
                      isLocked={!isAuthenticated && !content.isPublic}
                      delay={index * 0.1}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="video" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {filteredContents
                  .filter(c => c.contentType === 'VIDEO')
                  .map((content, index) => (
                    <ContentItem
                      key={content.contentId}
                      content={content}
                      isLocked={!isAuthenticated && !content.isPublic}
                      delay={index * 0.1}
                    />
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}

      {contents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có nội dung cho lá bài này</p>
        </div>
      )}
    </div>
  )
}

function ContentItem({
  content,
  isLocked,
  delay = 0
}: {
  content: CardContentData
  isLocked: boolean
  delay?: number
}) {
  const config = getContentTypeConfig(content.contentType)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`relative rounded-xl border ${isLocked ? 'border-amber-500/30' : 'border-border/30'} bg-card/30 overflow-hidden`}
    >
      {isLocked && (
        <div className="absolute inset-0 backdrop-blur-md bg-background/80 z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-8 w-8 text-amber-400 mx-auto mb-2" />
            <p className="text-sm text-amber-200">Nội dung độc quyền</p>
            <p className="text-xs text-amber-100/60">Đăng nhập để xem</p>
          </div>
        </div>
      )}

      <div className="p-4 opacity-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{content.title}</h4>
            <span className={`text-xs ${config.color}`}>{config.label}</span>
          </div>
          {content.isPublic ? (
            <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
              Công khai
            </Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
              Độc quyền
            </Badge>
          )}
        </div>

        {/* Content Body */}
        {content.contentType === 'TEXT' && content.textData && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {content.textData}
          </p>
        )}

        {content.contentType === 'IMAGE' && content.contentUrl && (
          <div className="rounded-lg overflow-hidden bg-muted/20">
            <Image
              src={content.contentUrl}
              alt={content.title || 'Hình ảnh'}
              width={400}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {content.contentType === 'VIDEO' && content.thumbnailUrl && (
          <div className="rounded-lg overflow-hidden bg-muted/20 relative">
            <Image
              src={content.thumbnailUrl}
              alt={content.title || 'Video thumbnail'}
              width={400}
              height={300}
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ActionPanel({
  card,
  onClose
}: {
  card: CardTemplateWithContent
  onClose: () => void
}) {
  return (
    <div className="space-y-4">
      {/* Buy Button */}
      <Button
        size="lg"
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
        asChild
      >
        <Link
          href={`/marketplace?cardTemplate=${card.cardTemplateId}`}
          onClick={onClose}
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          Mua lá bài này
        </Link>
      </Button>

      {/* View Packs Button */}
      <Button
        variant="outline"
        size="lg"
        className="w-full border-border/50 hover:bg-card/50"
        asChild
      >
        <Link
          href={`/marketplace?cardTemplate=${card.cardTemplateId}`}
          onClick={onClose}
        >
          <Eye className="h-5 w-5 mr-2" />
          Xem gói có chứa lá bài này
        </Link>
      </Button>

      {/* Secondary Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" size="sm" className="flex-1">
          <Heart className="h-4 w-4 mr-1" />
          Yêu thích
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          <Sparkles className="h-4 w-4 mr-1" />
          Chia sẻ
        </Button>
      </div>

      {/* Additional Info */}
      <div className="pt-4 border-t border-border/30 space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Mã lá bài:</span>
          <span className="font-mono">{card.cardCode || `#${card.cardTemplateId}`}</span>
        </div>
        <div className="flex justify-between">
          <span>Bộ sưu tập:</span>
          <span>{card.frameworkName || card.frameworkId}</span>
        </div>
        <div className="flex justify-between">
          <span>Nội dung:</span>
          <span>{card.totalContentPieces || 0} mục</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export function EnhancedCardDetailModal({
  card,
  open,
  onClose,
  isAuthenticated,
  frameworkName
}: CardDetailModalProps) {
  const accessLevel = useContentAccess(card, isAuthenticated)

  if (!card) return null

  const rarityConfig = getRarityConfig(card.rarity)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden bg-gradient-to-br from-background via-background to-slate-900/50 border-border/50">
        <DialogHeader className="sr-only">
          <DialogTitle>{card.name}</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={card.cardTemplateId}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-0"
          >
            {/* Left Column - Card Image */}
            <div className="lg:col-span-5 p-6 lg:p-8 bg-gradient-to-br from-slate-900/50 to-background">
              <CardImageSection card={card} rarityConfig={rarityConfig} />

              {/* Mobile-only Stats */}
              <div className="mt-6 lg:hidden">
                <CardStats card={card} />
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-7 p-6 lg:p-8 space-y-6">
              {/* Header Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${rarityConfig.bg} ${rarityConfig.color} border ${rarityConfig.border}`}>
                    {rarityConfig.icon}
                    <span className="ml-1">{card.rarity}</span>
                  </Badge>
                  {frameworkName && (
                    <Badge variant="outline" className="border-border/50">
                      {frameworkName}
                    </Badge>
                  )}
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold gradient-gold-purple mb-3">
                  {card.name}
                </h2>

                <p className="text-muted-foreground leading-relaxed">
                  {card.description || 'Chưa có mô tả cho lá bài này.'}
                </p>
              </div>

              {/* Desktop Stats */}
              <div className="hidden lg:block">
                <CardStats card={card} />
              </div>

              {/* Content Section */}
              <div className="border-t border-border/30 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Nội dung & Câu chuyện</h3>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30 ml-2">
                    {card.totalContentPieces || 0}
                  </Badge>
                </div>

                <ContentSection
                  card={card}
                  accessLevel={accessLevel}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              {/* Actions */}
              <div className="border-t border-border/30 pt-6">
                <ActionPanel card={card} onClose={onClose} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default EnhancedCardDetailModal
