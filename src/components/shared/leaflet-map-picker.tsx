"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, MapPin, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
	interface Window {
		L: any; // Leaflet toàn cục
	}
}

export function LeafletMapPicker({
	initialAddress,
	onLocationSelect,
}: {
	initialAddress?: string;
	onLocationSelect?: (
		lat: number,
		lng: number,
		address: string,
		details?: any,
	) => void;
}) {
	const mapRef = useRef<HTMLDivElement>(null);
	const [mapInstance, setMapInstance] = useState<any>(null);
	const [markerInstance, setMarkerInstance] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [currentAddress, setCurrentAddress] = useState(initialAddress || "");

	const [searchQuery, setSearchQuery] = useState(initialAddress || "");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const searchTimeout = useRef<any>(null);

	useEffect(() => {
		// 1. Tải CSS của Leaflet
		if (!document.getElementById("leaflet-css")) {
			const link = document.createElement("link");
			link.id = "leaflet-css";
			link.rel = "stylesheet";
			link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
			document.head.appendChild(link);
		}

		// 2. Tải JS của Leaflet
		const existingScript = document.getElementById("leaflet-script");
		if (!existingScript) {
			const script = document.createElement("script");
			script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
			script.id = "leaflet-script";
			script.async = true;
			script.defer = true;
			script.onload = initMap;
			document.head.appendChild(script);
		} else {
			if (window.L) {
				initMap();
			} else {
				existingScript.onload = initMap;
			}
		}

		function initMap() {
			setIsLoading(false);
			if (!window.L || !mapRef.current) return;

			// Tránh lỗi "Map container is already initialized" trong React Strict Mode
			const L = window.L;
			if ((mapRef.current as any)._leaflet_id) {
				return;
			}

			// Mặc định: Hà Nội
			const defaultLocation = [21.028511, 105.804817];

			// Khởi tạo Map
			const map = L.map(mapRef.current).setView(defaultLocation, 15);
			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			}).addTo(map);

			// Fix lỗi thiếu icon mặc định do webpack hash: dùng custom icon hoặc ép path
			const icon = L.icon({
				iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
				iconRetinaUrl:
					"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
				shadowUrl:
					"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41],
			});

			// Tạo ghim (Draggable Marker)
			const marker = L.marker(defaultLocation, { draggable: true, icon }).addTo(
				map,
			);

			setMapInstance(map);
			setMarkerInstance(marker);

			// Bắt sự kiện Click lên Bản Đồ
			map.on("click", (e: any) => {
				marker.setLatLng(e.latlng);
				reverseGeocode(e.latlng.lat, e.latlng.lng);
			});

			// Bắt sự kiện kéo ghim thả xuống (dragend)
			marker.on("dragend", () => {
				const pos = marker.getLatLng();
				reverseGeocode(pos.lat, pos.lng);
			});
		}

		// Cleanup
		return () => {
			if (mapInstance) {
				mapInstance.remove();
			}
		};
	}, []); // Xoá array dep trống, useEffect này chỉ chạy 1 lần lúc mount

	// Listen to External Address change (from VNAddressSelect) and Pan the map automatically
	useEffect(() => {
		if (
			initialAddress &&
			initialAddress !== currentAddress &&
			initialAddress !== searchQuery &&
			mapInstance &&
			markerInstance
		) {
			setSearchQuery(initialAddress);
			setCurrentAddress(initialAddress);

			const flyToNewAddress = async () => {
				setIsSearching(true);
				try {
					const res = await fetch(
						`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
							initialAddress,
						)}&addressdetails=1&limit=1&countrycodes=vn&accept-language=vi`,
					);
					const data = await res.json();
					if (data && data.length > 0) {
						const lat = parseFloat(data[0].lat);
						const lon = parseFloat(data[0].lon);
						mapInstance.setView([lat, lon], 14);
						markerInstance.setLatLng([lat, lon]);
					}
				} catch (err) {
					console.error("Auto pan error:", err);
				} finally {
					setIsSearching(false);
				}
			};

			// Chỉ fly khi độ dài đủ lớn (tránh call quá nhiều với chuỗi ngắn)
			if (initialAddress.trim().length > 5) {
				flyToNewAddress();
			}
		}
	}, [initialAddress, mapInstance, markerInstance]);

	// Hàm chạy Search khi bấm nút
	const executeSearch = async () => {
		if (searchQuery.trim().length < 3) return;
		setIsSearching(true);
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
					searchQuery,
				)}&addressdetails=1&limit=5&countrycodes=vn&accept-language=vi`,
			);
			const data = await res.json();
			setSearchResults(data || []);
		} catch (err) {
			console.error("Search API Error:", err);
		} finally {
			setIsSearching(false);
		}
	};

	// Xử lý khi user gõ (tuỳ chọn: tắt auto-search hoặc delay lâu hơn, ở đây ta để user bấm nút)
	const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	// Bấm Eneter trong ô input
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			executeSearch();
		}
	};

	// Xử lý khi user chọn một gợi ý trong List Search
	const handleSelectSuggestion = (item: any) => {
		const lat = parseFloat(item.lat);
		const lon = parseFloat(item.lon);
		const address = item.display_name;

		setSearchQuery(address);
		setCurrentAddress(address);
		setSearchResults([]);

		// Fly tới vị trí đó
		if (mapInstance && markerInstance) {
			mapInstance.setView([lat, lon], 17);
			markerInstance.setLatLng([lat, lon]);
		}

		if (onLocationSelect) {
			onLocationSelect(lat, lon, address);
		}
	};

	// API Free Reverse Geocoding của OpenStreetMap (Nominatim)
	const reverseGeocode = async (lat: number, lng: number) => {
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=vi`,
			);
			const data = await res.json();
			if (data && data.display_name) {
				setCurrentAddress(data.display_name);
				setSearchQuery(data.display_name);
				if (onLocationSelect) {
					onLocationSelect(lat, lng, data.display_name, data.address);
				}
			}
		} catch (error) {
			console.error("Lỗi Reverse Geocoding:", error);
		}
	};

	const getCurrentLocation = () => {
		if (navigator.geolocation && mapInstance && markerInstance) {
			setIsLoading(true);
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setIsLoading(false);
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;

					mapInstance.setView([lat, lng], 17);
					markerInstance.setLatLng([lat, lng]);
					reverseGeocode(lat, lng);
				},
				() => {
					setIsLoading(false);
					alert("Lỗi: Không lấy được vị trí GPS hoặc bạn đã từ chối quyền.");
				},
			);
		} else {
			alert("Trình duyệt không hỗ trợ hoặc Bản đồ chưa tải xong.");
		}
	};

	return (
		<div className="w-full flex flex-col gap-3">
			{/* Thanh Tìm kiếm (Search Box) */}
			<div className="relative w-full z-20 flex gap-2">
				<div className="relative flex-1">
					<div className="absolute left-3 top-2.5 flex items-center justify-center">
						<Search className="text-muted-foreground w-4 h-4" />
					</div>
					<input
						type="text"
						value={searchQuery}
						onChange={handleSearchInput}
						onKeyDown={handleKeyDown}
						placeholder="Tìm kiếm địa chỉ, nhập số nhà, phường xã..."
						className="flex h-10 w-full rounded-md border border-border/50 bg-card/60 px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>
				<Button
					type="button"
					onClick={executeSearch}
					disabled={isSearching}
					className="h-10 px-4 gradient-gold-purple-bg hover:opacity-90 text-primary-foreground min-w-[100px]"
				>
					{isSearching ? (
						<LoaderCircle className="h-4 w-4 animate-spin" />
					) : (
						"Tìm kiếm"
					)}
				</Button>

				{/* Khung Gợi ý Box Select */}
				{searchResults.length > 0 && (
					<div className="absolute top-11 left-0 right-[108px] bg-card border border-border/50 shadow-xl rounded-lg overflow-hidden max-h-60 overflow-y-auto">
						{searchResults.map((item, idx) => (
							<div
								key={idx}
								className="p-3 hover:bg-primary/20 cursor-pointer border-b border-border/50 last:border-0 transition-colors flex items-start gap-2"
								onClick={() => handleSelectSuggestion(item)}
							>
								<MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
								<p className="text-sm text-foreground line-clamp-2">
									{item.display_name}
								</p>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Info Bar */}
			<div className="flex items-center justify-between gap-2 bg-card/60 p-3 rounded-lg border border-border/50">
				<div className="flex items-center gap-2 flex-1 min-w-0">
					<MapPin className="h-5 w-5 text-primary flex-shrink-0" />
					<p className="text-sm truncate text-foreground font-medium">
						{currentAddress ||
							initialAddress ||
							"Chưa chọn vị trí cụ thể. Kéo ghim hoặc nhấp vào bản đồ!"}
					</p>
				</div>
				<Button
					type="button"
					size="sm"
					variant="outline"
					onClick={getCurrentLocation}
					className="shrink-0 text-xs gap-1.5 h-8 border-primary/40 text-primary hover:bg-primary/10"
				>
					<Navigation className="h-3.5 w-3.5" /> Vị trí OSM
				</Button>
			</div>

			{/* Vùng chứa Map container */}
			<div className="relative w-full h-[350px] rounded-xl overflow-hidden border border-border/50 z-0">
				{isLoading && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
						<LoaderCircle className="h-8 w-8 animate-spin text-primary" />
					</div>
				)}
				<div ref={mapRef} className="w-full h-full" />
			</div>
		</div>
	);
}
