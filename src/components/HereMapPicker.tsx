"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import Input from "@/shared/Input";
import Label from "@/components/Label";
import { toast } from "sonner";

// Giả định types cho giao tiếp
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
  initialLat = 16.073932414484002, // Mặc định TP.HCM
  initialLng = 108.1352594423287,
  initialAddress = "",
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const platformRef = useRef<any>(null);

  // Khởi tạo HERE Platform
  useEffect(() => {
    if (HERE_API_KEY && (window as any).H && !platformRef.current) {
      platformRef.current = new (window as any).H.service.Platform({
        apikey: HERE_API_KEY,
      });
    }
  }, [isMapLoaded]);

  // Reverse Geocoding: Lấy địa chỉ từ tọa độ
  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (!platformRef.current) return;

      const service = platformRef.current.getSearchService();
      service.reverseGeocode(
        {
          at: `${lat},${lng}`,
        },
        (result: any) => {
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
        (error: any) => {
          console.error("Error fetching address:", error);
          // Không toast ở đây để tránh spam, chỉ log
        }
      );
    },
    [onLocationSelect]
  );

  // Cập nhật vị trí trên Map và gọi Reverse Geocoding
  const updateMapLocation = useCallback(
    (lat: number, lng: number, map: any, marker: any) => {
      setCoordinates({ lat, lng });
      marker.setGeometry({ lat, lng });
      map.setCenter({ lat, lng });
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // Hàm khởi tạo Map
  const initMap = useCallback(() => {
    if (!mapRef.current || !(window as any).H || mapInstanceRef.current) return;

    const H = (window as any).H;
    const platform = platformRef.current;

    const defaultLayers = platform.createDefaultLayers();
    const initialCenter = { lat: initialLat, lng: initialLng };

    const map = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      zoom: 14,
      center: initialCenter,
      pixelRatio: window.devicePixelRatio || 1,
    });

    // Thêm tương tác
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, defaultLayers);

    // Tạo Marker
    const marker = new H.map.Marker(initialCenter, { volatility: true });
    marker.draggable = true;
    map.addObject(marker);

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    // Kéo thả Marker
    marker.addEventListener("dragend", (evt: any) => {
      const coord = map.screenToGeo(
        evt.currentPointer.viewportX,
        evt.currentPointer.viewportY
      );
      updateMapLocation(coord.lat, coord.lng, map, marker);
    });

    // Click vào Map
    map.addEventListener("tap", function (evt: any) {
      const coord = map.screenToGeo(
        evt.currentPointer.viewportX,
        evt.currentPointer.viewportY
      );
      updateMapLocation(coord.lat, coord.lng, map, marker);
    });

    // Trigger lần đầu với vị trí mặc định
    updateMapLocation(initialLat, initialLng, map, marker);

    // Xử lý resize
    window.addEventListener("resize", () => map.getViewPort().resize());
  }, [initialLat, initialLng, updateMapLocation]);

  // Hook để khởi tạo map sau khi scripts tải xong
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

  // Xử lý khi initialLat/Lng thay đổi (ví dụ khi sửa địa chỉ)
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      updateMapLocation(
        initialLat,
        initialLng,
        mapInstanceRef.current,
        markerInstanceRef.current
      );
    } else {
      // Cập nhật state nếu chưa có map instance
      setCoordinates({ lat: initialLat, lng: initialLng });
      setAddress(initialAddress);
    }
  }, [initialLat, initialLng, initialAddress, updateMapLocation]);

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Load Scripts của HERE Map */}
      {!isMapLoaded && (
        <>
          <Script
            src="https://js.api.here.com/v3/3.1/mapsjs-core.js"
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
                loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js"),
                loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js"),
                loadScript(
                  "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js"
                ),
              ])
                .then(() => {
                  setIsMapLoaded(true);
                })
                .catch(() => {
                  toast.error("Không thể tải bản đồ.");
                });
            }}
            onError={() => {
              toast.error("Không thể tải bản đồ.");
            }}
          />
          <link
            rel="stylesheet"
            type="text/css"
            href="https://js.api.here.com/v3/3.1/mapsjs-ui.css"
          />
        </>
      )}

      {/* Hiển thị địa chỉ đã chọn (Readonly) */}
      <div className="flex-grow">
        <Label>Địa chỉ tự động tìm được (Click hoặc Kéo thả trên bản đồ)</Label>
        <Input
          value={address}
          readOnly
          placeholder="Chọn vị trí trên bản đồ..."
          className="mt-1.5 !bg-gray-100 dark:!bg-gray-800 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tọa độ: Lat {coordinates.lat.toFixed(6)}, Lng{" "}
          {coordinates.lng.toFixed(6)}
        </p>
      </div>

      {/* Container chứa bản đồ */}
      <div
        ref={mapRef}
        className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative"
      >
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            Đang tải bản đồ...
          </div>
        )}
      </div>
    </div>
  );
};

export default HereMapPicker;
