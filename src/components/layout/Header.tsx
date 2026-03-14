'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const navLinks = [
  { label: 'Trang chủ', href: '#hero' },
  { label: 'Tính năng', href: '#features' },
  { label: 'Cách dùng', href: '#how-it-works' },
  { label: 'Tải App', href: '#download' },
]

const Header = () => {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastY, setLastY] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 60)
      setHidden(y > 100 && y > lastY)
      setLastY(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastY])

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-nav py-3' : 'py-5'
        } ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <a href="#hero" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-bold gradient-gold-purple">
              PixelMage
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-5 py-2 transition-colors"
            >
              Đăng Nhập
            </a>
            <a
              href="#download"
              className="text-sm font-semibold gradient-gold-purple-bg text-primary-foreground rounded-full px-5 py-2 glow-gold transition-transform hover:scale-105"
            >
              🔮 Tải Ngay
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-2xl font-heading text-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#download"
            onClick={() => setMobileOpen(false)}
            className="gradient-gold-purple-bg text-primary-foreground rounded-full px-8 py-3 font-semibold glow-gold"
          >
            🔮 Tải Ngay
          </a>
        </motion.div>
      )}
    </>
  )
}

export default Header
