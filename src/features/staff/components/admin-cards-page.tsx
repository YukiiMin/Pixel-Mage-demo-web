"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Edit2,
	Eye,
	FileText,
	Image as ImageIcon,
	LayoutGrid,
	Link as LinkIcon,
	List as ListIcon,
	LoaderCircle,
	Plus,
	Power,
	PowerOff,
	Save,
	Search,
	Trash2,
	Upload,
	Video,
	X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardDescriptionCell } from "@/features/staff/components/admin-cards/card-description-cell";
import {
	normalizeArcanaType,
	normalizeContentType,
	normalizeRarity,
	normalizeSuit,
	PAGE_SIZE,
	RARITY_COLOR,
} from "@/features/staff/components/admin-cards/shared";
import { useAdminUpload } from "@/features/staff/hooks/use-admin-upload";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type {
	CardContentManagerProps,
	CardContentsViewerProps,
	CardPreviewModalProps,
	CardTemplateFormModalProps,
	CardTemplatesPageResult,
	ToggleContentPayload,
	UpdateContentPayload,
} from "@/types/admin-cards";
import type {
	CardContentRequestDTO,
	CardContentResponse,
	CardFrameworkResponse,
	CardTemplateRequestDTO,
	CardTemplateResponse,
	CardTemplateSummary,
} from "@/types/admin-catalog";
import { getApiErrorMessage } from "@/types/api";

