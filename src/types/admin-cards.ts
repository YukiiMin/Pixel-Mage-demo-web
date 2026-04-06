import type {
	CardContentRequestDTO,
	CardContentResponse,
	CardFrameworkResponse,
	CardTemplateResponse,
	CardTemplateSummary,
} from "@/types/admin-catalog";

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
