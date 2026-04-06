'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/types/api'
import {
  Ban,
  CreditCard,
  Eye,
  Globe,
  Hash,
  Key,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Shield,
  ShoppingCart,
  Trash2,
  Unlock,
  User,
  UserCheck,
  UserX,
  Wallet
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface UserDetail {
  id: number | string
  name: string
  email: string
  phoneNumber?: string
  avatarUrl?: string
  roleName: string
  active: boolean
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string
  lastLoginIp?: string
  lastLoginDevice?: string

  // Address Information
  addresses?: Array<{
    id: number
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    isDefault: boolean
  }>

  // Phygital Inventory
  digitalCardsCount: number
  cardsByRarity: {
    legendary: number
    rare: number
    common: number
  }
  totalOrdersCount: number
  totalSpent: number
  walletBalance?: number

  // NFC Claim History
  nfcClaimHistory?: Array<{
    id: number
    cardUuid: string
    cardName: string
    claimedAt: string
    deviceInfo: string
  }>
}

interface UserDetailProfileProps {
  user: UserDetail | null
  open: boolean
  onClose: () => void
  onRefresh?: () => void
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export function UserDetailProfile({ user, open, onClose, onRefresh }: UserDetailProfileProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [banReason, setBanReason] = useState('')
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [newRole, setNewRole] = useState('')

  if (!user) return null

  const handleBanUser = async () => {
    if (!banReason.trim()) {
      toast.error('Vui lòng nhập lý do khóa tài khoản')
      return
    }

    setActionLoading('ban')
    try {
      // TODO: Implement API call to ban user
      // await apiRequest(`/api/admin/users/${user.id}/ban`, {
      //   method: 'POST',
      //   body: JSON.stringify({ reason: banReason })
      // })

      toast.success('Tài khoản đã bị khóa thành công')
      setShowBanDialog(false)
      setBanReason('')
      onRefresh?.()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể khóa tài khoản'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnbanUser = async () => {
    setActionLoading('unban')
    try {
      // TODO: Implement API call to unban user
      // await apiRequest(`/api/admin/users/${user.id}/unban`, {
      //   method: 'POST'
      // })

      toast.success('Tài khoản đã được mở khóa')
      onRefresh?.()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể mở khóa tài khoản'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleChangeRole = async () => {
    if (!newRole) {
      toast.error('Vui lòng chọn vai trò mới')
      return
    }

    setActionLoading('role')
    try {
      // TODO: Implement API call to change role
      // await apiRequest(`/api/admin/users/${user.id}/role`, {
      //   method: 'PUT',
      //   body: JSON.stringify({ role: newRole })
      // })

      toast.success('Vai trò đã được cập nhật')
      setShowRoleDialog(false)
      setNewRole('')
      onRefresh?.()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể thay đổi vai trò'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleForcePasswordReset = async () => {
    setActionLoading('reset-password')
    try {
      // TODO: Implement API call to force password reset
      // await apiRequest(`/api/admin/users/${user.id}/force-password-reset`, {
      //   method: 'POST'
      // })

      toast.success('Email đặt lại mật khẩu đã được gửi')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể gửi email đặt lại mật khẩu'))
    } finally {
      setActionLoading(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const defaultAddress = user.addresses?.find(addr => addr.isDefault)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-secondary/40">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized={user.avatarUrl.includes('dicebear.com') || user.avatarUrl.includes('.svg')}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">#{user.id} • {user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Khối 1: Thông tin cá nhân & Liên hệ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân & Liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Họ và tên</Label>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{user.email}</p>
                    {user.emailVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Đã xác thực
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Số điện thoại</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{user.phoneNumber || '—'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Vai trò</Label>
                  <Badge
                    variant={user.roleName === 'ADMIN' ? 'destructive' : user.roleName === 'STAFF' ? 'default' : 'secondary'}
                  >
                    {user.roleName}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Sổ địa chỉ
                </Label>
                {defaultAddress ? (
                  <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                    <Badge variant="outline" className="mb-2">Mặc định</Badge>
                    <p className="text-sm">{defaultAddress.street}</p>
                    <p className="text-sm">
                      {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zipCode}
                    </p>
                    <p className="text-sm">{defaultAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Chưa có địa chỉ nào</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Khối 2: Tài sản tại PixelMage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Tài sản tại PixelMage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Tổng thẻ Digital</Label>
                  <p className="text-2xl font-bold text-primary">{user.digitalCardsCount}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Tổng đã chi tiêu</Label>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(user.totalSpent)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Phân bố thẻ theo độ hiếm</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg">
                    <p className="text-lg font-bold text-yellow-600">{user.cardsByRarity.legendary}</p>
                    <p className="text-xs text-muted-foreground">Legendary</p>
                  </div>
                  <div className="text-center p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{user.cardsByRarity.rare}</p>
                    <p className="text-xs text-muted-foreground">Rare</p>
                  </div>
                  <div className="text-center p-2 bg-gradient-to-r from-gray-500/20 to-gray-600/20 rounded-lg">
                    <p className="text-lg font-bold text-gray-600">{user.cardsByRarity.common}</p>
                    <p className="text-xs text-muted-foreground">Common</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Lịch sử Gacha
                  </Label>
                  <p className="font-medium">{user.totalOrdersCount} đơn hàng</p>
                </div>
                {user.walletBalance !== undefined && (
                  <div>
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Ví nội bộ
                    </Label>
                    <p className="font-medium">{formatCurrency(user.walletBalance)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Khối 3: Bảo mật & Hoạt động */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bảo mật & Hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Trạng thái</Label>
                  <Badge
                    variant={user.active ? "default" : "destructive"}
                    className="mt-1"
                  >
                    {user.active ? (
                      <>
                        <UserCheck className="h-3 w-3 mr-1" />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <UserX className="h-3 w-3 mr-1" />
                        Đã khóa
                      </>
                    )}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Ngày tạo</Label>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              {user.lastLoginAt && (
                <div>
                  <Label className="text-sm text-muted-foreground">Lần đăng nhập cuối</Label>
                  <div className="mt-1 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">{formatDate(user.lastLoginAt)}</p>
                    {user.lastLoginIp && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Globe className="h-3 w-3" />
                        IP: {user.lastLoginIp}
                      </p>
                    )}
                    {user.lastLoginDevice && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Hash className="h-3 w-3" />
                        Thiết bị: {user.lastLoginDevice}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {user.nfcClaimHistory && user.nfcClaimHistory.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Lịch sử quét thẻ NFC (5 gần nhất)
                  </Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {user.nfcClaimHistory.slice(0, 5).map((claim) => (
                      <div key={claim.id} className="text-xs p-2 bg-muted/20 rounded">
                        <p className="font-medium">{claim.cardName}</p>
                        <p className="text-muted-foreground">
                          {formatDate(claim.claimedAt)} • {claim.deviceInfo}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Khối 4: Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Đổi vai trò</p>
                    <p className="text-sm text-muted-foreground">Thay đổi quyền truy cập của người dùng</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRoleDialog(true)}
                    disabled={actionLoading === 'role'}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Đổi vai trò
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Force Password Reset</p>
                    <p className="text-sm text-muted-foreground">Buộc người dùng đổi mật khẩu lần đăng nhập tiếp theo</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleForcePasswordReset}
                    disabled={actionLoading === 'reset-password'}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Gửi email reset
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {user.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.active
                        ? 'Ngăn người dùng truy cập hệ thống'
                        : 'Cho phép người dùng truy cập lại'
                      }
                    </p>
                  </div>
                  {user.active ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowBanDialog(true)}
                      disabled={actionLoading === 'ban'}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Khóa
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleUnbanUser}
                      disabled={actionLoading === 'unban'}
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Mở khóa
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ban Dialog */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Ban className="h-5 w-5" />
                Khóa tài khoản
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Bạn có chắc muốn khóa tài khoản <strong>{user.name}</strong> ({user.email})?
              </p>
              <div>
                <Label htmlFor="ban-reason">Lý do khóa</Label>
                <Textarea
                  id="ban-reason"
                  placeholder="Nhập lý do khóa tài khoản..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBanDialog(false)}
                  disabled={actionLoading === 'ban'}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBanUser}
                  disabled={actionLoading === 'ban'}
                >
                  {actionLoading === 'ban' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang khóa...
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Khóa tài khoản
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Change Role Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Đổi vai trò
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Chọn vai trò mới cho <strong>{user.name}</strong> ({user.email}):
              </p>
              <div>
                <Label htmlFor="new-role">Vai trò mới</Label>
                <select
                  id="new-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Chọn vai trò --</option>
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRoleDialog(false)}
                  disabled={actionLoading === 'role'}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleChangeRole}
                  disabled={actionLoading === 'role'}
                >
                  {actionLoading === 'role' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cập nhật vai trò
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
