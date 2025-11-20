"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import { toast } from "sonner";
import { Search, X, Loader2, MapPin } from "lucide-react";

// Types
interface MapSelectionData {
  lat: number;
  lng: number;
  address: string;
}

interface HereMapPickerProps {
  onLocationSelect: (data: MapSelectionData) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  className?: string;
}

const HERE_API_KEY = process.env.NEXT_PUBLIC_HERE_MAP_API_KEY;

const HereMapPicker: React.FC<HereMapPickerProps> = ({
  onLocationSelect,
  initialLat = 16.073932414484002, // TP.HCM / Đà Nẵng
  initialLng = 108.1352594423287,
  initialAddress = "",
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // State hiển thị
  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState({
    lat: initialLat,
    lng: initialLng,
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs để giữ instance của HERE Map
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const platformRef = useRef<any>(null);

  // --- FIX: Thêm | null để TypeScript hiểu là MutableRefObject ---
  const resizeHandlerRef = useRef<(() => void) | null>(null);

  // 1. Khởi tạo Platform khi script loaded
  useEffect(() => {
    if (
      isMapLoaded &&
      HERE_API_KEY &&
      (window as any).H &&
      !platformRef.current
    ) {
      try {
        platformRef.current = new (window as any).H.service.Platform({
          apikey: HERE_API_KEY,
        });
      } catch (error) {
        console.error("Error initializing HERE Platform:", error);
      }
    }
  }, [isMapLoaded]);

  // --- SEARCH FUNCTION ---
  const handleSearch = async () => {
    if (!searchQuery.trim() || !platformRef.current) return;

    setIsSearching(true);
    setSuggestions([]);

    const service = platformRef.current.getSearchService();
    service.geocode(
      { q: searchQuery, limit: 5 },
      (result: any) => {
        // Check nếu component đã unmount (map bị dispose) thì không làm gì cả
        if (!mapInstanceRef.current) return;

        setIsSearching(false);
        if (result.items && result.items.length > 0) {
          setSuggestions(result.items);
        } else {
          toast.error("Không tìm thấy địa chỉ nào phù hợp.");
        }
      },
      (error: any) => {
        if (!mapInstanceRef.current) return;
        setIsSearching(false);
        console.error("Geocode error:", error);
        toast.error("Lỗi khi tìm kiếm địa chỉ.");
      }
    );
  };

  // --- Xử lý chọn địa điểm ---
  const handleSelectSuggestion = (item: any) => {
    const { position, address: addrObj } = item;
    const lat = Number(position.lat);
    const lng = Number(position.lng);
    const label = addrObj.label;

    setSearchQuery("");
    setSuggestions([]);

    // 1. Cập nhật state hiển thị & dữ liệu gửi ra ngoài
    setAddress(label);
    setCoordinates({ lat, lng });
    onLocationSelect({ lat, lng, address: label });

    // 2. Cập nhật Map & Marker
    if (mapInstanceRef.current && markerInstanceRef.current) {
      const map = mapInstanceRef.current;
      const marker = markerInstanceRef.current;

      marker.setGeometry({ lat, lng });

      map.getViewModel().setLookAtData(
        {
          position: { lat, lng },
          zoom: 16,
        },
        true
      );
    }
  };

  // --- MAP LOGIC ---
  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!platformRef.current) return;
      // SAFETY CHECK: Không gọi API nếu map đã bị hủy
      if (!mapInstanceRef.current) return;

      const service = platformRef.current.getSearchService();
      service.reverseGeocode(
        { at: `${lat},${lng}` },
        (result: any) => {
          // SAFETY CHECK AGAIN
          if (!mapInstanceRef.current) return;

          if (result.items.length > 0) {
            const addressLabel = result.items[0].address.label;
            setAddress(addressLabel);
            onLocationSelect({ lat, lng, address: addressLabel });
          } else {
            setAddress("Không tìm thấy địa chỉ chính xác");
            onLocationSelect({
              lat,
              lng,
              address: "Không tìm thấy địa chỉ chính xác",
            });
          }
        },
        (error: any) => console.error("Error fetching address:", error)
      );
    },
    [onLocationSelect]
  );

  const updateMapLocation = useCallback(
    (lat: number, lng: number, map: any, marker: any) => {
      if (!mapInstanceRef.current) return; // Safety check

      setCoordinates({ lat, lng });
      marker.setGeometry({ lat, lng });

      map.getViewModel().setLookAtData(
        {
          position: { lat, lng },
          zoom: 16,
        },
        true
      );

      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  const initMap = useCallback(() => {
    if (!mapRef.current || !(window as any).H || !platformRef.current) return;

    if (mapInstanceRef.current) return;

    try {
      const H = (window as any).H;
      const platform = platformRef.current;
      const defaultLayers = platform.createDefaultLayers();
      const initialCenter = { lat: initialLat, lng: initialLng };

      const baseLayer =
        defaultLayers.vector?.normal?.map || defaultLayers.raster?.normal?.map;

      if (!baseLayer) {
        console.error("HERE Maps: Could not find a valid base layer.");
        return;
      }

      const map = new H.Map(mapRef.current, baseLayer, {
        zoom: 14,
        center: initialCenter,
        pixelRatio: window.devicePixelRatio || 1,
      });

      const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      H.ui.UI.createDefault(map, defaultLayers);

      const marker = new H.map.Marker(initialCenter, { volatility: true });
      marker.draggable = true;
      map.addObject(marker);

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Events: Drag/Click -> updateMapLocation
      marker.addEventListener("dragend", (evt: any) => {
        const coord = map.screenToGeo(
          evt.currentPointer.viewportX,
          evt.currentPointer.viewportY
        );
        updateMapLocation(coord.lat, coord.lng, map, marker);
      });

      map.addEventListener("tap", function (evt: any) {
        const coord = map.screenToGeo(
          evt.currentPointer.viewportX,
          evt.currentPointer.viewportY
        );
        updateMapLocation(coord.lat, coord.lng, map, marker);
      });

      // --- QUẢN LÝ SỰ KIỆN RESIZE ĐÚNG CÁCH ---
      const resizeHandler = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.getViewPort().resize();
        }
      };
      window.addEventListener("resize", resizeHandler);
      // Lưu lại reference để remove sau này
      resizeHandlerRef.current = resizeHandler;

      setTimeout(() => {
        // Kiểm tra map instance trước khi thao tác trong timeout
        if (!mapInstanceRef.current) return;

        if (!initialAddress) {
          updateMapLocation(initialLat, initialLng, map, marker);
        } else {
          map.getViewModel().setLookAtData({
            position: { lat: initialLat, lng: initialLng },
            zoom: 14,
          });
          marker.setGeometry({ lat: initialLat, lng: initialLng });
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Có lỗi xảy ra khi tải bản đồ.");
    }
  }, [initialLat, initialLng, initialAddress, updateMapLocation]);

  useEffect(() => {
    if (
      isMapLoaded &&
      platformRef.current &&
      mapRef.current &&
      !mapInstanceRef.current
    ) {
      initMap();
    }
  }, [isMapLoaded, initMap]);

  // --- CLEANUP ĐÚNG CÁCH KHI UNMOUNT ---
  useEffect(() => {
    return () => {
      // 1. Gỡ bỏ sự kiện resize TRƯỚC khi dispose map
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }

      // 2. Dispose Map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.dispose();
        } catch (e) {
          console.warn("Map dispose error", e);
        }
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []); // Chỉ chạy 1 lần khi unmount

  // Đồng bộ props khi parent thay đổi
  useEffect(() => {
    if (
      mapInstanceRef.current &&
      markerInstanceRef.current &&
      (Math.abs(coordinates.lat - initialLat) > 0.0001 ||
        Math.abs(coordinates.lng - initialLng) > 0.0001)
    ) {
      const map = mapInstanceRef.current;
      const marker = markerInstanceRef.current;

      // Update internal state
      setCoordinates({ lat: initialLat, lng: initialLng });
      setAddress(initialAddress);

      // Update UI
      marker.setGeometry({ lat: initialLat, lng: initialLng });
      map.getViewModel().setLookAtData(
        {
          position: { lat: initialLat, lng: initialLng },
          zoom: 16,
        },
        true
      );
    }
  }, [initialLat, initialLng, initialAddress]);

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Scripts */}
      {!isMapLoaded && (
        <>
          <Script
            src="https://js.api.here.com/v3/3.2/mapsjs-core.js"
            onLoad={() => {
              const loadScript = (src: string) =>
                new Promise((resolve, reject) => {
                  const script = document.createElement("script");
                  script.src = src;
                  script.onload = resolve;
                  script.onerror = reject;
                  document.head.appendChild(script);
                });

              Promise.all([
                loadScript("https://js.api.here.com/v3/3.2/mapsjs-service.js"),
                loadScript("https://js.api.here.com/v3/3.2/mapsjs-ui.js"),
                loadScript(
                  "https://js.api.here.com/v3/3.2/mapsjs-mapevents.js"
                ),
              ])
                .then(() => setIsMapLoaded(true))
                .catch((err) => {
                  console.error(err);
                  toast.error("Không thể tải script bản đồ.");
                });
            }}
          />
          <link
            rel="stylesheet"
            type="text/css"
            href="https://js.api.here.com/v3/3.2/mapsjs-ui.css"
          />
        </>
      )}

      {/* SEARCH BOX */}
      <div className="relative z-10">
        <Label>Tìm kiếm địa điểm</Label>
        <div className="relative mt-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Nhập địa chỉ..."
            className="pr-20"
          />
          <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            >
              {isSearching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Search size={18} />
              )}
            </button>
          </div>
        </div>

        {/* SUGGESTIONS DROPDOWN */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
            {suggestions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectSuggestion(item)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {item.address.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SELECTED ADDRESS INFO */}
      <div>
        <Label>Địa chỉ đã chọn</Label>
        <Input
          value={address}
          readOnly
          className="mt-1.5 !bg-gray-100 dark:!bg-gray-800 cursor-not-allowed text-gray-700 dark:text-gray-300"
        />
        <p className="text-xs text-gray-500 mt-1">
          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      </div>

      {/* MAP CONTAINER */}
      <div
        ref={mapRef}
        className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative shadow-inner"
      >
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 gap-2">
            <Loader2 className="animate-spin" /> Đang tải bản đồ...
          </div>
        )}
      </div>
    </div>
  );
};

export default HereMapPicker;
