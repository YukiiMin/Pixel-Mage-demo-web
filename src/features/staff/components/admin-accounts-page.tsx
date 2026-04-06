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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { API_ENDPOINTS, apiRequest } from '@/lib/api-config'
import { getApiErrorMessage } from '@/types/api'
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Pencil,
  Search,
  UserPlus,
  Users
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { UserDetailProfile } from './user-detail-profile'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface AccountRow {
  id: number | string
  customerId?: number
  name: string
  email: string
  phoneNumber?: string
  avatarUrl?: string
  role?: { roleName?: string } | string
  roleName?: string
  active?: boolean
  isActive?: boolean
  emailVerified?: boolean
  createdAt?: string
}

// Mock data transformer for UserDetailProfile
const transformToUserDetail = (account: AccountRow | null) => {
  if (!account) return null

  // Mock data for demonstration - in real app, this would come from API
  return {
    ...account,
    roleName: account.roleName || 'USER',
    active: Boolean(account.active ?? account.isActive),
    emailVerified: account.emailVerified ?? true,
    createdAt: account.createdAt || new Date().toISOString(),
    digitalCardsCount: Math.floor(Math.random() * 50),
    cardsByRarity: {
      legendary: Math.floor(Math.random() * 5),
      rare: Math.floor(Math.random() * 15),
      common: Math.floor(Math.random() * 30)
    },
    totalOrdersCount: Math.floor(Math.random() * 20),
    totalSpent: Math.floor(Math.random() * 5000000),
    walletBalance: Math.floor(Math.random() * 1000000),
    lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    lastLoginDevice: ['iPhone 15 Pro', 'Samsung Galaxy S24', 'Chrome on Windows'][Math.floor(Math.random() * 3)],
    addresses: [
      {
        id: 1,
        street: '123 Nguyễn Huệ',
        city: 'Quận 1',
        state: 'TP.HCM',
        zipCode: '700000',
        country: 'Việt Nam',
        isDefault: true
      }
    ],
    nfcClaimHistory: Array.from({ length: Math.floor(Math.random() * 10) }, (_, i) => ({
      id: i + 1,
      cardUuid: `card-uuid-${Math.random().toString(36).substr(2, 9)}`,
      cardName: `Mystic Card #${Math.floor(Math.random() * 100)}`,
      claimedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      deviceInfo: 'iPhone 15 Pro (iOS 17.0)'
    }))
  }
}

interface PageData {
  content: AccountRow[]
  totalPages: number
  totalElements: number
  number: number
}

interface StaffFormState {
  email: string
  name: string
  password: string
  phoneNumber: string
}

const SKELETON_ROW_KEYS = [
  'row-1',
  'row-2',
  'row-3',
  'row-4',
  'row-5',
  'row-6',
  'row-7',
  'row-8',
]

function normalizeRole(rawRole?: AccountRow['role'] | string): string {
  const roleValue =
    typeof rawRole === 'string'
      ? rawRole
      : typeof rawRole === 'object' && rawRole
        ? rawRole.roleName
        : undefined
  return (roleValue || 'USER').replace('ROLE_', '').toUpperCase()
}

