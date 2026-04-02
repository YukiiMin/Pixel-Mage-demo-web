import { useState } from "react";
import { API_CONFIG, buildApiUrl, createApiHeaders } from "@/lib/api-config";

export function useAdminUpload() {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const uploadImage = async (file: File, folder = "general"): Promise<string | null> => {
		setIsUploading(true);
		setError(null);
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", folder);

			const headers = createApiHeaders() as Record<string, string>;
			// Must delete Content-Type to let browser set boundary for multipart/form-data
			if (headers["Content-Type"]) {
				delete headers["Content-Type"];
			}

			const response = await fetch(buildApiUrl("/api/admin/upload/image"), {
				method: "POST",
				headers,
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			// Based on BE Phase 2 report, the proxy upload returns the CDN URL directly
			// The response might be a JSON object containing the URL or just the string.
			// Assuming JSON: { data: { secureUrl: "..." } } or simple string. Let's assume standard ApiEnvelope.
			const text = await response.text();
			try {
				const json = JSON.parse(text);
				return json.data?.url || json.data || json.url || text;
			} catch {
				return text; // Fallback to raw text if not JSON
			}
		} catch (err: unknown) {
			setError((err as Error).message || "An error occurred during upload");
			return null;
		} finally {
			setIsUploading(false);
		}
	};

	return { uploadImage, isUploading, error };
}
