'use client'

import { motion } from 'framer-motion'
import { LogOut, Menu, User, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useTransition, useState } from 'react'
import { toast } from 'sonner'
import { logout } from '@/lib/api/accounts'
import { getApiErrorMessage } from '@/lib/auth/errors'
import { clearSession } from '@/lib/auth/session'
import { useAuthSession } from '@/hooks/useAuthSession'

const navLinks = [
  { label: 'Trang chủ', href: '#hero' },
  { label: 'Tính năng', href: '#features' },
  { label: 'Cách dùng', href: '#how-it-works' },
  { label: 'Tải App', href: '#download' },
]

const Header = () => {
  const authSession = useAuthSession()
  const [isLoggingOut, startTransition] = useTransition()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [lastY, setLastY] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    startTransition(async () => {
      try {
        if (authSession.isAuthenticated) {
          await logout()
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to sign out cleanly.'))
      } finally {
        clearSession()
        toast.success('Signed out successfully.')
        setMobileOpen(false)
      }
    })
  }

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
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-heading font-bold gradient-gold-purple">
              PixelMage
            </span>
          </Link>

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
            {authSession.isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-5 py-2 transition-colors"
                >
                  <User size={16} />
                  {authSession.account?.name || 'Hồ Sơ'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-2 text-sm font-semibold gradient-gold-purple-bg text-primary-foreground rounded-full px-5 py-2 glow-gold transition-transform hover:scale-105 disabled:opacity-60"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? 'Đang Thoát...' : 'Đăng Xuất'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-5 py-2 transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold gradient-gold-purple-bg text-primary-foreground rounded-full px-5 py-2 glow-gold transition-transform hover:scale-105"
                >
                  ✨ Đăng Ký
                </Link>
              </>
            )}
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
          {authSession.isAuthenticated ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Hồ Sơ
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="gradient-gold-purple-bg text-primary-foreground rounded-full px-8 py-3 font-semibold glow-gold disabled:opacity-60"
              >
                {isLoggingOut ? 'Đang Thoát...' : 'Đăng Xuất'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Đăng Nhập
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="gradient-gold-purple-bg text-primary-foreground rounded-full px-8 py-3 font-semibold glow-gold"
              >
                ✨ Đăng Ký
              </Link>
            </>
          )}
        </motion.div>
      )}
    </>
  )
}

export default Header