function getStatus(
  acc: Pick<AccountRow, 'active' | 'isActive' | 'emailVerified'>
): 'ACTIVE' | 'UNVERIFIED' | 'BANNED' {
  const isActive = Boolean(acc.active ?? acc.isActive)
  if (!isActive) return 'BANNED'
  if (acc.emailVerified === false) return 'UNVERIFIED'
  return 'ACTIVE'
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountRow[]>([])
  const [detailAccount, setDetailAccount] = useState<AccountRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')
  const [searchField, setSearchField] = useState<
    'ALL' | 'NAME' | 'EMAIL' | 'ID'
  >('ALL')
  const [roleFilter, setRoleFilter] = useState<
    'ALL' | 'USER' | 'STAFF' | 'ADMIN'
  >('ALL')
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'ACTIVE' | 'UNVERIFIED' | 'BANNED'
  >('ALL')
  const [createStaffOpen, setCreateStaffOpen] = useState(false)
  const [staffForm, setStaffForm] = useState<StaffFormState>({
    email: '',
    name: '',
    password: '',
    phoneNumber: '',
  })
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null
  )

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), size: '15' })
      if (roleFilter !== 'ALL') params.set('role', roleFilter)

      const res = await apiRequest<PageData | AccountRow[]>(
        `${API_ENDPOINTS.accountManagement.list}?${params}`,
        { method: 'GET' }
      )

      const d = res.data
      if (d && 'content' in d) {
        const pageData = d as PageData
        const normalized = (pageData.content ?? []).map((acc) => ({
          ...acc,
          id: acc.id ?? acc.customerId ?? acc.email ?? 'unknown',
          roleName: normalizeRole(acc.roleName || acc.role),
          active: Boolean(acc.active ?? acc.isActive),
          emailVerified: acc.emailVerified ?? true,
        }))
        setAccounts(normalized)
        setTotalPages(pageData.totalPages ?? 1)
        setTotalElements(pageData.totalElements ?? normalized.length)
      } else if (Array.isArray(d)) {
        const normalized = d.map((acc) => ({
          ...acc,
          id: acc.id ?? acc.customerId ?? acc.email ?? 'unknown',
          roleName: normalizeRole(acc.roleName || acc.role),
          active: Boolean(acc.active ?? acc.isActive),
          emailVerified: acc.emailVerified ?? true,
        }))
        setAccounts(normalized)
        setTotalPages(1)
        setTotalElements(normalized.length)
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể tải danh sách tài khoản'))
    } finally {
      setLoading(false)
    }
  }, [page, roleFilter])

  const handleCreateStaff = async () => {
    if (!staffForm.email.trim()) {
      toast.error('Vui lòng nhập email')
      return
    }
    if (staffForm.password.length < 8) {
      toast.error('Mật khẩu phải từ 8 ký tự')
      return
    }

    try {
      await apiRequest(API_ENDPOINTS.accountManagement.createStaff, {
        method: 'POST',
        body: JSON.stringify({
          email: staffForm.email.trim(),
          name: staffForm.name.trim() || 'Staff Member',
          password: staffForm.password,
          phoneNumber: staffForm.phoneNumber.trim() || undefined,
        }),
      })
      toast.success('Tạo tài khoản Staff thành công')
      setCreateStaffOpen(false)
      setStaffForm({
        email: '',
        name: '',
        password: '',
        phoneNumber: '',
      })
      await fetchAccounts()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể tạo tài khoản staff'))
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleToggleActive = async (account: AccountRow) => {
    setActionLoading(account.id)
    try {
      await apiRequest(
        API_ENDPOINTS.accountManagement.toggleStatus(account.id),
        { method: 'PATCH' }
      )
      toast.success(
        account.active
          ? `Đã vô hiệu hoá ${account.email}`
          : `Đã kích hoạt ${account.email}`
      )
      await fetchAccounts()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Thao tác thất bại'))
    } finally {
      setActionLoading(null)
    }
  }

  // Client-side search
  const filtered = accounts.filter((a) => {
    const query = search.trim().toLowerCase()
    const byName = a.name?.toLowerCase().includes(query)
    const byEmail = a.email?.toLowerCase().includes(query)
    const byId = String(a.id).includes(query)
    const matchesSearch =
      query === '' ||
      (searchField === 'NAME' && byName) ||
      (searchField === 'EMAIL' && byEmail) ||
      (searchField === 'ID' && byId) ||
      (searchField === 'ALL' && (byName || byEmail || byId))

    const status = getStatus(a)
    const matchesStatus = statusFilter === 'ALL' || statusFilter === status
    return matchesSearch && matchesStatus
  })

  const roleColor: Record<string, string> = {
    ADMIN: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
    STAFF: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    USER: 'bg-green-500/15 text-green-400 border-green-500/25',
  }

  return (
    <div className="space-y-6">
      <Dialog open={createStaffOpen} onOpenChange={setCreateStaffOpen}>
        <DialogContent className="border-border/50 glass-card">
          <DialogHeader>
            <DialogTitle>Tạo tài khoản Staff</DialogTitle>
            <DialogDescription>
              Tạo nhanh tài khoản nhân viên kho/scanner NFC.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={staffForm.email}
              onChange={(e) =>
                setStaffForm((p) => ({ ...p, email: e.target.value }))
              }
              className="w-full rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Tên hiển thị"
              value={staffForm.name}
              onChange={(e) =>
                setStaffForm((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              value={staffForm.phoneNumber}
              onChange={(e) =>
                setStaffForm((p) => ({ ...p, phoneNumber: e.target.value }))
              }
              className="w-full rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Mật khẩu tạm (>=8 ký tự)"
              value={staffForm.password}
              onChange={(e) =>
                setStaffForm((p) => ({ ...p, password: e.target.value }))
              }
              className="w-full rounded-lg border border-border/50 bg-card/60 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCreateStaffOpen(false)}
                className="rounded-lg border border-border/50 px-3 py-2 text-sm"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleCreateStaff}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Tạo Staff
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UserDetailProfile
        user={transformToUserDetail(detailAccount)}
        open={!!detailAccount}
        onClose={() => setDetailAccount(null)}
        onRefresh={fetchAccounts}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="badge-mystic inline-flex mb-2">Admin</p>
          <h1
            className="text-3xl text-foreground"
            style={{ fontFamily: 'Fruktur, var(--font-heading)' }}
          >
            Accounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tổng cộng{' '}
            <span className="font-semibold text-foreground">
              {totalElements}
            </span>{' '}
            tài khoản
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateStaffOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
          title="Tạo staff mới"
        >
          <UserPlus className="h-4 w-4" />
          Thêm Staff
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card flex flex-col gap-3 rounded-2xl border border-border/50 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border/50 bg-card/60 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border/50 px-2 py-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={searchField}
            onChange={(e) =>
              setSearchField(e.target.value as 'ALL' | 'NAME' | 'EMAIL' | 'ID')
            }
            className="bg-transparent text-xs text-foreground outline-none"
          >
            <option value="ALL">Tìm: Tất cả</option>
            <option value="NAME">Theo tên</option>
            <option value="EMAIL">Theo email</option>
            <option value="ID">Theo ID</option>
          </select>
        </div>
        <div className="flex gap-2">
          {(['ALL', 'USER', 'STAFF', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRoleFilter(r)
                setPage(0)
              }}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                roleFilter === r
                  ? 'gradient-gold-purple-bg border-transparent text-primary-foreground'
                  : 'border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as 'ALL' | 'ACTIVE' | 'UNVERIFIED' | 'BANNED'
            )
          }
          className="rounded-full border border-border/50 bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground focus:outline-none"
        >
          <option value="ALL">Status: Tất cả</option>
          <option value="ACTIVE">Active</option>
          <option value="UNVERIFIED">Unverified</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden rounded-2xl border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-card/60">
                {[
                  'ID / Avatar',
                  'Username / Email',
                  'Vai trò',
                  'Trạng thái',
                  'Joined Date',
                  'Thao tác',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground last:text-right"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                SKELETON_ROW_KEYS.map((rowKey) => (
                  <tr key={rowKey} className="border-b border-border/20">
                    {[6, 28, 40, 14, 16, 24].map((w) => (
                      <td key={`${rowKey}-cell-${w}`} className="px-4 py-3">
                        <Skeleton
                          className={`h-4 w-${w} ${w === 24 ? 'ml-auto' : ''}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    <Users className="mx-auto mb-3 h-10 w-10 opacity-30" />
                    Không tìm thấy tài khoản
                  </td>
                </tr>
              ) : (
                filtered.map((acc) => {
                  const roleName = acc.roleName ?? 'USER'
                  const status = getStatus(acc)
                  return (
                    <tr
                      key={String(acc.id)}
                      className="border-b border-border/20 transition-colors hover:bg-card/40 last:border-0"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 overflow-hidden rounded-full bg-secondary/40">
                            {acc.avatarUrl ? (
                              <Image
                                src={acc.avatarUrl}
                                alt={acc.name || 'Avatar'}
                                width={32}
                                height={32}
                                className="h-full w-full object-cover"
                                unoptimized={acc.avatarUrl.includes('dicebear.com') || acc.avatarUrl.includes('.svg')}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-muted-foreground">
                                {(acc.name || 'U').slice(0, 1).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-stats text-xs text-muted-foreground">
                            #{acc.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {acc.name || '—'}
                        </p>
                        <p className="text-muted-foreground">{acc.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${roleColor[roleName] ?? 'bg-muted/40 text-muted-foreground'}`}
                        >
                          {roleName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                            acc.active
                              ? 'border-green-500/25 bg-green-500/10 text-green-400'
                              : 'border-destructive/25 bg-destructive/10 text-destructive'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {acc.createdAt
                          ? new Date(acc.createdAt).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const detail = await apiRequest<AccountRow>(
                                  API_ENDPOINTS.accountManagement.byId(
                                    acc.customerId || acc.id
                                  )
                                )
                                const data = detail.data
                                setDetailAccount({
                                  ...acc,
                                  ...data,
                                  roleName: normalizeRole(
                                    data.roleName || data.role || acc.roleName
                                  ),
                                  active: Boolean(data.active ?? data.isActive),
                                })
                              } catch {
                                setDetailAccount(acc)
                              }
                            }}
                            className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailAccount(acc)}
                            className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            title="Sửa nhanh"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                type="button"
                                disabled={
                                  actionLoading === acc.id ||
                                  roleName === 'ADMIN'
                                }
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                  acc.active
                                    ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                                    : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                                }`}
                              >
                                {acc.active ? (
                                  <Ban className="h-3.5 w-3.5" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                {acc.active ? 'Ban' : 'Unban'}
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {acc.active
                                    ? 'Vô hiệu hoá tài khoản?'
                                    : 'Kích hoạt tài khoản?'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn chắc chắn muốn{' '}
                                  {acc.active ? 'vô hiệu hoá' : 'kích hoạt'} tài
                                  khoản <strong>{acc.email}</strong>?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleToggleActive(acc)}
                                  className={
                                    acc.active
                                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                      : ''
                                  }
                                >
                                  Xác nhận
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Trang {page + 1} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-border/50 p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg border border-border/50 p-1.5 text-muted-foreground hover:bg-accent disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
