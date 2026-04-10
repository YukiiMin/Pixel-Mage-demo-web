import type {
	CardContentRequestDTO,
	CardContentResponse,
	CardFrameworkResponse,
	CardTemplateResponse,
	CardTemplateSummary,
} from "@/features/staff/types/catalog";

// Physical Card Types - Matches PhysicalCardFullResponse from BE
export type CardProductStatus =
	| "PENDING_BIND"
	| "READY"
	| "SOLD"
	| "LINKED"
	| "DEACTIVATED";
export type CardCondition =
	| "NEW"
	| "EXCELLENT"
	| "GOOD"
	| "FAIR"
	| "POOR"
	| "DAMAGED";

export interface PhysicalCard {
	id: number;
	nfcUid: string;
	softwareUuid?: string;
	status: CardProductStatus;
	cardCondition: CardCondition;
	cardTemplateId?: number;
	cardTemplateName?: string;
	cardTemplateImageUrl?: string;
	productId?: number;
	productName?: string;
	serialNumber?: string;
	productionBatch?: string;
	customText?: string;
	ownerId?: number;
	ownerName?: string;
	ownerEmail?: string;
	linkedAt?: string;
	soldAt?: string;
	createdAt: string;
	updatedAt?: string;
}

export type CardSummaryLike = CardTemplateResponse | CardTemplateSummary;

export interface CardDescriptionCellProps {
	card: CardSummaryLike;
}

export interface CardTemplateFormModalProps {
	cardSummary?: CardSummaryLike;
	mode?: "create" | "edit";
	initialTab?: "info" | "contents";
	onCreated?: (created: CardTemplateResponse) => void;
	onClose: () => void;
}

export interface CardContentManagerProps {
	templateId: number;
}

export interface CardContentsViewerProps {
	templateId: number;
}

export interface CardPreviewModalProps {
	card: CardTemplateResponse;
	onClose: () => void;
}

export interface CardTemplatesPageResult {
	content: CardTemplateResponse[];
	totalElements?: number;
	totalPages?: number;
	number?: number;
}

export interface ToggleContentPayload {
	contentId: number;
	isActive: boolean;
}

export interface UpdateContentPayload {
	contentId: number;
	data: CardContentRequestDTO;
}

export interface FrameworkQueryResult extends Array<CardFrameworkResponse> {}

export interface EditingContentState {
	editing: CardContentResponse | null;
	editDraft: CardContentRequestDTO | null;
}
