import { type NextRequest, NextResponse } from 'next/server'

const BE_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.BACKEND_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8080'
).replace(/\/$/, '')

const ACCESS_COOKIE = 'pm_access_token'
const REFRESH_COOKIE = 'pm_refresh_token'
const LOGIN_COOKIE = 'pm_logged_in'
const USER_ID_COOKIE = 'pm_user_id'
const EMAIL_COOKIE = 'pm_email'
const NAME_COOKIE = 'pm_name'

const COOKIE_MAX_AGE_SECONDS = 60 * 15 // 15 minutes

function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

function parseJsonSafe(text: string): unknown {
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function pickRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null
  }
  return value as Record<string, unknown>
}

function normalizeAccessToken(rawToken: unknown): string | null {
  const token = String(rawToken ?? '')
    .trim()
    .replace(/^Bearer\s+/i, '')
  return token || null
}

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value ?? 0)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function extractFromJwt(token: string): {
  userId: number | null
  email: string | null
  name: string | null
  role: string | null
} {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) {
      return { userId: null, email: null, name: null, role: null }
    }
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decoded = Buffer.from(padded, 'base64').toString('utf8')
    const jwtPayload = JSON.parse(decoded) as Record<string, unknown>

    const userId =
      parsePositiveInt(jwtPayload.userId) ??
      parsePositiveInt(jwtPayload.accountId) ??
      parsePositiveInt(jwtPayload.customerId) ??
      parsePositiveInt(jwtPayload.id) ??
      parsePositiveInt(jwtPayload.uid) ??
      parsePositiveInt(jwtPayload.nameid) ??
      parsePositiveInt(
        jwtPayload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ]
      ) ??
      parsePositiveInt(
        jwtPayload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier'
        ]
      )
    const email =
      String(jwtPayload.email ?? jwtPayload.sub ?? '').trim() || null
    const name =
      String(jwtPayload.name ?? jwtPayload.fullName ?? '').trim() || null

    let role = null
    const rawRole =
      jwtPayload.role ??
      jwtPayload.Role ??
      jwtPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    if (Array.isArray(rawRole)) {
      role = String(rawRole[0]).toUpperCase()
    } else if (rawRole) {
      role = String(rawRole).toUpperCase()
    }

    return { userId, email, name, role }
  } catch {
    return { userId: null, email: null, name: null, role: null }
  }
}

function normalizeLoginPayload(payload: unknown): {
  token: string | null
  refreshToken: string | null
  userId: number | null
  email: string | null
  name: string | null
  role: string | null
} {
  const raw = pickRecord(payload) ?? {}
  const data = pickRecord(raw.data)
  const account =
    pickRecord(raw.account) ??
    pickRecord(raw.user) ??
    pickRecord(data?.account) ??
    pickRecord(data?.user) ??
    null
  const token = normalizeAccessToken(
    raw.accessToken ?? raw.token ?? data?.accessToken ?? data?.token
  )
  const refreshToken =
    String(raw.refreshToken ?? data?.refreshToken ?? '').trim() || null

  let userId =
    parsePositiveInt(account?.id) ??
    parsePositiveInt(account?.accountId) ??
    parsePositiveInt(account?.userId) ??
    parsePositiveInt(account?.customerId) ??
    parsePositiveInt(raw.accountId) ??
    parsePositiveInt(raw.userId) ??
    parsePositiveInt(raw.customerId) ??
    parsePositiveInt(data?.accountId) ??
    parsePositiveInt(data?.userId) ??
    parsePositiveInt(data?.customerId)

  let email =
    String(account?.email ?? raw.email ?? data?.email ?? '').trim() || null
  let name =
    String(
      account?.name ?? account?.fullName ?? raw.name ?? data?.name ?? ''
    ).trim() || null

  let role = null
  const accountRole = pickRecord(account?.role) ?? account?.role
  if (accountRole && typeof accountRole === 'object') {
    const rec = accountRole as Record<string, unknown>
    role =
      String(rec.roleName ?? '')
        .trim()
        .toUpperCase() || null
  } else if (accountRole || raw.role || data?.role) {
    role =
      String(accountRole ?? raw.role ?? data?.role)
        .trim()
        .toUpperCase() || null
  }

  const tokenStr = token
  if (tokenStr && (!userId || !email || !role)) {
    const jwtInfo = extractFromJwt(tokenStr)
    if (!userId && jwtInfo.userId) {
      userId = jwtInfo.userId
    }
    if (!email && jwtInfo.email) {
      email = jwtInfo.email
    }
    if (!name && jwtInfo.name) {
      name = jwtInfo.name
    }
    if (!role && jwtInfo.role) {
      role = jwtInfo.role
    }
  }

  return {
    token: tokenStr,
    refreshToken,
    userId,
    email,
    name,
    role,
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let credentials: unknown
  try {
    credentials = await request.json()
  } catch {
    return NextResponse.json(
      { message: 'Invalid request payload.' },
      { status: 400 }
    )
  }

  let upstream: Response
  try {
    upstream = await fetch(`${BE_BASE_URL}/api/accounts/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    })
  } catch {
    return NextResponse.json(
      { message: 'Upstream service is unreachable.' },
      { status: 502 }
    )
  }

  const upstreamText = await upstream.text()
  const upstreamPayload = parseJsonSafe(upstreamText)

  if (!upstream.ok) {
    return new NextResponse(
      upstreamText || JSON.stringify({ message: 'Login failed.' }),
      {
        status: upstream.status,
        headers: {
          'content-type':
            upstream.headers.get('content-type') ?? 'application/json',
        },
      }
    )
  }

  const normalized = normalizeLoginPayload(upstreamPayload)

  if (!normalized.token) {
    return NextResponse.json(
      { message: 'Login response missing access token.' },
      { status: 502 }
    )
  }

  const response = NextResponse.json(
    {
      authenticated: true,
      userId: normalized.userId,
      email: normalized.email,
      name: normalized.name,
    },
    { status: 200 }
  )

  response.cookies.set({
    name: ACCESS_COOKIE,
    value: normalized.token,
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })

  if (normalized.refreshToken) {
    // Refresh token will typically live longer, e.g. 30 days
    response.cookies.set({
      name: REFRESH_COOKIE,
      value: normalized.refreshToken,
      httpOnly: true,
      secure: isProd(),
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  response.cookies.set({
    name: LOGIN_COOKIE,
    value: '1',
    httpOnly: false,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  })

  // pm_user_id is non-HttpOnly so the client can read it from document.cookie
  // for fast userId resolution without an extra round-trip to /api/auth/session.
  if (normalized.userId) {
    response.cookies.set({
      name: USER_ID_COOKIE,
      value: String(normalized.userId),
      httpOnly: false,
      secure: isProd(),
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })
  }
  if (normalized.email) {
    response.cookies.set({
      name: EMAIL_COOKIE,
      value: encodeURIComponent(normalized.email),
      httpOnly: true,
      secure: isProd(),
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })
  }
  if (normalized.name) {
    response.cookies.set({
      name: NAME_COOKIE,
      value: encodeURIComponent(normalized.name),
      httpOnly: true,
      secure: isProd(),
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })
  }
  if (normalized.role) {
    response.cookies.set({
      name: 'pm_user_role',
      value: normalized.role,
      httpOnly: false,
      secure: isProd(),
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_SECONDS,
    })
  }

  return response
}
