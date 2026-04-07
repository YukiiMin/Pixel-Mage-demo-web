import { apiRequest } from '@/lib/api-config'
import type { CardFramework } from '@/types/card-gallery'

// Simple API functions for Card Gallery
export interface CardFrameworkResponse {
  frameworkId: string
  name: string
  description: string
  imageUrl?: string
  totalCards: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export async function getCardFrameworks(): Promise<CardFramework[]> {
  try {
    const response = await apiRequest<CardFrameworkResponse[]>('/api/card-frameworks')
    return response.data?.map(framework => ({
      frameworkId: framework.frameworkId,
      name: framework.name,
      description: framework.description,
      imageUrl: framework.imageUrl,
      totalCards: framework.totalCards,
      isActive: framework.isActive,
      createdAt: framework.createdAt,
      updatedAt: framework.updatedAt
    })) || []
  } catch (error) {
    console.error('Failed to fetch card frameworks:', error)
    throw error
  }
}

export async function getCardTemplatesByFramework(frameworkId: string): Promise<any[]> {
  try {
    const response = await apiRequest<any>(`/api/card-templates/by-framework/${frameworkId}`)
    return response.data?.content || []
  } catch (error) {
    console.error('Failed to fetch card templates:', error)
    throw error
  }
}

export async function getCardTemplateById(id: number): Promise<any> {
  try {
    const response = await apiRequest<any>(`/api/card-templates/${id}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch card template:', error)
    throw error
  }
}

export async function getCardContentsByTemplateId(templateId: number): Promise<any[]> {
  try {
    const response = await apiRequest<any[]>(`/api/card-contents/template/${templateId}`)
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch card contents:', error)
    throw error
  }
}
