import { Client } from "@stomp/stompjs";
import { API_CONFIG, getStoredAccessToken } from "./api-config";

class WebSocketService {
	private client: Client | null = null;
	private static instance: WebSocketService | null = null;

	private constructor() {}

	static getInstance(): WebSocketService {
		if (!WebSocketService.instance) {
			WebSocketService.instance = new WebSocketService();
		}
		return WebSocketService.instance;
	}

	connect(onConnect?: () => void) {
		if (this.client && this.client.active) {
			if (onConnect) onConnect();
			return; // already connected
		}

		const token = getStoredAccessToken();

		const wsUrl = API_CONFIG.baseUrl.replace(/^http/, "ws") + "/ws";

		this.client = new Client({
			brokerURL: wsUrl,
			connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
			reconnectDelay: 5000,
			heartbeatIncoming: 4000,
			heartbeatOutgoing: 4000,
		});

		this.client.onConnect = () => {
			console.log("[WebSocket] Connected!");
			onConnect?.();
		};

		this.client.onStompError = (frame) => {
			console.error("[WebSocket] Broker error:", frame.headers["message"]);
		};

		this.client.activate();
	}

	disconnect() {
		if (this.client) {
			this.client.deactivate();
			this.client = null;
		}
	}

	subscribe(destination: string, callback: (body: any) => void) {
		if (!this.client || !this.client.active) {
			console.warn("[WebSocket] Cannot subscribe, not connected.");
			return null;
		}
		return this.client.subscribe(destination, (message) => {
			if (message.body) {
				try {
					const data = JSON.parse(message.body);
					callback(data);
				} catch (e) {
					callback(message.body);
				}
			}
		});
	}
}

export const webSocketService = WebSocketService.getInstance();
