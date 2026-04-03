"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────
export interface Voucher {
	id: number;
	code: string;
	description?: string;
	discountType: "PERCENTAGE" | "FIXED_AMOUNT";
	discountValue: number;
	minOrderValue?: number;
	maxDiscount?: number;
	usageLimit?: number;
	usedCount: number;
	startDate?: string;
	expiryDate?: string;
	isActive: boolean;
	createdAt: string;
}

export interface CreateVoucherDto {
	code: string;
	description?: string;
	discountType: "PERCENTAGE" | "FIXED_AMOUNT";
	discountValue: number;
	minOrderValue?: number;
	maxDiscount?: number;
	usageLimit?: number;
	startDate?: string;
	expiryDate?: string;
}

// ──────────────────────────────────────────────────
// Query Keys
// ──────────────────────────────────────────────────
export const voucherKeys = {
	all: ["admin-vouchers"] as const,
	list: () => [...voucherKeys.all, "list"] as const,
};

// ──────────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────────
export function useAdminVouchers() {
  return useQuery({
    queryKey: voucherKeys.list(),
    queryFn: async () => {
      // MOCK: Backend endpoint is missing.
      return [
        {
          id: 1,
          code: 'WELCOME20',
          description: 'Giảm 20% cho đơn đầu tiên',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          usedCount: 15,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          code: 'SUMMER25',
          description: 'Giảm 25.000₫ cho đơn mùa hè',
          discountType: 'FIXED_AMOUNT',
          discountValue: 25000,
          usedCount: 0,
          usageLimit: 100,
          isActive: true,
          createdAt: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        },
      ] as Voucher[]
    },
    staleTime: 30_000,
  })
}

export function useCreateVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateVoucherDto) => {
      // MOCK: Backend endpoint /api/admin/vouchers POST is missing.
      return {
        id: Math.floor(Math.random() * 10000),
        ...dto,
        usedCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      } as Voucher
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: voucherKeys.all }),
  })
}

export function useUpdateVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: number
      dto: Partial<CreateVoucherDto>
    }) => {
      // MOCK: Endpoint is missing.
      return { id, ...dto } as Voucher
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: voucherKeys.all }),
  })
}

export function useDeleteVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      // MOCK: Endpoint is missing.
      return Promise.resolve()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: voucherKeys.all }),
  })
}

export function useToggleVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      // MOCK: Endpoint is missing.
      return Promise.resolve()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: voucherKeys.all }),
  })
}
