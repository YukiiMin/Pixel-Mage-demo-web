'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { ChevronDown, LogOut } from 'lucide-react'
import Link from 'next/link'
import {
  adminNavLinks,
  authDropdownLinks,
  resolveSectionHref,
  staffNavLinks,
} from './_config'

interface DesktopActionsProps {
  pathname: string
  isAuth: boolean
  userRole: string | null
  displayName: string
  userEmail: string
  initials: string
  avatarUrl: string | null
  onLogout: () => void
}

const DesktopActions = ({
  pathname,
  isAuth,
  userRole,
  displayName,
  userEmail,
  initials,
  avatarUrl,
  onLogout,
}: DesktopActionsProps) => (
  <div className="hidden md:flex items-center gap-3">
    {isAuth ? (
      <>
        <NotificationBell userRole={userRole || undefined} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex items-center justify-center w-7 h-7 rounded-full gradient-gold-purple-bg text-xs font-bold text-primary-foreground select-none">
                  {initials}
                </span>
              )}
              <span className="max-w-30 truncate">{displayName}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="font-semibold truncate">{displayName}</span>
              {userEmail && (
                <span className="text-xs font-normal text-muted-foreground truncate">
                  {userEmail}
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Admin Menu Group */}
            {userRole === 'ADMIN' && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 py-2">
                  <LogOut className="rotate-180 text-primary" size={15} />
                  <span className="font-medium">Quản trị Hệ thống</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-52 p-1">
                    <DropdownMenuItem asChild className="mb-1">
                      <Link
                        href="/admin"
                        className="font-bold text-primary flex justify-center w-full bg-primary/10"
                      >
                        Tới Admin Portal »
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {adminNavLinks.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 py-2 ${pathname === item.href ? 'text-primary bg-primary/5' : ''}`}
                        >
                          <item.icon size={15} />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}

            {/* Staff Menu Group */}
            {(userRole === 'STAFF' || userRole === 'ADMIN') && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 py-2 mt-1">
                  <LogOut className="rotate-180 text-yellow-500" size={15} />
                  <span className="font-medium">Nghiệp vụ Nhân viên</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="w-52 p-1">
                    <DropdownMenuItem asChild className="mb-1">
                      <Link
                        href="/staff"
                        className="font-bold text-yellow-500 flex justify-center w-full bg-yellow-500/10"
                      >
                        Tới Staff Portal »
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {staffNavLinks.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 py-2 ${pathname === item.href ? 'text-primary bg-primary/5' : ''}`}
                        >
                          <item.icon size={15} />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            )}

            {/* Consumer Menu Group */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 py-2 mt-1">
                <LogOut
                  className="rotate-180 text-muted-foreground"
                  size={15}
                />
                <span className="font-medium">Tài khoản Cá nhân</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-52 p-1">
                  {authDropdownLinks.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 py-2 transition-colors ${pathname === item.href ? 'text-primary bg-primary/5' : ''}`}
                      >
                        <item.icon size={15} />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="mt-2" />

            {/* Logout with Confirm Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-2 mt-1"
                >
                  <LogOut size={15} className="mr-2" />
                  Đăng xuất
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận đăng xuất?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Đăng xuất
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
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
          className="text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-5 py-2 transition-colors"
        >
          Đăng Ký
        </Link>
      </>
    )}
    <Link
      href={resolveSectionHref(pathname, '#download')}
      className="text-sm font-semibold gradient-gold-purple-bg text-primary-foreground rounded-full px-5 py-2 glow-gold transition-transform hover:scale-105"
    >
      🔮 Tải Ngay
    </Link>
  </div>
)

export default DesktopActions
