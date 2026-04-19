"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, LoaderCircle, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContentManager } from "@/features/staff/components/admin-cards/card-content-manager";
import {
	normalizeArcanaType,
	normalizeRarity,
	normalizeSuit,
} from "@/features/staff/components/admin-cards/shared";
import { useAdminUpload } from "@/features/staff/hooks/use-admin-upload";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type { CardTemplateFormModalProps } from "@/features/staff/types/admin-cards";
import type {
	CardFrameworkResponse,
	CardTemplateRequestDTO,
	CardTemplateResponse,
	CardTemplateSummary,
} from "@/features/staff/types/catalog";
import { getApiErrorMessage } from "@/types/api";

export function CardTemplateFormModal({
	cardSummary,
	mode = "edit",
	initialTab = "info",
	onCreated,
	onClose,
}: CardTemplateFormModalProps) {
	const { uploadImage, isUploading } = useAdminUpload();
	const queryClient = useQueryClient();
	const [tab, setTab] = useState<"info" | "contents">(initialTab);
	useEffect(() => {
		setTab(initialTab);
	}, [initialTab]);

	const { data: frameworks, isLoading: isLoadingFrameworks } = useQuery({
		queryKey: ["admin", "card-frameworks"],
		queryFn: () =>
			apiRequest<CardFrameworkResponse[]>(
				API_ENDPOINTS.cardFrameworks.list,
			).then((res) => res.data ?? []),
	});

	// Fetch full details if in edit mode so we get description and other full data
	const { data: fullCardData, isLoading: isLoadingFullCard } = useQuery({
		queryKey: ["admin", "card-template-full", cardSummary?.cardTemplateId],
		queryFn: async () => {
			const id = cardSummary?.cardTemplateId;
			if (!id) {
				throw new Error("Missing cardTemplateId");
			}
			return apiRequest<CardTemplateResponse>(
				API_ENDPOINTS.cardTemplates.byId(id),
			).then((res) => res.data);
		},
		enabled: mode === "edit" && !!cardSummary?.cardTemplateId,
	});

	// Use fullCardData when available, otherwise fallback to summary or defaults
	const initialData = mode === "edit" ? fullCardData || cardSummary : {};

	const [formData, setFormData] = useState<CardTemplateRequestDTO>({
		name:
			(initialData as CardTemplateResponse | CardTemplateSummary)?.name || "",
		description: (initialData as CardTemplateResponse)?.description || "",
		rarity: normalizeRarity(
			(initialData as CardTemplateResponse | CardTemplateSummary)?.rarity,
		),
		arcanaType: normalizeArcanaType(
			(initialData as CardTemplateResponse | CardTemplateSummary)?.arcanaType,
		),
		suit: normalizeSuit(
			(initialData as CardTemplateResponse | CardTemplateSummary)?.suit,
		),
		cardNumber:
			(initialData as CardTemplateResponse | CardTemplateSummary)?.cardNumber ||
			1,
		imagePath:
			(initialData as CardTemplateResponse | CardTemplateSummary)?.imagePath ||
			"",
		designPath: "",
		frameworkId: (initialData as CardTemplateResponse)?.frameworkId,
	});

	// Synchronize formData when fullCardData is fetched
	useEffect(() => {
		if (fullCardData && mode === "edit") {
			setFormData({
				name: fullCardData.name || "",
				description: fullCardData.description || "",
				rarity: normalizeRarity(fullCardData.rarity),
				arcanaType: normalizeArcanaType(fullCardData.arcanaType),
				suit: normalizeSuit(fullCardData.suit),
				cardNumber: fullCardData.cardNumber || 1,
				imagePath: fullCardData.imagePath || "",
				designPath: "",
				frameworkId: fullCardData.frameworkId,
			});
		}
	}, [fullCardData, mode]);

	// Default framework selection (Create or missing frameworkId)
	useEffect(() => {
		if (!frameworks || frameworks.length === 0) return;
		setFormData((prev) => {
			if (prev.frameworkId) return prev;
			return { ...prev, frameworkId: frameworks[0]?.frameworkId };
		});
	}, [frameworks]);

	const mutation = useMutation({
		mutationFn: (data: CardTemplateRequestDTO) =>
			apiRequest<CardTemplateResponse>(
				mode === "create"
					? API_ENDPOINTS.cardTemplates.create
					: API_ENDPOINTS.cardTemplates.byId(cardSummary?.cardTemplateId || ""),
				{
					method: mode === "create" ? "POST" : "PUT",
					body: JSON.stringify(data),
				},
			).then((res) => res.data),
		onSuccess: (createdOrUpdated) => {
			toast.success(
				`${mode === "create" ? "Tạo" : "Cập nhật"} card template thành công!`,
			);
			queryClient.invalidateQueries({ queryKey: ["admin", "card-templates"] });
			if (mode === "create" && onCreated) {
				onCreated(createdOrUpdated);
			}
		},
		onError: (err) => {
			toast.error(getApiErrorMessage(err, "Không thể lưu Card Template"));
		},
	});

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = await uploadImage(file, "card-templates");
		if (url) setFormData((prev) => ({ ...prev, imagePath: url }));
	};

	const handleSubmit = () => {
		if (!formData.name) return toast.error("Vui lòng nhập tên");
		if (!formData.frameworkId)
			return toast.error("Vui lòng chọn Card Framework");
		mutation.mutate(formData);
	};

	return (
		<DialogContent className="max-w-4xl p-0 border-border/50 glass-card bg-background/95 backdrop-blur-xl">
			<DialogTitle className="sr-only">
				{mode === "create" ? "Tạo Card Mới" : `Sửa Template:`}
			</DialogTitle>
			<button
				type="button"
				onClick={onClose}
				className="absolute right-4 top-4 z-50 rounded-full p-2 bg-background/50 hover:bg-muted text-foreground transition-colors backdrop-blur-md"
			>
				<X className="h-5 w-5" />
			</button>

			<div className="flex flex-col md:flex-row h-full max-h-[85vh]">
				{/* Left Sidebar (Image Preview) */}
				<div className="w-full md:w-80 bg-secondary/10 p-8 flex flex-col items-center justify-start border-r border-border/40 shrink-0">
					<h3 className="text-xl font-bold gradient-gold-purple mb-6 text-center w-full">
						{mode === "create" ? "Tạo Card Mới" : `Sửa Template:`}
						{mode === "edit" && (
							<span className="block mt-1 text-lg text-foreground">
								{formData.name}
							</span>
						)}
					</h3>

					{formData.frameworkId ? (
						<div className="mb-6 text-center">
							<span className="inline-flex items-center rounded-full border border-border/50 bg-card/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
								Framework:{" "}
								<span className="ml-1 text-foreground">
									{frameworks?.find(
										(f) => f.frameworkId === formData.frameworkId,
									)?.name || `#${formData.frameworkId}`}
								</span>
							</span>
						</div>
					) : null}

					<div className="relative aspect-2/3 w-48 rounded-xl border-2 border-dashed border-border/50 bg-secondary/20 flex flex-col items-center justify-center overflow-hidden group shadow-lg">
						{formData.imagePath ? (
							<Image
								src={formData.imagePath}
								alt="Card"
								fill
								className="object-cover"
								unoptimized
							/>
						) : (
							<div className="text-muted-foreground flex flex-col items-center p-4 text-center">
								<ImageIcon className="h-10 w-10 mb-3 opacity-30" />
								<span className="text-sm">Chưa có ảnh (400x600px)</span>
							</div>
						)}
						<div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
							<label className="cursor-pointer flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors">
								{isUploading ? (
									<LoaderCircle className="h-6 w-6 animate-spin" />
								) : (
									<Upload className="h-6 w-6" />
								)}
								<span className="text-sm font-medium">Đổi ảnh</span>
								<input
									type="file"
									className="hidden"
									accept="image/*"
									onChange={handleImageChange}
									disabled={isUploading}
								/>
							</label>
						</div>
					</div>
				</div>

				{/* Right Content Area */}
				<div className="flex-1 flex flex-col overflow-hidden">
					{mode === "edit" && (
						<div className="flex border-b border-border/40 px-6 pt-4 gap-6 shrink-0 bg-secondary/5">
							<button
								type="button"
								onClick={() => setTab("info")}
								className={`pb-3 border-b-2 font-medium transition-colors ${tab === "info" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
							>
								1. Cập Nhật Thông Tin
							</button>
							<button
								type="button"
								onClick={() => setTab("contents")}
								className={`pb-3 border-b-2 font-medium transition-colors ${tab === "contents" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
							>
								2. Nội Dung Đặc Biệt (Contents)
							</button>
						</div>
					)}

					<ScrollArea className="flex-1 p-6">
						{mode === "create" || tab === "info" ? (
							isLoadingFullCard ? (
								<div className="flex justify-center items-center h-48">
									<LoaderCircle className="h-8 w-8 animate-spin text-primary" />
								</div>
							) : (
								<div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
									<div className="space-y-2">
										<label
											htmlFor="cardTemplateName"
											className="text-sm font-semibold"
										>
											Tên Template
										</label>
										<input
											id="cardTemplateName"
											type="text"
											value={formData.name}
											onChange={(e) =>
												setFormData((p) => ({ ...p, name: e.target.value }))
											}
											className="bg-background border border-border rounded-lg px-3 py-2.5 w-full focus:outline-primary"
										/>
									</div>
									<div className="grid grid-cols-2 gap-5">
										<div className="space-y-2 col-span-2">
											<label
												htmlFor="cardFramework"
												className="text-sm font-semibold"
											>
												Card Framework{" "}
												<span className="text-destructive">*</span>
											</label>
											<select
												id="cardFramework"
												value={formData.frameworkId ?? ""}
												onChange={(e) =>
													setFormData((p) => ({
														...p,
														frameworkId: Number(e.target.value),
													}))
												}
												disabled={isLoadingFrameworks || !frameworks?.length}
												className="bg-background border border-border rounded-lg px-3 py-2.5 w-full focus:outline-primary disabled:opacity-60"
											>
												{!frameworks?.length ? (
													<option value="">
														{isLoadingFrameworks
															? "Đang tải frameworks..."
															: "Chưa có framework nào"}
													</option>
												) : (
													frameworks.map((f) => (
														<option key={f.frameworkId} value={f.frameworkId}>
															{f.name}
														</option>
													))
												)}
											</select>
											{frameworks?.length ? (
												<p className="text-xs text-muted-foreground">
													{frameworks.find(
														(f) => f.frameworkId === formData.frameworkId,
													)?.description || " "}
												</p>
											) : null}
										</div>
										<div className="space-y-2">
											<label
												htmlFor="cardRarity"
												className="text-sm font-semibold"
											>
												Rarity (Độ hiếm)
											</label>
											<select
												id="cardRarity"
												value={formData.rarity}
												onChange={(e) =>
													setFormData((p) => ({
														...p,
														rarity: e.target
															.value as CardTemplateRequestDTO["rarity"],
													}))
												}
												className="bg-background border border-border rounded-lg px-3 py-2.5 w-full focus:outline-primary"
											>
												<option value="COMMON">COMMON</option>
												<option value="RARE">RARE</option>
												<option value="LEGENDARY">LEGENDARY</option>
											</select>
										</div>
										<div className="space-y-2">
											<label
												htmlFor="cardArcana"
												className="text-sm font-semibold"
											>
												Bộ Ẩn (Arcana)
											</label>
											<select
												id="cardArcana"
												value={formData.arcanaType}
												onChange={(e) =>
													setFormData((p) => ({
														...p,
														arcanaType: e.target
															.value as CardTemplateRequestDTO["arcanaType"],
													}))
												}
												className="bg-background border border-border rounded-lg px-3 py-2.5 w-full focus:outline-primary"
											>
												<option value="MAJOR">MAJOR ARCANA</option>
												<option value="MINOR">MINOR ARCANA</option>
											</select>
										</div>
										<div className="space-y-2">
											<label
												htmlFor="cardSuit"
												className="text-sm font-semibold"
											>
												Suit (Chất - Nếu Minor)
											</label>
											<select
												id="cardSuit"
												value={formData.suit}
												onChange={(e) =>
													setFormData((p) => ({
														...p,
														suit: e.target
															.value as CardTemplateRequestDTO["suit"],
													}))
												}
												className="bg-background border border-border rounded-lg px-3 py-2.5 w-full focus:outline-primary"
											>
												<option value="WANDS">WANDS</option>
												<option value="CUPS">CUPS</option>
												<option value="SWORDS">SWORDS</option>
												<option value="PENTACLES">PENTACLES</option>
											</select>
										</div>
										<div className="space-y-2">
											<label
												htmlFor="cardNumber"
												className="text-sm font-semibold"
											>
												Số La Mã/Thứ Tự
											</label>
											<input
												id="cardNumber"
												type="number"
												value={formData.cardNumber}
												onChange={(e) =>
													setFormData((p) => ({
														...p,
														cardNumber: Number(e.target.value),
													}))
												}
												className="bg-background border border-border rounded-lg px-3 py-2.5 w-full focus:outline-primary"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<label
											htmlFor="cardDescription"
											className="text-sm font-semibold"
										>
											Mô tả / Ý nghĩa cơ bản (Sẽ hiển thị công khai)
										</label>
										<textarea
											id="cardDescription"
											rows={4}
											value={formData.description}
											onChange={(e) =>
												setFormData((p) => ({
													...p,
													description: e.target.value,
												}))
											}
											className="bg-background border border-border rounded-lg px-3 py-2.5 w-full focus:outline-primary resize-none placeholder-muted-foreground/50"
											placeholder="Nhập giới thiệu tóm tắt về lá bài..."
										/>
									</div>

									<div className="flex justify-end gap-3 pt-4 border-t border-border/40">
										<button
											type="button"
											disabled={mutation.isPending}
											onClick={onClose}
											className="px-6 py-2.5 rounded-lg font-medium border border-border hover:bg-secondary transition-colors"
										>
											Hủy
										</button>
										<button
											type="button"
											disabled={mutation.isPending}
											onClick={handleSubmit}
											className="px-6 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
										>
											{mutation.isPending ? (
												<LoaderCircle className="h-4 w-4 animate-spin" />
											) : (
												<Save className="h-4 w-4" />
											)}{" "}
											{mode === "create" ? "Tạo Template" : "Lưu Thông Tin Mới"}
										</button>
									</div>
								</div>
							)
						) : cardSummary?.cardTemplateId ? (
							<div className="animate-in fade-in zoom-in-95 duration-200">
								<CardContentManager templateId={cardSummary.cardTemplateId} />
							</div>
						) : null}
					</ScrollArea>
				</div>
			</div>
		</DialogContent>
	);
}
