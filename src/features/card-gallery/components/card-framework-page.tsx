'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent as CardContentUI, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EnhancedCardDetailModal } from '@/features/card-gallery/components/enhanced-card-detail-modal'
import { getCardContentsByTemplateId, getCardTemplatesByFramework } from '@/lib/card-gallery-simple'
import { getApiErrorMessage } from '@/types/api'
import type {
  CardContent,
  CardGalleryFilters,
  CardTemplateWithContent,
  Rarity
} from '@/types/card-gallery'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Eye,
  FileText,
  Heart,
  Search,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function CardSkeleton() {
  return (
    <Card className="glass-card overflow-hidden group">
      <div className="h-64 bg-muted/20 animate-pulse" />
      <CardContentUI className="p-4">
        <div className="h-6 bg-muted/40 rounded mb-2 animate-pulse" />
        <div className="h-4 bg-muted/30 rounded mb-2 animate-pulse" />
        <div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse" />
      </CardContentUI>
    </Card>
  )
}

function CardItem({
  card,
  onClick,
  getRarityColor
}: {
  card: CardTemplateWithContent
  onClick: () => void
  getRarityColor: (rarity: Rarity) => string
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card
        className="glass-card overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] border-border/30"
        onClick={onClick}
      >
        {/* Card Image */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
          {card.imagePath ? (
            <Image
              src={card.imagePath}
              alt={card.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Sparkles className="h-12 w-12 text-primary/30" />
            </div>
          )}

          {/* Overlay with badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-3 left-3 right-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getRarityColor(card.rarity)}`}>
                  {card.rarity}
                </span>
                {card.isOwned && (
                  <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                    <Heart className="h-3 w-3 inline mr-1" />
                    Đã sở hữu
                  </span>
                )}
              </div>
            </div>

            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Eye className="h-3 w-3" />
                {card.ownerCount?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>

        <CardContentUI className="p-4">
          <CardHeader className="p-0 mb-3">
            <CardTitle className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {card.name}
            </CardTitle>
          </CardHeader>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <FileText className="h-3 w-3 inline mr-1" />
                {card.totalContentPieces || 0}
              </span>
              {card.dropRate && (
                <span className="px-2 py-1 rounded-md text-xs bg-orange-500/10 text-orange-400 border border-orange-500/30">
                  {card.dropRate}%
                </span>
              )}
            </div>

            <Button size="sm" variant="ghost" className="text-xs">
              Chi tiết
            </Button>
          </div>
        </CardContentUI>
      </Card>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
function CardFrameworkContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const frameworkId = params.frameworkId as string
  const initialCardId = searchParams.get('card')

  const [selectedCard, setSelectedCard] = useState<CardTemplateWithContent | null>(null)
  const [filters, setFilters] = useState<CardGalleryFilters>({
    search: '',
    rarity: 'ALL',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  const [isAuthenticated] = useState(false)

  const { data: cards = [], isLoading, error } = useQuery({
    queryKey: ['cardTemplates', frameworkId],
    queryFn: async () => {
      const templates = await getCardTemplatesByFramework(frameworkId)

      const cardsWithContent = await Promise.all(
        templates.map(async (template: CardTemplateWithContent) => {
          try {
            const contents = await getCardContentsByTemplateId(template.cardTemplateId)
            return {
              ...template,
              cardContents: contents as CardContent[],
              totalContentPieces: contents.length,
              publicContentCount: contents.filter((c: CardContent) => c.isPublic).length,
              privateContentCount: contents.filter((c: CardContent) => !c.isPublic).length,
              frameworkId,
              frameworkName: frameworkId
            }
          } catch {
            return {
              ...template,
              cardContents: [],
              totalContentPieces: 0,
              publicContentCount: 0,
              privateContentCount: 0,
              frameworkId,
              frameworkName: frameworkId
            }
          }
        })
      )

      return cardsWithContent
    },
    enabled: !!frameworkId
  })

  useEffect(() => {
    if (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tải danh sách lá bài'))
    }
  }, [error])

  useEffect(() => {
    if (initialCardId && cards.length > 0) {
      const card = cards.find(c => c.cardTemplateId === Number(initialCardId))
      if (card) {
        setSelectedCard(card)
      }
    }
  }, [initialCardId, cards])

  const filteredCards = useMemo(() => {
    let result = [...cards]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(card =>
        card.name.toLowerCase().includes(searchLower) ||
        card.description?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.rarity && filters.rarity !== 'ALL') {
      result = result.filter(card => card.rarity === filters.rarity)
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rarity':
          const rarityOrder: Record<Rarity, number> = { COMMON: 1, RARE: 2, LEGENDARY: 3 }
          comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity]
          break
        case 'dropRate':
          comparison = (a.dropRate || 0) - (b.dropRate || 0)
          break
        default:
          comparison = 0
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [cards, filters])

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30'
      case 'RARE':
        return 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30'
      case 'COMMON':
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
      default:
        return 'bg-muted/40 text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <div className="bg-card/20 backdrop-blur-sm border-b border-border/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-gold-purple mb-2" style={{ fontFamily: 'Fruktur, var(--font-heading)' }}>
                {frameworkId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </h1>
              <p className="text-muted-foreground">
                {isLoading ? 'Đang tải...' : `${filteredCards.length} lá bài trong bộ sưu tập`}
              </p>
            </div>

            <Link href="/card-gallery">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại Gallery
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm lá bài..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 glass-card border-border/40"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.rarity}
              onChange={(e) => setFilters(prev => ({ ...prev, rarity: e.target.value as Rarity | 'ALL' }))}
              className="px-3 py-2 rounded-md bg-card/50 border border-border/30 text-sm"
            >
              <option value="ALL">Tất cả độ hiếm</option>
              <option value="COMMON">Common</option>
              <option value="RARE">Rare</option>
              <option value="LEGENDARY">Legendary</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as typeof filters.sortBy }))}
              className="px-3 py-2 rounded-md bg-card/50 border border-border/30 text-sm"
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="rarity">Sắp xếp theo độ hiếm</option>
              <option value="dropRate">Sắp xếp theo tỷ lệ rơi</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }))}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-4 pb-12">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Không tìm thấy lá bài nào
            </h3>
            <p className="text-muted-foreground">
              Thử tìm kiếm với từ khóa khác hoặc bộ lọc khác
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCards.map((card) => (
                <CardItem
                  key={card.cardTemplateId}
                  card={card}
                  onClick={() => setSelectedCard(card)}
                  getRarityColor={getRarityColor}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <EnhancedCardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        isAuthenticated={isAuthenticated}
        frameworkName={frameworkId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      />
    </div>
  )
}

export function CardFrameworkPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    }>
      <CardFrameworkContent />
    </Suspense>
  )
}
