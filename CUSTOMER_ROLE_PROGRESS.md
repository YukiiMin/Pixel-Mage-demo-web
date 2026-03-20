# Customer Role Progress

Ngay cap nhat: 2026-03-16

## Pham vi tong hop
Tong hop cac hang muc da thuc hien va chua thuc hien cho role Customer trong FE hien tai, dua tren code trong workspace va cac task vua implement.

## Da hoan thanh

### 1. Auth va giao dien co ban
- Hoan thien trang dang nhap: src/app/login/page.tsx
- Hoan thien trang dang ky: src/app/register/page.tsx
- Nang cap form auth giao dien mystic + motion:
  - src/components/customer/auth/login-form.tsx
  - src/components/customer/auth/register-form.tsx
- Da co nut hien/an mat khau (Eye/EyeOff) cho login va register.

### 2. Tarot setup va session
- Da co setup page Tarot 3 buoc: src/components/customer/tarot/tarot-setup-page.tsx
- Da tach Spread Selector thanh component rieng:
  - src/components/customer/tarot/spread-selector.tsx
- Da co Tarot session page va cac phase:
  - src/components/customer/tarot/tarot-session-page.tsx
  - src/components/customer/tarot/phases/shuffling-phase.tsx
  - src/components/customer/tarot/phases/card-draw-area.tsx
  - src/components/customer/tarot/phases/card-reveal.tsx
  - src/components/customer/tarot/phases/ai-stream-panel.tsx
  - src/components/customer/tarot/phases/completion-phase.tsx
- Da co lich su doc bai:
  - src/components/customer/tarot/reading-history.tsx

### 3. My Cards
- Da co trang My Cards va card grid:
  - src/components/customer/my-cards/my-cards-page.tsx
  - src/components/customer/my-cards/card-grid.tsx
- Da bo sung modal chi tiet card:
  - src/components/customer/my-cards/card-detail-modal.tsx
- Da co collection progress:
  - src/components/customer/my-cards/collection-progress.tsx

### 4. Orders
- Da co trang danh sach don hang:
  - src/app/orders/page.tsx
  - src/components/customer/orders/orders-page.tsx
- Da bo sung link xem chi tiet tren tung order.
- Da bo sung trang chi tiet don hang:
  - src/app/orders/[id]/page.tsx
  - src/components/customer/orders/order-detail.tsx
- Da bo sung hook lay chi tiet order:
  - src/hooks/ui/use-order-detail.ts
- Da bo sung type cho order detail:
  - src/types/order.ts

### 5. Profile
- Da co trang Profile:
  - src/app/profile/page.tsx
  - src/components/customer/profile/profile-page.tsx
- Da bo sung chuc nang sua profile inline (name, phone).
- Da bo sung hook cap nhat profile:
  - src/hooks/ui/use-auth.ts (useUpdateProfile)
- Da tich hop ReadingHistory vao profile.

### 6. API Proxy theo chuan Next.js App Router
- Da bo sung catch-all proxy route:
  - src/app/api/[...proxy]/route.ts
- Route nay da ho tro GET/POST/PUT/PATCH/DELETE forward ve backend.

### 7. Shared UI ho tro Customer
- Da co empty state dung chung:
  - src/components/ui/empty-state.tsx

## Chua hoan thanh / Can tiep tuc

### 1. Hoan thien nghiep vu chuyen sau Tarot
- Can xac nhan muc do hoan thien thuc te cua ai-stream-panel (stream realtime tu backend).
- Can test day du luong deck mode YOUR_DECK voi du lieu card so huu thuc te.
- Can test full e2e toan bo flow setup -> session -> reveal -> completion.

### 2. Checkout va thanh toan
- Can xac nhan day du flow checkout theo backend (Stripe/VNPay) trong role Customer.
- Can bo sung/hoan thien test cho callback va trang thai thanh toan sau redirect.

### 3. Marketplace nang cao
- Can xac nhan bo loc/tim kiem/sap xep nang cao da day du theo business requirement.
- Can xac nhan tinh nang add-to-cart hoac mua ngay neu scope yeu cau.

### 4. Profile va Orders hardening
- Can bo sung validate dau vao profile edit (format phone, trim, rule bat buoc).
- Can bo sung xu ly loi chi tiet hon cho update profile va order detail fallback.

### 5. Kiem thu va chat luong
- Chua pass type-check toan project do loi co san ngoai pham vi Customer (chart.tsx, api.ts, test setup).
- Can bo sung test cho cac module Customer (unit/integration/e2e).

## Ghi chu
- Phan "Da hoan thanh" la trang thai implement trong code hien tai.
- Phan "Chua hoan thanh" tap trung vao khoang trong nghiep vu, hardening va test de san sang production.
