"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, API_ENDPOINTS } from "@/lib/api-config";
import { getApiErrorMessage } from "@/types/api";
import type { CardTemplateResponse, CardTemplateRequestDTO, CardContentResponse, CardContentRequestDTO } from "@/types/admin-catalog";
import {
	ChevronLeft,
	ChevronRight,
	CreditCard,
	Eye,
	Plus,
	Search,
	Trash2,
	X,
	Edit2,
	Save,
	LoaderCircle,
	Upload,
	Image as ImageIcon,
	Video,
	Link as LinkIcon,
	FileText,
	Power,
	PowerOff
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminUpload } from "@/features/admin/hooks/use-admin-upload";

const RARITY_COLOR: Record<string, string> = {
	COMMON: "bg-slate-500/15 text-slate-400 border-slate-500/25",
	RARE: "bg-blue-500/15 text-blue-400 border-blue-500/25",
	LEGENDARY: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

function CardTemplateFormModal({ card, mode = "edit", onClose }: { card?: CardTemplateResponse, mode?: "create" | "edit", onClose: () => void }) {
	const { uploadImage, isUploading } = useAdminUpload();
	const queryClient = useQueryClient();
	
	const [formData, setFormData] = useState<CardTemplateRequestDTO>({
		name: card?.name || "",
		description: card?.description || "",
		rarity: (card?.rarity as any) || "COMMON",
		arcanaType: (card?.arcanaType as any) || "MINOR",
		suit: (card?.suit as any) || "WANDS",
		cardNumber: card?.cardNumber || 1,
		imagePath: card?.imagePath || "",
		designPath: "",
		frameworkId: card?.frameworkId || 1,
	});

	const mutation = useMutation({
		mutationFn: (data: CardTemplateRequestDTO) => 
			apiRequest(mode === "create" ? API_ENDPOINTS.cardTemplates.create : API_ENDPOINTS.cardTemplates.byId(card!.cardTemplateId), {
				method: mode === "create" ? "POST" : "PUT",
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			toast.success(`${mode === "create" ? "Tạo" : "Cập nhật"} card template thành công!`);
			queryClient.invalidateQueries({ queryKey: ["admin", "card-templates"] });
			onClose();
		},
		onError: (err: any) => {
			toast.error(`Lỗi: ${err.message}`);
		}
	});

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = await uploadImage(file, "card-templates");
		if (url) setFormData(prev => ({ ...prev, imagePath: url }));
	};

	const handleSubmit = () => {
		if (!formData.name) return toast.error("Vui lòng nhập tên");
		mutation.mutate(formData);
	};

	return (
		<DialogContent className="max-w-2xl p-0 border-border/50 glass-card bg-background/95 backdrop-blur-xl">
			<DialogHeader className="p-6 pb-4 border-b border-border/40">
				<DialogTitle className="text-2xl font-bold gradient-gold-purple">
					{mode === "create" ? "Tạo Card Template Mới" : `Sửa Template: ${card?.name}`}
				</DialogTitle>
				<DialogDescription>
					Template là thiết kế gốc của thẻ bài (Major/Minor Arcana).
				</DialogDescription>
			</DialogHeader>
			<ScrollArea className="max-h-[70vh] p-6">
				<div className="flex flex-col md:flex-row gap-6">
					<div className="w-full md:w-1/3 flex flex-col gap-3">
						<div className="relative aspect-2/3 w-full rounded-xl border-2 border-dashed border-border/50 bg-secondary/20 flex flex-col items-center justify-center overflow-hidden group">
							{formData.imagePath ? (
								<img src={formData.imagePath} alt="Card" className="w-full h-full object-cover" />
							) : (
								<div className="text-muted-foreground flex flex-col items-center">
									<ImageIcon className="h-8 w-8 mb-2 opacity-50" />
									<span className="text-sm">Chưa có ảnh</span>
								</div>
							)}
							<div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
								<label className="cursor-pointer flex flex-col items-center gap-2 text-primary hover:text-primary/80 transition-colors">
									{isUploading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
									<span className="text-sm font-medium">Đổi ảnh</span>
									<input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading} />
								</label>
							</div>
						</div>
					</div>

					<div className="flex-1 space-y-4">
						<div className="space-y-2">
							<label className="text-sm font-semibold">Tên Template</label>
							<input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-primary" />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-semibold">Rarity</label>
								<select value={formData.rarity} onChange={e => setFormData(p => ({ ...p, rarity: e.target.value as any }))} className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-primary">
									<option value="COMMON">COMMON</option>
									<option value="RARE">RARE</option>
									<option value="LEGENDARY">LEGENDARY</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-semibold">Arcana Type</label>
								<select value={formData.arcanaType} onChange={e => setFormData(p => ({ ...p, arcanaType: e.target.value as any }))} className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-primary">
									<option value="MAJOR">MAJOR ARCANA</option>
									<option value="MINOR">MINOR ARCANA</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-semibold">Suit (Nếu là Minor)</label>
								<select value={formData.suit} onChange={e => setFormData(p => ({ ...p, suit: e.target.value as any }))} className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-primary">
									<option value="WANDS">WANDS</option>
									<option value="CUPS">CUPS</option>
									<option value="SWORDS">SWORDS</option>
									<option value="PENTACLES">PENTACLES</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-semibold">Số La Mã/Thứ Tự</label>
								<input type="number" value={formData.cardNumber} onChange={e => setFormData(p => ({ ...p, cardNumber: Number(e.target.value) }))} className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-primary" />
							</div>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-semibold">Mô tả/Ý nghĩa cơ bản</label>
							<textarea rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="bg-background border border-border rounded-lg px-3 py-2 w-full focus:outline-primary resize-none" />
						</div>
					</div>
				</div>
				<div className="flex justify-end gap-3 pt-6 border-t border-border/40 mt-6">
					<button disabled={mutation.isPending} onClick={onClose} className="px-5 py-2 rounded-lg font-medium border border-border hover:bg-secondary">Hủy bỏ</button>
					<button disabled={mutation.isPending} onClick={handleSubmit} className="px-5 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
						{mutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {mode === "create" ? "Tạo Mới" : "Lưu Thay Đổi"}
					</button>
				</div>
			</ScrollArea>
		</DialogContent>
	);
}

function CardContentManager({ templateId }: { templateId: number }) {
	const queryClient = useQueryClient();
	const { data: contents, isLoading } = useQuery({
		queryKey: ["admin", "card-contents", templateId],
		queryFn: () => apiRequest<CardContentResponse[]>(API_ENDPOINTS.cardContents.adminByTemplate(templateId)).then(r => r.data || [])
	});

	const [newContent, setNewContent] = useState<CardContentRequestDTO>({
		cardTemplateId: templateId,
		contentType: "STORY",
		contentData: "",
		title: "",
		isActive: true,
		displayOrder: 1
	});
	
	const { uploadImage, isUploading } = useAdminUpload();

	const addMutation = useMutation({
		mutationFn: (data: CardContentRequestDTO) => apiRequest(API_ENDPOINTS.cardContents.create, { method: "POST", body: JSON.stringify(data) }),
		onSuccess: () => {
			toast.success("Thêm Content thành công!");
			queryClient.invalidateQueries({ queryKey: ["admin", "card-contents", templateId] });
			setNewContent({ ...newContent, contentData: "", title: "" });
		}
	});

	const toggleMutation = useMutation({
		mutationFn: (contentId: number) => apiRequest(API_ENDPOINTS.cardContents.toggleActive(contentId), { method: "PUT" }),
		onSuccess: () => {
			toast.success("Cập nhật trạng thái thành công!");
			queryClient.invalidateQueries({ queryKey: ["admin", "card-contents", templateId] });
		}
	});

	const handleUploadData = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = await uploadImage(file, "card_contents");
		if (url) setNewContent(p => ({ ...p, contentData: url }));
	};

	const handleAdd = () => {
		if (!newContent.contentData) return toast.error("Vui lòng nhập hoặc tải lên nội dung");
		addMutation.mutate(newContent);
	};

	return (
		<div className="space-y-4">
			<div className="bg-secondary/20 border border-border/50 rounded-xl p-4 space-y-3">
				<h4 className="font-semibold text-sm">Thêm Nội Dung Đặc Biệt Mới</h4>

				{/* Row 1: loại content + tiêu đề */}
				<div className="grid grid-cols-2 gap-3">
					<select value={newContent.contentType} onChange={e => setNewContent(p => ({ ...p, contentType: e.target.value as any, contentData: "" }))} className="bg-background border border-border rounded-lg px-3 py-2 w-full text-sm">
						<option value="STORY">📖 Story Text</option>
						<option value="IMAGE">🖼️ Cận Cảnh (Image)</option>
						<option value="VIDEO">📹 Video / Animation</option>
						<option value="GIF">✨ GIF Effect</option>
						<option value="LINK">🔗 External Link</option>
					</select>
					<input type="text" placeholder="Tiêu đề (tuỳ chọn)" value={newContent.title || ""} onChange={e => setNewContent(p => ({ ...p, title: e.target.value }))} className="bg-background border border-border rounded-lg px-3 py-2 w-full text-sm" />
				</div>

				{/* Row 2: nội dung + nút upload nếu có */}
				{newContent.contentType === "STORY" || newContent.contentType === "LINK" ? (
					<textarea
						rows={2}
						placeholder={newContent.contentType === "LINK" ? "Nhập HTTPS URL..." : "Nhập câu chuyện ẩn..."}
						value={newContent.contentData}
						onChange={e => setNewContent(p => ({ ...p, contentData: e.target.value }))}
						className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none"
					/>
				) : (
					<div className="flex gap-2">
						<input type="text" readOnly placeholder="URL sẽ tự điền sau khi upload..." value={newContent.contentData} className="flex-1 bg-background border border-border/50 rounded-lg px-3 py-2 text-sm opacity-70" />
						<label className="cursor-pointer bg-secondary hover:bg-secondary/80 flex items-center justify-center gap-2 px-4 rounded-lg border border-border text-sm font-medium shrink-0">
							{isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
							<span>{isUploading ? "Đang tải..." : "Chọn file"}</span>
							<input type="file" className="hidden" accept={newContent.contentType === "VIDEO" ? "video/*" : "image/*"} onChange={handleUploadData} />
						</label>
					</div>
				)}

				{/* Row 3: nút xác nhận riêng biệt */}
				<div className="flex justify-end">
					<button
						onClick={handleAdd}
						disabled={addMutation.isPending || isUploading}
						className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 text-sm"
					>
						{addMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
						Xác Nhận Thêm
					</button>
				</div>
			</div>

			<div className="space-y-3 mt-4">
				<h4 className="font-semibold text-sm">Danh sách Content đang có:</h4>
				{isLoading ? <p className="text-muted-foreground text-sm">Đang tải...</p> : contents?.length === 0 ? <p className="text-muted-foreground text-sm italic">Chưa có nội dung đính kèm nào.</p> : (
					contents?.map(content => (
						<div key={content.contentId} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:bg-secondary/10 transition-colors">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded bg-secondary/50 flex items-center justify-center shrink-0">
									{content.contentType === "STORY" ? <FileText className="h-5 w-5 text-muted-foreground" /> :
									 content.contentType === "VIDEO" ? <Video className="h-5 w-5 text-blue-400" /> :
									 content.contentType === "IMAGE" || content.contentType === "GIF" ? <ImageIcon className="h-5 w-5 text-green-400" /> :
									 <LinkIcon className="h-5 w-5 text-purple-400" />}
								</div>
								<div>
									<p className="text-sm font-semibold">{content.title || `No Title - ${content.contentType}`}</p>
									<p className="text-xs text-muted-foreground truncate max-w-xs">{content.contentData}</p>
								</div>
							</div>
							<div className="flex gap-2 items-center">
								<span className={`text-[10px] px-2 py-1 rounded-full font-bold ${content.isActive ? "bg-green-500/20 text-green-500" : "bg-destructive/20 text-destructive"}`}>
									{content.isActive ? "ACTIVE" : "INACTIVE"}
								</span>
								<button 
									onClick={() => toggleMutation.mutate(content.contentId)} 
									className="p-2 bg-secondary rounded hover:bg-secondary/80 flex shrink-0"
								>
									{content.isActive ? <PowerOff className="h-4 w-4 text-destructive" /> : <Power className="h-4 w-4 text-green-500" />}
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

function CardPreviewModal({ card, onClose }: { card: CardTemplateResponse | null; onClose: () => void }) {
	if (!card) return null;
	const [tab, setTab] = useState<"info"|"contents">("info");

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
			<div className="glass-card flex flex-col md:flex-row relative max-w-4xl w-full rounded-2xl border border-border/60 p-0 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
				<button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 rounded-full p-2 bg-background/50 hover:bg-muted text-foreground transition-colors backdrop-blur-md">
					<X className="h-5 w-5" />
				</button>
				
				<div className="w-full md:w-80 bg-secondary/10 p-8 flex flex-col items-center justify-center border-r border-border/40">
					{card.imagePath ? (
						<div className="relative h-72 w-48 overflow-hidden rounded-xl border border-border/50 shadow-lg">
							<Image src={card.imagePath} alt={card.name} fill className="object-cover" unoptimized />
						</div>
					) : (
						<div className="flex h-72 w-48 items-center justify-center rounded-xl border border-border/50 bg-card/60 shadow-lg">
							<CreditCard className="h-16 w-16 text-muted-foreground/30" />
						</div>
					)}
					<div className="text-center mt-6">
						<h3 className="text-xl font-bold text-foreground text-balance" style={{ fontFamily: "Fruktur" }}>{card.name}</h3>
						<span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${RARITY_COLOR[card.rarity || "COMMON"] ?? "bg-muted/40 text-muted-foreground"}`}>
							{card.rarity}
						</span>
					</div>
				</div>

				<div className="flex-1 flex flex-col bg-background/90 min-h-125">
					<div className="flex border-b border-border/40 px-6 pt-4 gap-6 shrink-0">
						<button 
							onClick={() => setTab("info")} 
							className={`pb-3 border-b-2 font-medium transition-colors ${tab === "info" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
						>
							Thông Tin Template
						</button>
						<button 
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
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Loại Bài</p>
										<p className="font-semibold text-foreground">{card.arcanaType || "MINOR"} ARCANA</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Suit (Chất)</p>
										<p className="font-semibold text-foreground">{card.suit || "N/A"}</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Số / Tên Rút Gọn</p>
										<p className="font-semibold text-foreground">{card.cardNumber}</p>
									</div>
									<div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
										<p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Framework</p>
										<p className="font-semibold text-foreground">Rider-Waite-Smith</p>
									</div>
								</div>
								<div>
									<h4 className="font-semibold mb-2">Ý Nghĩa Cơ Bản</h4>
									<p className="text-muted-foreground leading-relaxed text-sm bg-accent/30 p-4 rounded-xl border border-border/30">
										{card.description || "Chưa có mô tả cho lá bài này."}
									</p>
								</div>
							</div>
						) : (
							<CardContentManager templateId={card.cardTemplateId} />
						)}
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}

const PAGE_SIZE = 12;

export function AdminCardsPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [rarityFilter, setRarityFilter] = useState("ALL");
	const [page, setPage] = useState(0);
	
	const [previewCard, setPreviewCard] = useState<CardTemplateResponse | null>(null);
	const [editCard, setEditCard] = useState<CardTemplateResponse | null>(null);
	const [isCreateOpen, setIsCreateOpen] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ["admin", "card-templates", page, rarityFilter],
		queryFn: async () => {
			if (rarityFilter !== "ALL") {
				// Use dedicated rarity endpoint: GET /api/card-templates/by-rarity/{rarity}?page=0&size=12
				const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
				const res = await apiRequest(`${API_ENDPOINTS.cardTemplates.byRarity(rarityFilter)}?${params}`);
				// BE may return Page<T> or Array — normalise both
				const raw = res.data as any;
				if (Array.isArray(raw)) {
					return { content: raw, totalElements: raw.length, totalPages: 1, number: 0 };
				}
				return raw;
			}
			const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
			const res = await apiRequest(`${API_ENDPOINTS.cardTemplates.list}?${params}`);
			return res.data as any;
		}
	});

	const cards: CardTemplateResponse[] = Array.isArray(data) ? data : (data?.content || []);
	const totalPages = data?.totalPages || 1;
	const totalElements = data?.totalElements ?? cards.length;

	const deleteMutation = useMutation({
		mutationFn: (id: number) => apiRequest(API_ENDPOINTS.cardTemplates.byId(id), { method: "DELETE" }),
		onSuccess: () => {
			toast.success("Đã xoá Card Template");
			queryClient.invalidateQueries({ queryKey: ["admin", "card-templates"] });
		}
	});

	// Client-side search filter (rarity already handled server-side via endpoint)
	const filtered = cards.filter((c) => {
		const matchesSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase());
		// Belt-and-suspenders: also filter client-side in case BE returns mixed
		const matchesRarity = rarityFilter === "ALL" || c.rarity === rarityFilter;
		return matchesSearch && matchesRarity;
	});

	const rarities = ["ALL", "COMMON", "RARE", "LEGENDARY"];

	return (
		<>
			{previewCard && <CardPreviewModal card={previewCard} onClose={() => setPreviewCard(null)} />}
			
			<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
				{isCreateOpen && <CardTemplateFormModal mode="create" onClose={() => setIsCreateOpen(false)} />}
			</Dialog>
			
			<Dialog open={!!editCard} onOpenChange={(isOpen) => !isOpen && setEditCard(null)}>
				{editCard && <CardTemplateFormModal card={editCard} mode="edit" onClose={() => setEditCard(null)} />}
			</Dialog>

			<div className="space-y-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p className="badge-mystic inline-flex mb-2">Admin / Content</p>
						<h1 className="text-3xl text-foreground" style={{ fontFamily: "Fruktur, var(--font-heading)" }}>
							Card Template Manager
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							{totalElements} Templates trong hệ thống
						</p>
					</div>
					<button
						onClick={() => setIsCreateOpen(true)}
						className="btn-primary flex items-center gap-2"
					>
						<Plus className="h-4 w-4" />
						Create Template
					</button>
				</div>

				<div className="glass-card flex flex-col gap-3 rounded-2xl border border-border/50 p-4 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<input
							type="text"
							placeholder="Tìm tên card..."
							value={search}
							onChange={(e) => { setSearch(e.target.value); setPage(0); }}
							className="w-full rounded-lg border border-border/50 bg-card/60 py-2 pl-9 pr-4 text-sm text-foreground focus:outline-primary"
						/>
					</div>
					<div className="flex flex-wrap gap-2">
						{rarities.map((r) => (
							<button
								key={r}
								onClick={() => { setRarityFilter(r); setPage(0); }}
								className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
									rarityFilter === r ? "gradient-gold-purple-bg border-transparent text-primary-foreground" : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
								}`}
							>
								{r}
							</button>
						))}
					</div>
				</div>

				{isLoading ? (
					<div className="flex justify-center p-12">
						<LoaderCircle className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
						<CreditCard className="mb-4 h-12 w-12 text-muted-foreground/30" />
						<p className="text-sm text-muted-foreground font-medium">Không tìm thấy Card Template nào.</p>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
						{filtered.map((card) => (
							<div
								key={card.cardTemplateId}
								className="glass-card group relative flex flex-col rounded-2xl border border-border/50 p-4 transition-all hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 duration-300"
							>
								<div className="relative mx-auto mb-4 h-48 w-32 overflow-hidden rounded-xl border border-border/40 shadow-inner">
									{card.imagePath ? (
										<Image src={card.imagePath} alt={card.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
									) : (
										<div className="flex h-full items-center justify-center bg-card/60">
											<CreditCard className="h-8 w-8 text-muted-foreground/30" />
										</div>
									)}
									<div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>
								<p className="truncate text-base font-bold text-foreground text-center" style={{ fontFamily: "Outfit" }}>{card.name}</p>
								<div className="flex items-center justify-center mt-2">
									<span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase ${RARITY_COLOR[card.rarity || "COMMON"] ?? "bg-muted/40 text-muted-foreground"}`}>
										{card.rarity}
									</span>
								</div>
								
								<div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 flex flex-col items-center justify-center gap-3 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl p-4">
									<button onClick={() => setPreviewCard(card)} className="w-full btn-primary flex items-center justify-center gap-2 text-sm max-w-35">
										<Eye className="h-4 w-4" /> Chi Tiết
									</button>
									<button onClick={() => setEditCard(card)} className="w-full bg-secondary text-foreground hover:bg-secondary/80 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium border border-border transition-colors max-w-35">
										<Edit2 className="h-4 w-4" /> Sửa Gốc
									</button>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<button className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium border border-destructive/20 transition-colors max-w-35">
												<Trash2 className="h-4 w-4" /> Xoá Bỏ
											</button>
										</AlertDialogTrigger>
										<AlertDialogContent className="border-border/50 glass-card">
											<AlertDialogHeader>
												<AlertDialogTitle>Cảnh báo nguy hiểm!</AlertDialogTitle>
												<AlertDialogDescription>
													Xoá Card Template <strong>{card.name}</strong> có thể làm lủng Gacha Pool nếu thẻ này đang nằm trong pack. Không thể hoàn tác!
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel className="bg-secondary hover:bg-secondary/80 border-border">Huỷ</AlertDialogCancel>
												<AlertDialogAction onClick={() => deleteMutation.mutate(card.cardTemplateId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
													Xoá Chấp Nhận Rủi Ro
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							</div>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-3 mt-8">
						<button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border/50 bg-secondary/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-30 disabled:hover:bg-secondary/50 disabled:hover:text-foreground disabled:hover:border-border/50 transition-all">
							<ChevronLeft className="h-5 w-5" />
						</button>
						<span className="text-sm font-medium bg-background px-4 py-2 border border-border/50 rounded-lg">
							Trang {page + 1} / {totalPages}
						</span>
						<button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="w-10 h-10 flex items-center justify-center rounded-xl border border-border/50 bg-secondary/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-30 disabled:hover:bg-secondary/50 disabled:hover:text-foreground disabled:hover:border-border/50 transition-all">
							<ChevronRight className="h-5 w-5" />
						</button>
					</div>
				)}
			</div>
		</>
	);
}
