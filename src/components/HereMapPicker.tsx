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

  // 1. Cleanup map khi unmount (QUAN TRỌNG: Tránh lỗi map khởi tạo 2 lần)
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.dispose();
        } catch (e) {
          console.warn("Map dispose error", e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Khởi tạo Platform khi script loaded
  useEffect(() => {
    if (isMapLoaded && HERE_API_KEY && (window as any).H && !platformRef.current) {
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
        setIsSearching(false);
        if (result.items && result.items.length > 0) {
          setSuggestions(result.items);
        } else {
          toast.error("Không tìm thấy địa chỉ nào phù hợp.");
        }
      },
      (error: any) => {
        setIsSearching(false);
        console.error("Geocode error:", error);
        toast.error("Lỗi khi tìm kiếm địa chỉ.");
      }
    );
  };

  const handleSelectSuggestion = (item: any) => {
    const { position, address: addrObj } = item;
    const lat = position.lat;
    const lng = position.lng;
    const label = addrObj.label;

    setSearchQuery(""); 
    setSuggestions([]);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      updateMapLocation(lat, lng, mapInstanceRef.current, markerInstanceRef.current);
      setAddress(label);
      onLocationSelect({ lat, lng, address: label });
    }
  };

  // --- MAP LOGIC ---
  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!platformRef.current) return;

      const service = platformRef.current.getSearchService();
      service.reverseGeocode(
        { at: `${lat},${lng}` },
        (result: any) => {
          if (result.items.length > 0) {
            const addressLabel = result.items[0].address.label;
            setAddress(addressLabel);
            onLocationSelect({ lat, lng, address: addressLabel });
          } else {
            setAddress("Không tìm thấy địa chỉ chính xác");
            onLocationSelect({ lat, lng, address: "Không tìm thấy địa chỉ chính xác" });
          }
        },
        (error: any) => console.error("Error fetching address:", error)
      );
    },
    [onLocationSelect]
  );

  const updateMapLocation = useCallback(
    (lat: number, lng: number, map: any, marker: any) => {
      setCoordinates({ lat, lng });
      marker.setGeometry({ lat, lng });
      map.setCenter({ lat, lng }, true);
      map.setZoom(16, true);
      // Chỉ gọi reverseGeocode khi cần thiết (ví dụ drag drop)
      // Ở đây gọi luôn để đảm bảo đồng bộ address hiển thị
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  const initMap = useCallback(() => {
    if (!mapRef.current || !(window as any).H || !platformRef.current) return;
    
    // Nếu map đã tồn tại, không khởi tạo lại
    if (mapInstanceRef.current) return;

    try {
      const H = (window as any).H;
      const platform = platformRef.current;
      const defaultLayers = platform.createDefaultLayers();
      const initialCenter = { lat: initialLat, lng: initialLng };

      // FIX QUAN TRỌNG: Chọn layer hợp lệ. Nếu vector không có, dùng raster.
      // Tuyệt đối không truyền null vào tham số thứ 2 của H.Map
      const baseLayer = defaultLayers.vector?.normal?.map || defaultLayers.raster?.normal?.map;

      if (!baseLayer) {
        console.error("HERE Maps: Could not find a valid base layer.");
        return;
      }

      // Khởi tạo Map với layer đã chọn
      const map = new H.Map(mapRef.current, baseLayer, {
        zoom: 14,
        center: initialCenter,
        pixelRatio: window.devicePixelRatio || 1,
      });

      // UI & Behaviors
      const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      H.ui.UI.createDefault(map, defaultLayers);

      // Marker
      const marker = new H.map.Marker(initialCenter, { volatility: true });
      marker.draggable = true;
      map.addObject(marker);

      // Lưu refs
      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Events
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

      // Resize handler
      window.addEventListener("resize", () => map.getViewPort().resize());
      
      // Set vị trí ban đầu (update text address)
      // Dùng timeout nhỏ để đảm bảo map render xong
      setTimeout(() => {
          updateMapLocation(initialLat, initialLng, map, marker);
      }, 100);

    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Có lỗi xảy ra khi tải bản đồ.");
    }
  }, [initialLat, initialLng, updateMapLocation]);

  // Hook trigger initMap
  useEffect(() => {
    if (isMapLoaded && platformRef.current && mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, [isMapLoaded, initMap]);

  // Đồng bộ props khi parent thay đổi
  useEffect(() => {
    if (
      mapInstanceRef.current &&
      markerInstanceRef.current &&
      (Math.abs(coordinates.lat - initialLat) > 0.0001 ||
       Math.abs(coordinates.lng - initialLng) > 0.0001)
    ) {
      updateMapLocation(
        initialLat,
        initialLng,
        mapInstanceRef.current,
        markerInstanceRef.current
      );
    } else if (!mapInstanceRef.current) {
       setCoordinates({ lat: initialLat, lng: initialLng });
       setAddress(initialAddress);
    }
  }, [initialLat, initialLng, initialAddress, updateMapLocation]);

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Load Scripts */}
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
                loadScript("https://js.api.here.com/v3/3.2/mapsjs-mapevents.js"),
              ])
                .then(() => setIsMapLoaded(true))
                .catch((err) => {
                    console.error(err);
                    toast.error("Không thể tải script bản đồ.");
                });
            }}
          />
          <link rel="stylesheet" type="text/css" href="https://js.api.here.com/v3/3.2/mapsjs-ui.css" />
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
                onClick={() => { setSearchQuery(""); setSuggestions([]); }}
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
              {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
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
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.address.label}</p>
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