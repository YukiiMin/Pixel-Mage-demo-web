"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Edit2,
	Eye,
	FileText,
	Image as ImageIcon,
	Link as LinkIcon,
	LoaderCircle,
	Plus,
	Power,
	PowerOff,
	Trash2,
	Upload,
	Video,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
import { normalizeContentType } from "@/features/staff/components/admin-cards/shared";
import { useAdminUpload } from "@/features/staff/hooks/use-admin-upload";
import { API_ENDPOINTS, apiRequest } from "@/lib/api-config";
import type {
	CardContentManagerProps,
	ToggleContentPayload,
	UpdateContentPayload,
} from "@/features/staff/types/admin-cards";
import type {
	CardContentRequestDTO,
	CardContentResponse,
} from "@/features/staff/types/catalog";
import { getApiErrorMessage } from "@/types/api";

export function CardContentManager({ templateId }: CardContentManagerProps) {
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