function CardTemplateFormModal({
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

function CardContentManager({ templateId }: CardContentManagerProps) {
	const queryClient = useQueryClient();
	const { data: contents, isLoading } = useQuery({
		queryKey: ["admin", "card-contents", templateId],
		queryFn: () =>
			apiRequest<CardContentResponse[]>(
				API_ENDPOINTS.cardContents.adminByTemplate(templateId),
			).then((r) => r.data || []),
	});

	const [newContent, setNewContent] = useState<CardContentRequestDTO>({
		cardTemplateId: templateId,
		contentType: "STORY",
		contentData: "",
		title: "",
		isActive: true,
		displayOrder: 1,
	});

	const { uploadImage, isUploading } = useAdminUpload();

	const addMutation = useMutation({
		mutationFn: (data: CardContentRequestDTO) =>
			apiRequest(API_ENDPOINTS.cardContents.create, {
				method: "POST",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			toast.success("Thêm Content thành công!");
			queryClient.invalidateQueries({
				queryKey: ["admin", "card-contents", templateId],
			});
			setNewContent({ ...newContent, contentData: "", title: "" });
		},
	});

	const setActiveMutation = useMutation({
		mutationFn: ({ contentId, isActive }: ToggleContentPayload) =>
			apiRequest(API_ENDPOINTS.cardContents.toggleActive(contentId, isActive), {
				method: "PATCH",
			}),
		onSuccess: () => {
			toast.success("Cập nhật trạng thái thành công!");
			queryClient.invalidateQueries({
				queryKey: ["admin", "card-contents", templateId],
			});
		},
	});

	const deleteContentMutation = useMutation({
		mutationFn: (contentId: number) =>
			apiRequest(API_ENDPOINTS.cardContents.byId(contentId), {
				method: "DELETE",
			}),
		onSuccess: () => {
			toast.success("Đã xoá content");
			queryClient.invalidateQueries({
				queryKey: ["admin", "card-contents", templateId],
			});
		},
		onError: (err) => {
			toast.error(
				getApiErrorMessage(err, "Không thể xoá (soft-delete) content"),
			);
		},
	});

	const [editing, setEditing] = useState<CardContentResponse | null>(null);
	const [editDraft, setEditDraft] = useState<CardContentRequestDTO | null>(
		null,
	);

	const updateMutation = useMutation({
		mutationFn: ({ contentId, data }: UpdateContentPayload) =>
			apiRequest(API_ENDPOINTS.cardContents.byId(contentId), {
				method: "PUT",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			toast.success("Đã cập nhật content");
			queryClient.invalidateQueries({
				queryKey: ["admin", "card-contents", templateId],
			});
			setEditing(null);
			setEditDraft(null);
		},
		onError: (err) => {
			toast.error(getApiErrorMessage(err, "Không thể cập nhật content"));
		},
	});

	const handleUploadData = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = await uploadImage(file, "card_contents");
		if (url) setNewContent((p) => ({ ...p, contentData: url }));
	};

	const handleEditUploadData = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file || !editDraft) return;
		const url = await uploadImage(file, "card_contents");
		if (url) {
			setEditDraft((p) => (p ? { ...p, contentData: url } : p));
		}
	};

	const handleAdd = () => {
		if (!newContent.contentData)
			return toast.error("Vui lòng nhập hoặc tải lên nội dung");
		addMutation.mutate(newContent);
	};

	return (
		<div className="space-y-4">
			<div className="bg-secondary/20 border border-border/50 rounded-xl p-4 space-y-3">
				<h4 className="font-semibold text-sm">Thêm Nội Dung Đặc Biệt Mới</h4>

				{/* Row 1: loại content + tiêu đề */}
				<div className="grid grid-cols-2 gap-3">
					<select
						value={newContent.contentType}
						onChange={(e) =>
							setNewContent((p) => ({
								...p,
								contentType: e.target
									.value as CardContentRequestDTO["contentType"],
								contentData: "",
							}))
						}
						className="bg-background border border-border rounded-lg px-3 py-2 w-full text-sm"
					>
						<option value="STORY">📖 Story Text</option>
						<option value="IMAGE">🖼️ Cận Cảnh (Image)</option>
						<option value="VIDEO">📹 Video / Animation</option>
						<option value="GIF">✨ GIF Effect</option>
						<option value="LINK">🔗 External Link</option>
					</select>
					<input
						type="text"
						placeholder="Tiêu đề (tuỳ chọn)"
						value={newContent.title || ""}
						onChange={(e) =>
							setNewContent((p) => ({ ...p, title: e.target.value }))
						}
						className="bg-background border border-border rounded-lg px-3 py-2 w-full text-sm"
					/>
				</div>

				{/* Row 2: nội dung + nút upload nếu có */}
				{newContent.contentType === "STORY" ||
				newContent.contentType === "LINK" ? (
					<textarea
						rows={2}
						placeholder={
							newContent.contentType === "LINK"
								? "Nhập HTTPS URL..."
								: "Nhập câu chuyện ẩn..."
						}
						value={newContent.contentData}
						onChange={(e) =>
							setNewContent((p) => ({ ...p, contentData: e.target.value }))
						}
						className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none"
					/>
				) : (
					<div className="flex gap-2">
						<input
							type="text"
							readOnly
							placeholder="URL sẽ tự điền sau khi upload..."
							value={newContent.contentData}
							className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-sm opacity-70"
						/>
						<label className="cursor-pointer bg-secondary hover:bg-secondary/80 flex items-center justify-center gap-2 px-4 rounded-lg border border-border text-sm font-medium shrink-0">
							{isUploading ? (
								<LoaderCircle className="h-4 w-4 animate-spin" />
							) : (
								<Upload className="h-4 w-4" />
							)}
							<span>{isUploading ? "Đang tải..." : "Chọn file"}</span>
							<input
								type="file"
								className="hidden"
								accept={
									newContent.contentType === "VIDEO" ? "video/*" : "image/*"
								}
								onChange={handleUploadData}
							/>
						</label>
					</div>
				)}

				{/* Row 3: nút xác nhận riêng biệt */}
				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleAdd}
						disabled={addMutation.isPending || isUploading}
						className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm"
					>
						{addMutation.isPending ? (
							<LoaderCircle className="h-4 w-4 animate-spin" />
						) : (
							<Plus className="h-4 w-4" />
						)}
						Xác Nhận Thêm
					</button>
				</div>
			</div>

			<div className="space-y-3 mt-4">
				<h4 className="font-semibold text-sm">Danh sách Content đang có:</h4>
				{isLoading ? (
					<p className="text-muted-foreground text-sm">Đang tải...</p>
				) : contents?.length === 0 ? (
					<p className="text-muted-foreground text-sm italic">
						Chưa có nội dung đính kèm nào.
					</p>
				) : (
					contents?.map((content) => (
						<div
							key={content.contentId}
							className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:bg-secondary/10 transition-colors"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded bg-secondary/50 flex items-center justify-center shrink-0">
									{content.contentType === "STORY" ? (
										<FileText className="h-5 w-5 text-muted-foreground" />
									) : content.contentType === "VIDEO" ? (
										<Video className="h-5 w-5 text-blue-400" />
									) : content.contentType === "IMAGE" ||
										content.contentType === "GIF" ? (
										<ImageIcon className="h-5 w-5 text-green-400" />
									) : (
										<LinkIcon className="h-5 w-5 text-purple-400" />
									)}
								</div>
								<div>
									<p className="text-sm font-semibold">
										{content.title || `No Title - ${content.contentType}`}
									</p>
									<p className="text-xs text-muted-foreground truncate max-w-xs">
										{content.contentData}
									</p>
								</div>
							</div>
							<div className="flex gap-2 items-center">
								<span
									className={`text-[10px] px-2 py-1 rounded-full font-bold ${content.isActive ? "bg-green-500/20 text-green-500" : "bg-destructive/20 text-destructive"}`}
								>
									{content.isActive ? "ACTIVE" : "INACTIVE"}
								</span>
								<button
									type="button"
									onClick={() =>
										setActiveMutation.mutate({
											contentId: content.contentId,
											isActive: !content.isActive,
										})
									}
									className="p-2 bg-secondary rounded hover:bg-secondary/80 flex shrink-0"
									title={content.isActive ? "Tắt (INACTIVE)" : "Bật (ACTIVE)"}
								>
									{content.isActive ? (
										<PowerOff className="h-4 w-4 text-destructive" />
									) : (
										<Power className="h-4 w-4 text-green-500" />
									)}
								</button>
								<button
									type="button"
									onClick={() => {
										setEditing(content);
										setEditDraft({
											cardTemplateId: templateId,
											contentType: normalizeContentType(content.contentType),
											contentData: content.contentData,
											title: content.title || "",
											isActive: content.isActive,
											displayOrder: content.displayOrder || 1,
										});
									}}
									className="p-2 bg-secondary rounded hover:bg-secondary/80 flex shrink-0"
									title="Sửa content"
								>
									<Edit2 className="h-4 w-4 text-foreground" />
								</button>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<button
											type="button"
											className="p-2 bg-destructive/10 rounded hover:bg-destructive/20 flex shrink-0"
											title="Xoá (soft-delete)"
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</button>
									</AlertDialogTrigger>
									<AlertDialogContent className="border-border/50 glass-card">
										<AlertDialogHeader>
											<AlertDialogTitle>Xoá content?</AlertDialogTitle>
											<AlertDialogDescription>
												Content sẽ bị xoá khỏi DB. Nếu chỉ muốn ẩn, hãy dùng nút
												ACTIVE/INACTIVE.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border">
												Huỷ
											</AlertDialogCancel>
											<AlertDialogAction
												onClick={() =>
													deleteContentMutation.mutate(content.contentId)
												}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
											>
												Xác nhận
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					))
				)}
			</div>

			<Dialog
				open={!!editing}
				onOpenChange={(open) => {
					if (!open) {
						setEditing(null);
						setEditDraft(null);
					}
				}}
			>
				{editing && editDraft && (
					<DialogContent className="max-w-2xl border-border/50 glass-card bg-background/95 backdrop-blur-xl">
						<DialogHeader>
							<DialogTitle className="text-base">Sửa Content</DialogTitle>
							<DialogDescription className="text-xs">
								Chỉnh sửa nội dung và trạng thái hiển thị.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-2">
									<label
										htmlFor="editContentType"
										className="text-sm font-semibold"
									>
										Loại
									</label>
									<select
										id="editContentType"
										value={editDraft.contentType}
										onChange={(e) =>
											setEditDraft((p) =>
												p
													? {
															...p,
															contentType: e.target
																.value as CardContentRequestDTO["contentType"],
														}
													: p,
											)
										}
										className="bg-background border border-border rounded-lg px-3 py-2 w-full text-sm"
									>
										<option value="STORY">📖 Story Text</option>
										<option value="IMAGE">🖼️ Cận Cảnh (Image)</option>
										<option value="VIDEO">📹 Video / Animation</option>
										<option value="GIF">✨ GIF Effect</option>
										<option value="LINK">🔗 External Link</option>
									</select>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="editDisplayOrder"
										className="text-sm font-semibold"
									>
										Thứ tự hiển thị
									</label>
									<input
										id="editDisplayOrder"
										type="number"
										value={editDraft.displayOrder ?? 1}
										onChange={(e) =>
											setEditDraft((p) =>
												p
													? {
															...p,
															displayOrder: Number(e.target.value),
														}
													: p,
											)
										}
										className="bg-background border border-border rounded-lg px-3 py-2 w-full text-sm"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label htmlFor="editTitle" className="text-sm font-semibold">
									Tiêu đề
								</label>
								<input
									id="editTitle"
									type="text"
									value={editDraft.title ?? ""}
									onChange={(e) =>
										setEditDraft((p) =>
											p ? { ...p, title: e.target.value } : p,
										)
									}
									className="bg-background border border-border rounded-lg px-3 py-2 w-full text-sm"
								/>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="editContentData"
									className="text-sm font-semibold"
								>
									Nội dung
								</label>
								{editDraft.contentType === "STORY" ||
								editDraft.contentType === "LINK" ? (
									<textarea
										id="editContentData"
										rows={6}
										value={editDraft.contentData}
										onChange={(e) =>
											setEditDraft((p) =>
												p ? { ...p, contentData: e.target.value } : p,
											)
										}
										className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none"
									/>
								) : (
									<div className="flex gap-2">
										<input
											id="editContentData"
											type="text"
											value={editDraft.contentData}
											onChange={(e) =>
												setEditDraft((p) =>
													p ? { ...p, contentData: e.target.value } : p,
												)
											}
											placeholder="Dán URL hoặc upload file..."
											className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm"
										/>
										<label className="cursor-pointer bg-secondary hover:bg-secondary/80 flex items-center justify-center gap-2 px-4 rounded-lg border border-border text-sm font-medium shrink-0">
											{isUploading ? (
												<LoaderCircle className="h-4 w-4 animate-spin" />
											) : (
												<Upload className="h-4 w-4" />
											)}
											<span>{isUploading ? "Đang tải..." : "Chọn file"}</span>
											<input
												type="file"
												className="hidden"
												accept={
													editDraft.contentType === "VIDEO"
														? "video/*"
														: "image/*"
												}
												onChange={handleEditUploadData}
												disabled={isUploading}
											/>
										</label>
									</div>
								)}
							</div>

							<div className="flex items-center justify-between">
								<p className="text-sm font-semibold">Trạng thái</p>
								<button
									type="button"
									onClick={() =>
										setEditDraft((p) =>
											p ? { ...p, isActive: !p.isActive } : p,
										)
									}
									className={`text-xs px-3 py-1.5 rounded-full font-bold border ${
										editDraft.isActive
											? "bg-green-500/15 text-green-400 border-green-500/25"
											: "bg-destructive/15 text-destructive border-destructive/25"
									}`}
								>
									{editDraft.isActive ? "ACTIVE" : "INACTIVE"}
								</button>
							</div>

							<div className="flex justify-end gap-2 pt-2 border-t border-border/40">
								<button
									type="button"
									onClick={() => {
										setEditing(null);
										setEditDraft(null);
									}}
									className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm"
								>
									Huỷ
								</button>
								<button
									type="button"
									onClick={() =>
										updateMutation.mutate({
											contentId: editing.contentId,
											data: editDraft,
										})
									}
									disabled={updateMutation.isPending}
									className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold disabled:opacity-60"
								>
									Lưu
								</button>
							</div>
						</div>
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}

function CardContentsViewer({ templateId }: CardContentsViewerProps) {
	const { data: contents, isLoading } = useQuery({
		queryKey: ["admin", "card-contents-viewer", templateId],
		queryFn: () =>
			apiRequest<CardContentResponse[]>(
				API_ENDPOINTS.cardContents.adminByTemplate(templateId),
			).then((r) => r.data || []),
	});

	const [selected, setSelected] = useState<CardContentResponse | null>(null);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h4 className="font-semibold text-sm">Danh sách Content</h4>
				<p className="text-xs text-muted-foreground">View mode (read-only)</p>
			</div>

			{isLoading ? (
				<p className="text-muted-foreground text-sm">Đang tải...</p>
			) : contents?.length === 0 ? (
				<p className="text-muted-foreground text-sm italic">
					Chưa có nội dung đính kèm nào.
				</p>
			) : (
				<div className="space-y-2">
					{contents?.map((content) => (
						<button
							type="button"
							key={content.contentId}
							onClick={() => setSelected(content)}
							className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:bg-secondary/10 transition-colors"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className="w-10 h-10 rounded bg-secondary/50 flex items-center justify-center shrink-0">
									{content.contentType === "STORY" ? (
										<FileText className="h-5 w-5 text-muted-foreground" />
									) : content.contentType === "VIDEO" ? (
										<Video className="h-5 w-5 text-blue-400" />
									) : content.contentType === "IMAGE" ||
										content.contentType === "GIF" ? (
										<ImageIcon className="h-5 w-5 text-green-400" />
									) : (
										<LinkIcon className="h-5 w-5 text-purple-400" />
									)}
								</div>
								<div className="min-w-0">
									<p className="text-sm font-semibold truncate">
										{content.title || `No Title - ${content.contentType}`}
									</p>
									<p className="text-xs text-muted-foreground truncate max-w-[420px]">
										{content.contentData}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<span
									className={`text-[10px] px-2 py-1 rounded-full font-bold ${content.isActive ? "bg-green-500/20 text-green-500" : "bg-destructive/20 text-destructive"}`}
								>
									{content.isActive ? "ACTIVE" : "INACTIVE"}
								</span>
								<Eye className="h-4 w-4 text-muted-foreground" />
							</div>
						</button>
					))}
				</div>
			)}

			<Dialog
				open={!!selected}
				onOpenChange={(open) => !open && setSelected(null)}
			>
				{selected && (
					<DialogContent className="max-w-2xl border-border/50 glass-card bg-background/95 backdrop-blur-xl">
						<DialogHeader>
							<DialogTitle className="text-base">
								{selected.title ||
									`Chi tiết nội dung (${selected.contentType})`}
							</DialogTitle>
							<DialogDescription className="text-xs">
								Chỉ xem — không chỉnh sửa trong View mode.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<span
									className={`text-[10px] px-2 py-1 rounded-full font-bold ${selected.isActive ? "bg-green-500/20 text-green-500" : "bg-destructive/20 text-destructive"}`}
								>
									{selected.isActive ? "ACTIVE" : "INACTIVE"}
								</span>
								<span className="text-xs text-muted-foreground">
									Type: {selected.contentType}
								</span>
							</div>

							{selected.contentType === "STORY" ? (
								<ScrollArea className="h-72 rounded-lg border border-border/50 bg-card/40 p-4">
									<p className="text-sm leading-relaxed whitespace-pre-wrap">
										{selected.contentData}
									</p>
								</ScrollArea>
							) : selected.contentType === "IMAGE" ||
								selected.contentType === "GIF" ? (
								<div className="rounded-lg border border-border/50 bg-card/40 p-3">
									<div className="relative w-full h-[420px]">
										<Image
											src={selected.contentData}
											alt={selected.title || "content"}
											fill
											className="object-contain rounded-md"
											unoptimized
										/>
									</div>
								</div>
							) : selected.contentType === "VIDEO" ? (
								<div className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-2">
									<a
										href={selected.contentData}
										target="_blank"
										rel="noreferrer"
										className="text-xs text-primary underline"
									>
										Mở video ở tab mới
									</a>
								</div>
							) : (
								<div className="rounded-lg border border-border/50 bg-card/40 p-3">
									<a
										href={selected.contentData}
										target="_blank"
										rel="noreferrer"
										className="text-sm text-primary underline break-all"
									>
										{selected.contentData}
									</a>
								</div>
							)}
						</div>
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}

function CardPreviewModal({ card, onClose }: CardPreviewModalProps) {
	const [tab, setTab] = useState<"info" | "contents">("info");
	const { data: fullCard } = useQuery({
		queryKey: ["admin", "card-template-preview", card.cardTemplateId],
		queryFn: () =>
			apiRequest<CardTemplateResponse>(
				API_ENDPOINTS.cardTemplates.byId(card.cardTemplateId),
			).then((res) => res.data),
		enabled: !!card?.cardTemplateId,
	});

	const previewCard = fullCard || card;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Đóng"
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="glass-card flex flex-col md:flex-row relative max-w-4xl w-full rounded-2xl border border-border/60 p-0 overflow-hidden shadow-2xl">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 z-10 rounded-full p-2 bg-background/50 hover:bg-muted text-foreground transition-colors backdrop-blur-md"
				>
					<X className="h-5 w-5" />
				</button>

				<div className="w-full md:w-80 bg-secondary/10 p-8 flex flex-col items-center justify-center border-r border-border/40">
					{previewCard.imagePath ? (
						<div className="relative h-72 w-48 overflow-hidden rounded-xl border border-border/50 shadow-lg">
							<Image
								src={previewCard.imagePath}
								alt={previewCard.name}
								fill
								className="object-cover"
								unoptimized
							/>
						</div>
					) : (
						<div className="flex h-72 w-48 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-lg">
							<CreditCard className="h-16 w-16 text-muted-foreground/30" />
						</div>
					)}
					<div className="text-center mt-6">
						<h3
							className="text-xl font-bold text-foreground text-balance"
							style={{ fontFamily: "Fruktur" }}
						>
							{previewCard.name}
						</h3>
						<span
							className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${RARITY_COLOR[previewCard.rarity || "COMMON"] ?? "bg-muted/40 text-muted-foreground"}`}
						>
							{previewCard.rarity}
						</span>
					</div>
				</div>

				<div className="flex-1 flex flex-col bg-background/90 min-h-125">
					<div className="flex border-b border-border/40 px-6 pt-4 gap-6 shrink-0">
						<button
							type="button"
							onClick={() => setTab("info")}
							className={`pb-3 border-b-2 font-medium transition-colors ${tab === "info" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
						>
							Thông Tin Template
						</button>
						<button
							type="button"
							onClick={() => setTab("contents")}
							className={`pb-3 border-b-2 font-medium transition-colors ${tab === "contents" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
						>
							Nội Dung Đặc Biệt (Card Contents)
						</button>
					</div>

					<ScrollArea className="flex-1 p-6">
						{tab === "info" ? (
							<div className="space-y-6">
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
											Loại Bài
										</p>
										<p className="font-semibold text-foreground">
											{previewCard.arcanaType || "MINOR"} ARCANA
										</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
											Suit (Chất)
										</p>
										<p className="font-semibold text-foreground">
											{previewCard.suit || "N/A"}
										</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
											Số / Tên Rút Gọn
										</p>
										<p className="font-semibold text-foreground">
											{previewCard.cardNumber}
										</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
											Framework
										</p>
										<p className="font-semibold text-foreground">
											{previewCard.frameworkName || "N/A"}
										</p>
									</div>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Ý Nghĩa Cơ Bản</h4>
									<p className="text-muted-foreground leading-relaxed text-sm bg-accent/30 p-4 rounded-xl border border-border/30">
										{previewCard.description || "Chưa có mô tả cho lá bài này."}
									</p>
								</div>
							</div>
						) : (
							<CardContentsViewer templateId={previewCard.cardTemplateId} />
						)}
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}

export function AdminCardsPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [rarityFilter, setRarityFilter] = useState("ALL");
	const [frameworkFilter, setFrameworkFilter] = useState("ALL");
	const [page, setPage] = useState(0);
	const [viewMode, setViewMode] = useState<"grid" | "list">("list");

	const [previewCard, setPreviewCard] = useState<CardTemplateResponse | null>(
		null,
	);
	const [editCard, setEditCard] = useState<CardTemplateResponse | null>(null);
	const [editInitialTab, setEditInitialTab] = useState<"info" | "contents">(
		"info",
	);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const { data, isLoading } = useQuery<CardTemplatesPageResult>({
		queryKey: ["admin", "card-templates", page, rarityFilter],
		queryFn: async () => {
			if (rarityFilter !== "ALL") {
				// Use dedicated rarity endpoint: GET /api/card-templates/by-rarity/{rarity}?page=0&size=12
				const params = new URLSearchParams({
					page: String(page),
					size: String(PAGE_SIZE),
				});
				const res = await apiRequest(
					`${API_ENDPOINTS.cardTemplates.byRarity(rarityFilter)}?${params}`,
				);
				// BE may return Page<T> or Array — normalise both
				const raw = res.data as unknown;
				if (Array.isArray(raw)) {
					return {
						content: raw,
						totalElements: raw.length,
						totalPages: 1,
						number: 0,
					};
				}
				return raw as CardTemplatesPageResult;
			}
			const params = new URLSearchParams({
				page: String(page),
				size: String(PAGE_SIZE),
			});
			const res = await apiRequest(
				`${API_ENDPOINTS.cardTemplates.list}?${params}`,
			);
			const raw = res.data as unknown;
			if (Array.isArray(raw)) {
				return {
					content: raw,
					totalElements: raw.length,
					totalPages: 1,
					number: 0,
				};
			}
			return raw as CardTemplatesPageResult;
		},
	});

	const cards: CardTemplateResponse[] = data?.content || [];
	const totalPages = data?.totalPages || 1;
	const totalElements = data?.totalElements ?? cards.length;
	const frameworkOptions = [
		"ALL",
		...Array.from(
			new Set(
				cards
					.map((card) => card.frameworkName?.trim())
					.filter((name): name is string => Boolean(name)),
			),
		).sort((a, b) => a.localeCompare(b)),
	];

	const deleteMutation = useMutation({
		mutationFn: (id: number) =>
			apiRequest(API_ENDPOINTS.cardTemplates.byId(id), { method: "DELETE" }),
		onSuccess: () => {
			toast.success("Đã xoá Card Template");
			queryClient.invalidateQueries({ queryKey: ["admin", "card-templates"] });
		},
	});

	// Client-side search filter (rarity already handled server-side via endpoint)
	const filtered = cards.filter((c) => {
		const matchesSearch =
			search === "" || c.name.toLowerCase().includes(search.toLowerCase());
		// Belt-and-suspenders: also filter client-side in case BE returns mixed
		const matchesRarity = rarityFilter === "ALL" || c.rarity === rarityFilter;
		const matchesFramework =
			frameworkFilter === "ALL" ||
			(c.frameworkName || "").toLowerCase() === frameworkFilter.toLowerCase();
		return matchesSearch && matchesRarity && matchesFramework;
	});

	const rarities = ["ALL", "COMMON", "RARE", "LEGENDARY"];

	return (
		<>
			{previewCard && (
				<CardPreviewModal
					card={previewCard}
					onClose={() => setPreviewCard(null)}
				/>
			)}

			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				{isCreateOpen && (
					<CardTemplateFormModal
						mode="create"
						onClose={() => setIsCreateOpen(false)}
						onCreated={(created) => {
							setIsCreateOpen(false);
							setEditInitialTab("contents");
							setEditCard(created);
						}}
					/>
				)}
			</Dialog>

			<Dialog
				open={!!editCard}
				onOpenChange={(isOpen) => !isOpen && setEditCard(null)}
			>
				{editCard && (
					<CardTemplateFormModal
						cardSummary={editCard}
						mode="edit"
						initialTab={editInitialTab}
						onClose={() => setEditCard(null)}
					/>
				)}
			</Dialog>

			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="badge-mystic inline-flex mb-2">
							Admin / Quản Trị Hệ Thống
						</p>
						<h1
							className="text-3xl text-foreground"
							style={{ fontFamily: "Fruktur, var(--font-heading)" }}
						>
							Quản Lý Thẻ Gốc
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Quản lý các mẫu {totalElements} thẻ bài (Template) để đưa vào các
							Gacha Pool
						</p>
					</div>
					<button
						type="button"
						onClick={() => setIsCreateOpen(true)}
						className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
					>
						<Plus className="h-4 w-4" />
						Thêm Thẻ Mới
					</button>
				</div>

				<div className="glass-card flex flex-col gap-3 rounded-2xl border border-border/50 p-4 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Tìm tên thẻ bài..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(0);
							}}
							className="w-full rounded-lg border border-border/50 bg-card/60 py-2 pl-9 pr-4 text-sm text-foreground focus:outline-primary focus:border-primary/50 transition-all"
						/>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<div className="flex bg-secondary/30 rounded-lg p-1 border border-border/50">
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
							>
								<LayoutGrid className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={() => setViewMode("list")}
								className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}
							>
								<ListIcon className="h-4 w-4" />
							</button>
						</div>
						<div className="h-8 w-px bg-border/50 mx-1"></div>
						{rarities.map((r) => (
							<button
								type="button"
								key={r}
								onClick={() => {
									setRarityFilter(r);
									setPage(0);
								}}
								className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
									rarityFilter === r
										? "gradient-gold-purple-bg border-transparent text-primary-foreground"
										: "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
								}`}
							>
								{r === "ALL" ? "Tất Cả" : r}
							</button>
						))}
						<select
							value={frameworkFilter}
							onChange={(e) => {
								setFrameworkFilter(e.target.value);
								setPage(0);
							}}
							className="rounded-full border border-border/50 bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground focus:outline-primary"
						>
							{frameworkOptions.map((framework) => (
								<option key={framework} value={framework}>
									{framework === "ALL" ? "Framework: Tất Cả" : framework}
								</option>
							))}
						</select>
					</div>
				</div>

				{isLoading ? (
					<div className="flex justify-center p-12">
						<LoaderCircle className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
						<CreditCard className="mb-4 h-12 w-12 text-muted-foreground/30" />
						<p className="text-sm text-muted-foreground font-medium">
							Không tìm thấy Card Template nào.
						</p>
					</div>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 lg:gap-6">
						{filtered.map((card) => (
							<div
								key={card.cardTemplateId}
								className="glass-card group relative flex flex-col rounded-2xl border border-border/50 p-4 transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 cursor-default duration-300"
							>
								<div className="relative mx-auto mb-4 h-48 w-32 overflow-hidden rounded-xl border border-border/40 shadow-inner">
									{card.imagePath ? (
										<Image
											src={card.imagePath}
											alt={card.name}
											fill
											className="object-cover transition-transform duration-500 group-hover:scale-110"
											unoptimized
										/>
									) : (
										<div className="flex h-full items-center justify-center bg-card/60">
											<CreditCard className="h-8 w-8 text-muted-foreground/30" />
										</div>
									)}
									<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
								<p
									className="truncate text-base font-bold text-foreground text-center"
									style={{ fontFamily: "Outfit" }}
								>
									{card.name}
								</p>
								<div className="flex items-center justify-center mt-2">
									<span
										className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase ${RARITY_COLOR[card.rarity || "COMMON"] ?? "bg-muted/40 text-muted-foreground"}`}
									>
										{card.rarity}
									</span>
								</div>

								<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/90 p-4 opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100">
									<button
										type="button"
										onClick={() => setPreviewCard(card)}
										className="flex w-full max-w-[140px] items-center justify-center gap-2 rounded-lg bg-primary/20 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/30"
									>
										<Eye className="h-4 w-4" /> Chi Tiết
									</button>
									<button
										type="button"
										onClick={() => {
											setEditInitialTab("info");
											setEditCard(card);
										}}
										className="flex w-full max-w-[140px] items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
									>
										<Edit2 className="h-4 w-4" /> Sửa Thẻ
									</button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<button
												type="button"
												className="flex w-full max-w-[140px] items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
											>
												<Trash2 className="h-4 w-4" /> Xoá Bỏ
											</button>
										</AlertDialogTrigger>
										<AlertDialogContent className="border-border/50 glass-card">
											<AlertDialogHeader>
												<AlertDialogTitle>Xác nhận xoá thẻ?</AlertDialogTitle>
												<AlertDialogDescription>
													Hành động xoá Card Template{" "}
													<strong>{card.name}</strong> sẽ làm lỗi các hệ thống
													đang tham chiếu nếu nó đã được phát hành!
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border">
													Huỷ bỏ
												</AlertDialogCancel>
												<AlertDialogAction
													onClick={() =>
														deleteMutation.mutate(card.cardTemplateId)
													}
													className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
												>
													Vẫn Xoá
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="glass-card rounded-2xl border border-border/50 overflow-hidden">
						<div className="overflow-x-auto min-h-[400px]">
							<table className="w-full text-sm text-left">
								<thead className="border-b border-border/40 bg-card/60 text-xs text-muted-foreground">
									<tr>
										<th className="px-4 py-3 font-semibold text-left">
											Ảnh Thẻ
										</th>
										<th className="px-4 py-3 font-semibold text-left">
											Tên Thẻ
										</th>
										<th className="px-4 py-3 font-semibold text-left">
											Rare & Bộ Ẩn
										</th>
										<th className="px-4 py-3 font-semibold text-left">Mô Tả</th>
										<th className="px-4 py-3 font-semibold text-right">
											Thao Tác
										</th>
									</tr>
								</thead>
								<tbody>
									{filtered.map((card) => (
										<tr
											key={card.cardTemplateId}
											className="border-b border-border/20 transition-colors hover:bg-card/40 last:border-0 group"
										>
											<td className="px-4 py-3 w-28">
												<div className="relative h-20 w-14 rounded-md border border-border/40 overflow-hidden shadow-sm">
													{card.imagePath ? (
														<Image
															src={card.imagePath}
															alt={card.name}
															fill
															className="object-cover"
														/>
													) : (
														<div className="flex h-full items-center justify-center bg-card/60">
															<CreditCard className="h-5 w-5 text-muted-foreground/30" />
														</div>
													)}
												</div>
											</td>
											<td className="px-4 py-3">
												<p className="font-bold text-foreground text-sm tracking-normal">
													{card.name}
												</p>
												<p className="text-xs text-muted-foreground mt-0.5 font-medium">
													#{card.cardNumber} •{" "}
													{card.frameworkName || "Rider-Waite"}
												</p>
											</td>
											<td className="px-4 py-3">
												<div className="flex flex-col items-start gap-1.5">
													<span
														className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${RARITY_COLOR[card.rarity || "COMMON"] ?? "bg-muted/40 text-muted-foreground"}`}
													>
														{card.rarity}
													</span>
													<span className="text-xs font-medium text-muted-foreground inline-flex bg-muted/40 px-2 py-0.5 rounded border border-border/30">
														{card.arcanaType} • {card.suit}
													</span>
													<span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
														{card.frameworkName || "Unknown Framework"}
													</span>
												</div>
											</td>
											<td className="px-4 py-3 text-muted-foreground">
												<CardDescriptionCell card={card} />
											</td>
											<td className="px-4 py-3 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														type="button"
														onClick={() => setPreviewCard(card)}
														title="Xem chi tiết"
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
													>
														<Eye className="h-4 w-4" />
													</button>
													<button
														type="button"
														onClick={() => {
															setEditInitialTab("info");
															setEditCard(card);
														}}
														title="Chỉnh sửa"
														className="inline-flex items-center justify-center rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
													>
														<Edit2 className="h-4 w-4" />
													</button>
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<button
																type="button"
																title="Xoá"
																className="inline-flex items-center justify-center rounded-lg border border-destructive/20 p-1.5 text-destructive transition-colors hover:bg-destructive/10"
															>
																<Trash2 className="h-4 w-4" />
															</button>
														</AlertDialogTrigger>
														<AlertDialogContent className="border-border/50 glass-card">
															<AlertDialogHeader>
																<AlertDialogTitle>
																	Xác nhận xoá thẻ?
																</AlertDialogTitle>
																<AlertDialogDescription>
																	Hành động xoá Card Template{" "}
																	<strong>{card.name}</strong> sẽ làm lỗi các hệ
																	thống đang tham chiếu nếu nó đã được phát
																	hành!
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border">
																	Huỷ bỏ
																</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() =>
																		deleteMutation.mutate(card.cardTemplateId)
																	}
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
																>
																	Vẫn Xoá
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex items-center justify-between border-t border-border/40 px-4 py-3 mt-4 glass-card rounded-2xl">
						<p className="text-xs text-muted-foreground">
							Trang {page + 1} / {totalPages}
						</p>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								disabled={page === 0}
								className="rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
								disabled={page >= totalPages - 1}
								className="rounded-lg border border-border/50 p-1.5 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
