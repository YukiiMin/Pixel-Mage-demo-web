'use client'

import { Button } from '@/components/ui/button'
import { useCardFrameworks } from '@/features/card-gallery/hooks/use-card-gallery'
import { ArrowRight, Package, Search, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export function CardGalleryPageClient() {
  const { frameworks, loading } = useCardFrameworks()
  const [search, setSearch] = useState('')

  const filteredFrameworks = frameworks.filter(framework =>
    framework.name.toLowerCase().includes(search.toLowerCase()) ||
    framework.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* Hero Header - VCard Style */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          {/* Small subtitle */}
          <p className="text-amber-400 text-sm font-medium tracking-wider uppercase mb-3">
            Khám phá bộ sưu tập
          </p>

          {/* Main Title */}
          <h1
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: 'Fruktur, var(--font-heading)' }}
          >
            Card Gallery
          </h1>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-lg leading-relaxed">
            Mỗi bộ bài Tarot là một tác phẩm nghệ thuật độc đáo, được minh họa bởi các nghệ sĩ tài năng.
            Khám phá và sưu tầm những lá bài đẹp nhất từ các bộ sưu tập nổi tiếng thế giới.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 mb-12">
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ sưu tập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50
                         transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Framework List - VCard Style */}
      <div className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 animate-pulse"
              >
                <div className="w-32 h-32 bg-white/10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-48 bg-white/10 rounded" />
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                </div>
                <div className="w-32 h-10 bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredFrameworks.length === 0 ? (
          <div className="text-center py-20">
            <Package className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Không tìm thấy bộ sưu tập nào
            </h3>
            <p className="text-muted-foreground">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredFrameworks.map((framework) => (
              <Link
                key={framework.frameworkId}
                href={`/card-gallery/${framework.frameworkId}`}
              >
                <div
                  className="group flex items-center gap-6 p-4 bg-white/5 hover:bg-white/10
                             rounded-2xl border border-white/10 hover:border-amber-500/30
                             transition-all duration-300 cursor-pointer"
                >
                  {/* Framework Image */}
                  <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    {framework.imageUrl ? (
                      <Image
                        src={framework.imageUrl}
                        alt={framework.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Sparkles className="h-10 w-10 text-primary/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-amber-400 transition-colors mb-2">
                      {framework.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {framework.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Package className="h-3.5 w-3.5" />
                        {framework.totalCards} lá bài
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(framework.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    className="flex-shrink-0 bg-white/5 hover:bg-amber-500/20
                               border-white/20 hover:border-amber-500/50
                               text-foreground hover:text-amber-400
                               transition-all duration-300 group/btn"
                  >
                    Khám phá
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
