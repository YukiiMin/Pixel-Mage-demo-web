import { apiRequest } from '@/lib/api-config'
import type { PageResponse } from '@/types/api'
import type { CardContent, CardContentType, CardFramework, CardGalleryFilters, CardTemplateWithContent, Rarity } from '@/types/card-gallery'

// Define response types inline since they're not in api-contracts yet
interface CardFrameworkResponse {
  frameworkId: string
  name: string
  description: string
  imageUrl?: string
  totalCards: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

interface CardTemplateResponse {
  cardTemplateId: number
  name: string
  cardCode?: string
  description?: string
  imagePath?: string
  rarity: string
  frameworkId?: string
  frameworkName?: string
  totalContentPieces?: number
  publicContentCount?: number
  privateContentCount?: number
  dropRate?: number
  isOwned?: boolean
  ownerCount?: number
  createdAt?: string
  updatedAt?: string
}

interface CardTemplateResponseSummary {
  cardTemplateId: number
  name: string
  cardCode?: string
  description?: string
  imagePath?: string
  rarity: string
  frameworkId?: string
  frameworkName?: string
  totalContentPieces?: number
  publicContentCount?: number
  privateContentCount?: number
  dropRate?: number
  isOwned?: boolean
  ownerCount?: number
  createdAt?: string
  updatedAt?: string
}

interface CardContentResponse {
  contentId: string
  cardTemplateId: number
  contentType: string
  title?: string
  textData?: string
  contentUrl?: string
  thumbnailUrl?: string
  order: number
  isPublic: boolean
  createdAt: string
  updatedAt?: string
}

// ─────────────────────────────────────────────
// Card Framework API
// ─────────────────────────────────────────────
export async function getCardFrameworks(): Promise<CardFramework[]> {
  try {
    const response = await apiRequest<CardFrameworkResponse[]>('/api/card-frameworks')
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch card frameworks:', error)
    throw error
  }
}

// ─────────────────────────────────────────────
// Card Template API
// ─────────────────────────────────────────────
export async function getCardTemplates(filters: CardGalleryFilters): Promise<PageResponse<CardTemplateWithContent>> {
  try {
    const params = new URLSearchParams()

    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('size', filters.limit.toString())
    if (filters.sortBy) {
      const sortValue = filters.sortOrder === 'desc'
        ? `${filters.sortBy},desc`
        : `${filters.sortBy},asc`
      params.append('sort', sortValue)
    }

    // Framework filter
    if (filters.frameworkId) {
      params.append('frameworkId', filters.frameworkId)
    }

    // Rarity filter
    if (filters.rarity && filters.rarity !== 'ALL') {
      params.append('rarity', filters.rarity)
    }

    // Search filter
    if (filters.search) {
      params.append('search', filters.search)
    }

    const response = await apiRequest<PageResponse<CardTemplateResponseSummary>>(
      `/api/card-templates?${params.toString()}`
    )

    // Transform BE response to FE types
    const transformedData = response.data?.content?.map(template => ({
      cardTemplateId: template.cardTemplateId,
      name: template.name,
      cardCode: template.cardCode,
      description: template.description,
      imagePath: template.imagePath,
      rarity: template.rarity as Rarity,
      frameworkId: template.frameworkId || '',
      frameworkName: template.frameworkName || '',
      totalContentPieces: template.totalContentPieces || 0,
      publicContentCount: template.publicContentCount || 0,
      privateContentCount: template.privateContentCount || 0,
      dropRate: template.dropRate,
      isOwned: template.isOwned || false,
      ownerCount: template.ownerCount || 0,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    })) || []

    return {
      content: transformedData,
      totalPages: response.data?.totalPages || 0,
      totalElements: response.data?.totalElements || 0,
      size: response.data?.size || 0,
      number: response.data?.number || 0,
      first: response.data?.first || false,
      last: response.data?.last || false,
      empty: response.data?.empty ?? transformedData.length === 0,
      numberOfElements: response.data?.numberOfElements ?? transformedData.length
    }
  } catch (error) {
    console.error('Failed to fetch card templates:', error)
    throw error
  }
}

export async function getCardTemplateById(id: number): Promise<CardTemplateWithContent | null> {
  try {
    const response = await apiRequest<CardTemplateResponse>(`/api/card-templates/${id}`)

    if (!response.data) return null

    // Get card contents separately
    const contents = await getCardContentsByTemplateId(id)

    return {
      cardTemplateId: response.data.cardTemplateId,
      name: response.data.name,
      cardCode: response.data.cardCode,
      description: response.data.description,
      imagePath: response.data.imagePath,
      rarity: response.data.rarity as Rarity,
      frameworkId: response.data.frameworkId || '',
      frameworkName: response.data.frameworkName || '',
      totalContentPieces: contents.length,
      publicContentCount: contents.filter(c => c.isPublic).length,
      privateContentCount: contents.filter(c => !c.isPublic).length,
      cardContents: contents,
      dropRate: response.data.dropRate,
      isOwned: response.data.isOwned || false,
      ownerCount: response.data.ownerCount || 0,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt
    }
  } catch (error) {
    console.error('Failed to fetch card template:', error)
    throw error
  }
}

export async function getCardTemplatesByRarity(
  rarity: Rarity,
  filters: Omit<CardGalleryFilters, 'rarity'>
): Promise<PageResponse<CardTemplateWithContent>> {
  return getCardTemplates({ ...filters, rarity })
}

export async function getCardTemplatesByFramework(
  frameworkId: string,
  filters: Omit<CardGalleryFilters, 'frameworkId'>
): Promise<PageResponse<CardTemplateWithContent>> {
  return getCardTemplates({ ...filters, frameworkId })
}

export async function searchCardTemplates(
  search: string,
  filters: Omit<CardGalleryFilters, 'search'>
): Promise<PageResponse<CardTemplateWithContent>> {
  return getCardTemplates({ ...filters, search })
}

// ─────────────────────────────────────────────
// Card Content API
// ─────────────────────────────────────────────
export async function getCardContentsByTemplateId(templateId: number): Promise<CardContent[]> {
  try {
    const response = await apiRequest<CardContentResponse[]>(`/api/card-contents/template/${templateId}`)

    // Transform BE response to FE types
    return (response.data?.map(content => ({
      contentId: content.contentId,
      cardTemplateId: content.cardTemplateId,
      contentType: content.contentType as CardContentType,
      title: content.title,
      textData: content.textData,
      contentUrl: content.contentUrl,
      thumbnailUrl: content.thumbnailUrl,
      order: content.order,
      isPublic: content.isPublic,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt
    })) || []) satisfies CardContent[]
  } catch (error) {
    console.error('Failed to fetch card contents:', error)
    throw error
  }
}

// ─────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────
export function buildGalleryFilters(searchParams: URLSearchParams): CardGalleryFilters {
  return {
    page: parseInt(searchParams.get('page') || '0'),
    limit: parseInt(searchParams.get('size') || '12'),
    frameworkId: searchParams.get('frameworkId') || undefined,
    search: searchParams.get('search') || '',
    rarity: (searchParams.get('rarity') as Rarity) || 'ALL',
    sortBy: searchParams.get('sort')?.split(',')[0] as any || 'name',
    sortOrder: searchParams.get('sort')?.split(',')[1] as any || 'asc'
  }
}

export function buildFilterURL(filters: Partial<CardGalleryFilters>): string {
  const params = new URLSearchParams()

  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('size', filters.limit.toString())
  if (filters.frameworkId) params.append('frameworkId', filters.frameworkId)
  if (filters.search) params.append('search', filters.search)
  if (filters.rarity && filters.rarity !== 'ALL') params.append('rarity', filters.rarity)
  if (filters.sortBy) {
    const sortValue = filters.sortOrder === 'desc'
      ? `${filters.sortBy},desc`
      : `${filters.sortBy},asc`
    params.append('sort', sortValue)
  }

  return params.toString()
}
