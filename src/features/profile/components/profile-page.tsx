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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useAuth,
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from '@/features/auth/hooks/use-auth'
import { getStoredUserId } from '@/lib/api-config'
import {
  AlertCircle,
  Check,
  KeyRound,
  LoaderCircle,
  LogOut,
  Pencil,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function ProfilePage() {
  const router = useRouter()
  const { logout } = useAuth()

  const [userId, setUserId] = useState<number | null>(null)
  useEffect(() => {
    setUserId(getStoredUserId())
  }, [])

  const {
    data: profile,
    isLoading: isProfileLoading,
    isError,
  } = useProfile(userId)

  let status: 'loading' | 'ready' | 'unavailable' | 'error' = 'loading'
  let statusMessage = ''

  if (isProfileLoading) {
    status = 'loading'
    statusMessage = 'Đang tải hồ sơ người dùng...'
  } else if (isError) {
    status = 'error'
    statusMessage = 'Không thể tải hồ sơ từ BE. Chức năng chưa cập nhật.'
  } else if (profile) {
    status = 'ready'
  } else if (!userId) {
    status = 'unavailable'
    statusMessage =
      'Chưa xác định được tài khoản hiện tại. Chức năng Profile chưa cập nhật cho phiên này.'
  }

  const {
    updateProfile,
    loading: saving,
    errorMessage: saveError,
  } = useUpdateProfile()
  const {
    changePassword,
    loading: changingPwd,
    errorMessage: changePwdError,
  } = useChangePassword()

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [localProfile, setLocalProfile] = useState(profile)

  const [pwdEditing, setPwdEditing] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')
  const [localPwdError, setLocalPwdError] = useState('')

  // ✅ AlertDialog confirm trước khi đổi mật khẩu
  const [showPwdConfirmDialog, setShowPwdConfirmDialog] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const startEdit = () => {
    const p = localProfile ?? profile
    setEditName(p?.name ?? '')
    setEditPhone(p?.phoneNumber ?? '')
    setEditing(true)
  }

  const cancelEdit = () => setEditing(false)

  const saveEdit = async () => {
    try {
      const updated = await updateProfile({
        name: editName.trim() || undefined,
        phoneNumber: editPhone.trim() || undefined,
      })
      if (updated) setLocalProfile(updated)
      setEditing(false)
    } catch {
      // saveError already set
    }
  }

  const startPwdEdit = () => {
    setPwdEditing(true)
    setPwdSuccess('')
    setLocalPwdError('')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const cancelPwdEdit = () => {
    setPwdEditing(false)
    setLocalPwdError('')
  }

  // Step 1: validate locally → show AlertDialog confirm
  const requestPwdChange = () => {
    setLocalPwdError('')
    if (!oldPassword || !newPassword || !confirmPassword) {
      setLocalPwdError('Vui lòng nhập đầy đủ thông tin.')
      return
    }
    if (newPassword !== confirmPassword) {
      setLocalPwdError('Mật khẩu mới và xác nhận không khớp.')
      return
    }
    if (newPassword.length < 8) {
      setLocalPwdError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }
    // Show confirm dialog
    setShowPwdConfirmDialog(true)
  }

  // Step 2: user confirmed → call API → force logout
  const confirmPwdChange = async () => {
    setShowPwdConfirmDialog(false)
    try {
      const success = await changePassword({ oldPassword, newPassword })
      if (success) {
        setPwdSuccess('Đổi mật khẩu thành công! Đang đăng xuất...')
        setPwdEditing(false)
        // Force logout with slight delay so user sees the message
        setTimeout(async () => {
          await logout()
          router.push('/login')
        }, 1500)
      }
    } catch {
      // changePwdError set by hook
    }
  }

  const displayProfile = localProfile ?? profile

  if (status === 'loading') {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <div className="glass-card rounded-2xl border border-border/50 p-8 text-center">
          <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Đang tải hồ sơ...
          </p>
        </div>
      </div>
    )
  }

  if (status !== 'ready' || !profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        <div className="glass-card rounded-2xl border border-amber-300/30 bg-amber-300/5 p-6">
          <p className="text-sm font-semibold text-amber-200">
            {statusMessage || 'Chức năng Profile chưa cập nhật.'}
          </p>
        </div>
      </div>
    )
  }

  const isLocalProvider =
    !displayProfile?.authProvider || displayProfile?.authProvider === 'LOCAL'

  return (
    <>
      {/* ✅ AlertDialog confirm đổi mật khẩu */}
      <AlertDialog
        open={showPwdConfirmDialog}
        onOpenChange={setShowPwdConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Xác nhận đổi mật khẩu
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sau khi đổi mật khẩu thành công, bạn sẽ bị{' '}
              <strong className="text-foreground">
                đăng xuất khỏi tất cả phiên
              </strong>{' '}
              và cần đăng nhập lại bằng mật khẩu mới.
              <br />
              <br />
              Bạn có chắc chắn muốn tiếp tục không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPwdChange}
              className="gradient-gold-purple-bg text-primary-foreground"
            >
              Xác nhận đổi mật khẩu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 pb-20">
        {/* Header section */}
        <section className="mb-6 rounded-3xl border border-border/40 bg-linear-to-r from-card/80 via-card/60 to-card/40 p-6 md:p-8">
          <p className="badge-mystic mb-3 inline-flex">Identity</p>
          <h1
            className="text-4xl leading-tight text-foreground md:text-5xl"
            style={{ fontFamily: 'Fruktur, var(--font-heading)' }}
          >
            Profile
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            Thông tin tài khoản đồng bộ trực tiếp từ backend.
          </p>
        </section>

        {/* Profile info card */}
        <div className="glass-card rounded-2xl border border-border/50 p-6">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-foreground">
              <UserRound className="h-5 w-5 text-primary" />
              <p className="text-lg font-semibold">{displayProfile?.name}</p>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={startEdit}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label
                    htmlFor="edit-name"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Họ và tên
                  </label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nhập tên của bạn"
                    className="bg-card/60"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="edit-phone"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Số điện thoại
                  </label>
                  <Input
                    id="edit-phone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="bg-card/60"
                  />
                </div>
              </div>
              {saveError && (
                <p className="text-xs text-destructive">{saveError}</p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={saveEdit}
                  disabled={saving}
                  className="gradient-gold-purple-bg rounded-full px-5 text-xs font-semibold text-primary-foreground glow-gold"
                >
                  {saving ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Lưu thay đổi
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-full px-5 text-xs"
                >
                  <X className="h-3.5 w-3.5" /> Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <p className="text-muted-foreground">
                Email:{' '}
                <span className="text-foreground">{displayProfile?.email}</span>
              </p>
              <p className="text-muted-foreground">
                Số điện thoại:{' '}
                <span className="text-foreground">
                  {displayProfile?.phoneNumber || 'Chưa cập nhật'}
                </span>
              </p>
              {/* ✅ Ẩn role ID — không hiển thị ra ngoài */}
              {/* ✅ Ẩn Provider LOCAL — chỉ hiển thị nếu là Google */}
              {displayProfile?.authProvider &&
                displayProfile.authProvider !== 'LOCAL' && (
                  <p className="text-muted-foreground">
                    Đăng nhập qua:{' '}
                    <span className="text-foreground">
                      {displayProfile.authProvider}
                    </span>
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Password section (LOCAL accounts only) */}
        {isLocalProvider && (
          <div className="glass-card mt-6 rounded-2xl border border-border/50 p-6">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-foreground">
                <KeyRound className="h-5 w-5 text-primary" />
                <p className="text-lg font-semibold">Mật khẩu và Bảo mật</p>
              </div>
              {!pwdEditing && (
                <button
                  type="button"
                  onClick={startPwdEdit}
                  className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" /> Đổi mật khẩu
                </button>
              )}
            </div>

            {pwdSuccess && (
              <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-400 border border-green-500/20">
                {pwdSuccess}
              </div>
            )}

            {pwdEditing ? (
              <div className="space-y-4">
                <div className="space-y-3 max-w-sm">
                  {[
                    {
                      label: 'Mật khẩu hiện tại',
                      value: oldPassword,
                      setter: setOldPassword,
                      id: 'old-pwd',
                    },
                    {
                      label: 'Mật khẩu mới',
                      value: newPassword,
                      setter: setNewPassword,
                      id: 'new-pwd',
                    },
                    {
                      label: 'Xác nhận mật khẩu mới',
                      value: confirmPassword,
                      setter: setConfirmPassword,
                      id: 'confirm-pwd',
                    },
                  ].map(({ label, value, setter, id }) => (
                    <div key={id} className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        {label}
                      </label>
                      <Input
                        id={id}
                        type="password"
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={label}
                        className="bg-card/60"
                      />
                    </div>
                  ))}
                </div>

                {(localPwdError || changePwdError) && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <p>{localPwdError || changePwdError}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={requestPwdChange}
                    disabled={changingPwd}
                    className="gradient-gold-purple-bg rounded-full px-5 text-xs font-semibold text-primary-foreground glow-gold"
                  >
                    {changingPwd ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    Đổi mật khẩu
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={cancelPwdEdit}
                    disabled={changingPwd}
                    className="rounded-full px-5 text-xs"
                  >
                    <X className="h-3.5 w-3.5" /> Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>Sử dụng mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
                <p className="mt-1 text-xs">Cập nhật lần cuối: Chưa rõ</p>
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="mt-6 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Button>
        </div>
      </div>
    </>
  )
}
