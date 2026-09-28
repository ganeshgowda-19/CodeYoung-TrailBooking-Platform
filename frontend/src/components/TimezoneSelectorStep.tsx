import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Search,
  AlertCircle,
  MapPin,
  Map,
  Globe,
  Layers,
  Sparkles,
  Navigation,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';

interface Props {
  selectedTimezone: string;
  onSelect: (tz: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface RegionPin {
  tz: string;
  name: string;
  flag: string;
  region: string;
  lat: number;
  lng: number;
  xPercent: number;
  yPercent: number;
  sphereRotY: number;
  sphereRotX: number;
}

export const REGION_PINS: RegionPin[] = [
  { tz: 'America/New_York', name: 'New York / Toronto', flag: '🇺🇸', region: 'North America East', lat: 40.7128, lng: -74.006, xPercent: 24, yPercent: 34, sphereRotY: -74, sphereRotX: 20 },
  { tz: 'America/Chicago', name: 'Chicago / Dallas', flag: '🇺🇸', region: 'North America Central', lat: 41.8781, lng: -87.6298, xPercent: 20, yPercent: 33, sphereRotY: -87, sphereRotX: 20 },
  { tz: 'America/Denver', name: 'Denver / Phoenix', flag: '🇺🇸', region: 'North America Mountain', lat: 39.7392, lng: -104.9903, xPercent: 17, yPercent: 35, sphereRotY: -105, sphereRotX: 20 },
  { tz: 'America/Los_Angeles', name: 'Los Angeles / Vancouver', flag: '🇨🇦', region: 'North America West', lat: 34.0522, lng: -118.2437, xPercent: 14, yPercent: 38, sphereRotY: -118, sphereRotX: 18 },
  { tz: 'America/Mexico_City', name: 'Mexico City / Guadalajara', flag: '🇲🇽', region: 'Central America', lat: 19.4326, lng: -99.1332, xPercent: 18, yPercent: 44, sphereRotY: -99, sphereRotX: 18 },
  { tz: 'America/Sao_Paulo', name: 'São Paulo / Rio', flag: '🇧🇷', region: 'South America East', lat: -23.5505, lng: -46.6333, xPercent: 32, yPercent: 68, sphereRotY: -46, sphereRotX: -15 },
  { tz: 'America/Argentina/Buenos_Aires', name: 'Buenos Aires / Santiago', flag: '🇦🇷', region: 'South America South', lat: -34.6037, lng: -58.3816, xPercent: 30, yPercent: 76, sphereRotY: -58, sphereRotX: -20 },
  { tz: 'Europe/London', name: 'London / Dublin', flag: '🇬🇧', region: 'Europe / UK (GMT)', lat: 51.5074, lng: -0.1278, xPercent: 47, yPercent: 25, sphereRotY: 0, sphereRotX: 25 },
  { tz: 'Europe/Paris', name: 'Paris / Berlin / Rome', flag: '🇫🇷', region: 'Central Europe (CET)', lat: 48.8566, lng: 2.3522, xPercent: 49, yPercent: 28, sphereRotY: 10, sphereRotX: 24 },
  { tz: 'Europe/Madrid', name: 'Madrid / Barcelona', flag: '🇪🇸', region: 'Southern Europe', lat: 40.4168, lng: -3.7038, xPercent: 46, yPercent: 32, sphereRotY: -4, sphereRotX: 22 },
  { tz: 'Europe/Athens', name: 'Athens / Greece', flag: '🇬🇷', region: 'Southeastern Europe', lat: 37.9838, lng: 23.7275, xPercent: 54, yPercent: 32, sphereRotY: 25, sphereRotX: 18 },
  { tz: 'Europe/Istanbul', name: 'Istanbul / Turkey', flag: '🇹🇷', region: 'Eurasia / Turkey', lat: 41.0082, lng: 28.9784, xPercent: 55, yPercent: 31, sphereRotY: 29, sphereRotX: 22 },
  { tz: 'Africa/Cairo', name: 'Cairo / Egypt', flag: '🇪🇬', region: 'North Africa', lat: 30.0444, lng: 31.2357, xPercent: 56, yPercent: 40, sphereRotY: 31, sphereRotX: 18 },
  { tz: 'Africa/Nairobi', name: 'Nairobi / Kenya', flag: '🇰🇪', region: 'East Africa', lat: -1.2921, lng: 36.8219, xPercent: 57, yPercent: 55, sphereRotY: 37, sphereRotX: -5 },
  { tz: 'Africa/Johannesburg', name: 'Johannesburg / Cape Town', flag: '🇿🇦', region: 'Southern Africa', lat: -26.2041, lng: 28.0473, xPercent: 54, yPercent: 66, sphereRotY: 28, sphereRotX: -15 },
  { tz: 'Asia/Dubai', name: 'Dubai / Riyadh', flag: '🇦🇪', region: 'Middle East (GST)', lat: 25.2048, lng: 55.2708, xPercent: 62, yPercent: 44, sphereRotY: 55, sphereRotX: 15 },
  { tz: 'Asia/Kolkata', name: 'India (IST)', flag: '🇮🇳', region: 'South Asia (IST)', lat: 28.6139, lng: 77.209, xPercent: 71, yPercent: 42, sphereRotY: 77, sphereRotX: 18 },
  { tz: 'Asia/Bangkok', name: 'Bangkok / Vietnam', flag: '🇹🇭', region: 'Indochina', lat: 13.7563, lng: 100.5018, xPercent: 77, yPercent: 50, sphereRotY: 101, sphereRotX: 10 },
  { tz: 'Asia/Singapore', name: 'Singapore / Kuala Lumpur', flag: '🇸🇬', region: 'Southeast Asia (SGT)', lat: 1.3521, lng: 103.8198, xPercent: 78, yPercent: 57, sphereRotY: 104, sphereRotX: 5 },
  { tz: 'Asia/Jakarta', name: 'Jakarta / Bali', flag: '🇮🇩', region: 'Indonesia / Bali', lat: -6.2088, lng: 106.8456, xPercent: 79, yPercent: 62, sphereRotY: 107, sphereRotX: -8 },
  { tz: 'Asia/Shanghai', name: 'Shanghai / Hong Kong', flag: '🇨🇳', region: 'Greater China (CST)', lat: 31.2304, lng: 121.4737, xPercent: 82, yPercent: 38, sphereRotY: 121, sphereRotX: 16 },
  { tz: 'Asia/Tokyo', name: 'Tokyo / Seoul', flag: '🇯🇵', region: 'East Asia (JST)', lat: 35.6762, lng: 139.6503, xPercent: 86, yPercent: 36, sphereRotY: 140, sphereRotX: 18 },
  { tz: 'Australia/Sydney', name: 'Sydney / Melbourne', flag: '🇦🇺', region: 'Australia East (AEST)', lat: -33.8688, lng: 151.2093, xPercent: 88, yPercent: 78, sphereRotY: 151, sphereRotX: -20 },
  { tz: 'Pacific/Auckland', name: 'Auckland / Pacific', flag: '🇳ℤ', region: 'New Zealand (NZST)', lat: -36.8485, lng: 174.7633, xPercent: 95, yPercent: 82, sphereRotY: 174, sphereRotX: -22 },
];

// Photorealistic Earth Landmasses with Biome Classification
interface LandPoly {
  points: [number, number][];
  type: 'LUSH' | 'DESERT' | 'ICE' | 'MOUNTAIN';
}

const EARTH_LAND_POLYGONS: LandPoly[] = [
  // North America (Lush Green + Desert Southwest + Rockies)
  {
    type: 'LUSH',
    points: [
      [71, -165], [66, -142], [60, -135], [58, -130], [50, -128], [40, -124],
      [32, -117], [28, -112], [22, -105], [16, -95], [14, -90], [8, -80],
      [15, -88], [20, -88], [25, -80], [30, -81], [30, -85], [35, -75], [42, -70],
      [45, -64], [52, -55], [60, -64], [62, -75], [70, -85], [72, -120], [71, -165]
    ],
  },
  // North America Desert Southwest & Mexico
  {
    type: 'DESERT',
    points: [
      [36, -115], [34, -110], [28, -112], [23, -110], [20, -100], [26, -98], [32, -102], [36, -115]
    ]
  },
  // Rocky Mountains Ridge
  {
    type: 'MOUNTAIN',
    points: [
      [58, -125], [48, -115], [40, -108], [34, -106], [38, -108], [46, -116], [58, -125]
    ]
  },
  // South America (Amazon Lush Green)
  {
    type: 'LUSH',
    points: [
      [12, -73], [8, -78], [0, -80], [-10, -78], [-18, -70], [-33, -71], [-54, -68],
      [-52, -64], [-40, -62], [-23, -42], [-5, -35], [5, -52], [10, -62], [12, -73]
    ]
  },
  // Andes Mountain Range (South America West Coast)
  {
    type: 'MOUNTAIN',
    points: [
      [8, -77], [0, -78], [-15, -74], [-30, -71], [-50, -73], [-52, -69], [-28, -69], [-12, -72], [8, -77]
    ]
  },
  // Europe (Lush Green)
  {
    type: 'LUSH',
    points: [
      [71, 28], [70, 18], [62, 5], [58, 6], [54, 9], [53, 19], [46, 14], [43, 3],
      [36, -5], [37, -9], [43, -9], [47, -2], [50, 1.5], [54, 6], [60, 25], [68, 28], [71, 28]
    ]
  },
  // Alps Mountains (Central Europe)
  {
    type: 'MOUNTAIN',
    points: [[47, 6], [46, 11], [45, 13], [46, 8], [47, 6]]
  },
  // Sahara Desert (North Africa & Arabian Peninsula)
  {
    type: 'DESERT',
    points: [
      [37, -10], [37, 10], [33, 33], [30, 32], [22, 37], [12, 51], [12, 44], [15, 38],
      [12, 10], [15, -17], [21, -17], [32, -8], [37, -10]
    ]
  },
  // Arabian Peninsula Desert
  {
    type: 'DESERT',
    points: [
      [30, 35], [30, 50], [25, 56], [16, 53], [12, 44], [22, 37], [30, 35]
    ]
  },
  // Central & Southern Africa (Lush Green Rainforest & Savanna)
  {
    type: 'LUSH',
    points: [
      [12, 10], [12, 51], [0, 42], [-11, 40], [-25, 33], [-34, 25], [-34, 18],
      [-18, 12], [-5, 12], [4, 9], [5, -3], [10, -14], [12, 10]
    ]
  },
  // Asia Main (Lush Green Siberia, China & India)
  {
    type: 'LUSH',
    points: [
      [70, 35], [70, 175], [60, 160], [55, 140], [42, 130], [38, 118], [22, 114], [10, 108],
      [1, 104], [10, 98], [22, 90], [22, 70], [13, 80], [8, 77], [24, 68], [30, 70],
      [40, 50], [50, 55], [60, 60], [70, 35]
    ]
  },
  // Himalayas Mountain Range (South Asia)
  {
    type: 'MOUNTAIN',
    points: [
      [35, 70], [32, 78], [28, 88], [27, 95], [30, 95], [34, 85], [37, 75], [35, 70]
    ]
  },
  // Gobi Desert (Central Asia)
  {
    type: 'DESERT',
    points: [
      [45, 80], [45, 110], [36, 105], [35, 80], [45, 80]
    ]
  },
  // Australia (Outback Desert Center)
  {
    type: 'DESERT',
    points: [
      [-16, 116], [-14, 141], [-25, 150], [-35, 145], [-35, 117], [-22, 114], [-16, 116]
    ]
  },
  // Australia Coastal Green Rim
  {
    type: 'LUSH',
    points: [
      [-12, 130], [-14, 141], [-25, 153], [-38, 148], [-38, 140], [-35, 136], [-35, 117],
      [-22, 114], [-14, 126], [-12, 130]
    ]
  },
  // Greenland Ice Cap
  {
    type: 'ICE',
    points: [
      [76, -68], [82, -30], [81, -18], [70, -22], [60, -43], [65, -53], [76, -68]
    ]
  },
  // Antarctica Ice Continent (South Pole)
  {
    type: 'ICE',
    points: [
      [-65, -180], [-70, -120], [-75, -60], [-80, 0], [-75, 60], [-70, 120], [-65, 180], [-90, 0], [-65, -180]
    ]
  },
  // Islands: UK & Ireland
  {
    type: 'LUSH',
    points: [[58, -6], [58, -2], [52, 1.5], [50, -5], [54, -6], [58, -6]]
  },
  // Japan Islands
  {
    type: 'LUSH',
    points: [[45, 142], [41, 140], [35, 136], [31, 130], [33, 132], [40, 140], [45, 142]]
  },
  // Madagascar
  {
    type: 'LUSH',
    points: [[-12, 49], [-16, 47], [-25, 47], [-25, 44], [-16, 44], [-12, 49]]
  },
  // New Zealand
  {
    type: 'LUSH',
    points: [[-34, 172], [-38, 178], [-46, 170], [-44, 166], [-38, 175], [-34, 172]]
  },
  // Sri Lanka
  {
    type: 'LUSH',
    points: [[10, 80], [6, 82], [6, 80], [10, 80]]
  },
  // Indonesia & Malaysia
  {
    type: 'LUSH',
    points: [[5, 100], [4, 118], [-7, 114], [-6, 105], [5, 100]]
  },
  // Philippines
  {
    type: 'LUSH',
    points: [[18, 120], [14, 124], [7, 125], [10, 122], [18, 120]]
  },
];

// Major Global City Lights (Night-side realistic glowing points)
const CITY_LIGHTS: [number, number][] = [
  [40.71, -74.00], [34.05, -118.24], [41.87, -87.62], [29.76, -95.36], [19.43, -99.13],
  [51.50, -0.12], [48.85, 2.35], [52.52, 13.40], [41.90, 12.49], [40.41, -3.70], [55.75, 37.61],
  [28.61, 77.20], [19.07, 72.87], [12.97, 77.59], [22.57, 88.36],
  [35.67, 139.65], [37.56, 126.97], [31.23, 121.47], [22.31, 114.16], [23.12, 113.26],
  [1.35, 103.81], [13.75, 100.50], [-6.20, 106.84], [25.20, 55.27], [24.71, 46.67], [30.04, 31.23],
  [-23.55, -46.63], [-34.60, -58.38], [-33.86, 151.20], [-37.81, 144.96]
];

interface Interactive3DEarthGlobeProps {
  selectedTimezone: string;
  regionPins: RegionPin[];
  onSelect: (tz: string) => void;
  onSwitchToSatellite: () => void;
}

const Interactive3DEarthGlobe: React.FC<Interactive3DEarthGlobeProps> = ({
  selectedTimezone,
  regionPins,
  onSelect,
  onSwitchToSatellite,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [pinScreenCoords, setPinScreenCoords] = useState<Record<string, { x: number; y: number; isVisible: boolean }>>({});

  const rotYRef = useRef<number>(-77);
  const rotXRef = useRef<number>(15);
  const isAutoRotateRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const cloudOffsetRef = useRef<number>(0);
  const dragStartRef = useRef<{ x: number; y: number; rotY: number; rotX: number }>({
    x: 0,
    y: 0,
    rotY: -77,
    rotX: 15,
  });

  // Keep ref synchronized with state
  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  // Orbit to selected timezone pin when selection changes
  useEffect(() => {
    const targetPin = regionPins.find((p) => p.tz === selectedTimezone);
    if (targetPin) {
      rotYRef.current = -targetPin.sphereRotY;
      rotXRef.current = targetPin.sphereRotX;
      setIsAutoRotate(false);
      isAutoRotateRef.current = false;
    }
  }, [selectedTimezone, regionPins]);

  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    setIsAutoRotate(false);
    isAutoRotateRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotY: rotYRef.current,
      rotX: rotXRef.current,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    rotYRef.current = (dragStartRef.current.rotY + deltaX * 0.4) % 360;
    rotXRef.current = Math.max(-65, Math.min(65, dragStartRef.current.rotX - deltaY * 0.3));
  };

  const handleContainerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Fluid 60 FPS 3D Canvas Render Loop
  useEffect(() => {
    let animId: number;

    const renderFrame = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;

      if (container && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Increment continuous rotation ONLY when auto-orbit is active
          if (isAutoRotateRef.current && !isDraggingRef.current) {
            rotYRef.current = (rotYRef.current + 0.3) % 360;
            cloudOffsetRef.current = (cloudOffsetRef.current + 0.4) % 360;
          }

          const rect = container.getBoundingClientRect();
          const width = rect.width || 360;
          const height = rect.height || 360;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
          }

          ctx.save();
          ctx.scale(dpr, dpr);

          const cx = width / 2;
          const cy = height / 2;
          const R = Math.min(width, height) * (width < 480 ? 0.36 : 0.38);

          const rotYRad = (rotYRef.current * Math.PI) / 180;
          const rotXRad = (rotXRef.current * Math.PI) / 180;

          const project3D = (lat: number, lng: number, radius = R) => {
            const latRad = (lat * Math.PI) / 180;
            const lngRad = (lng * Math.PI) / 180;

            const x0 = radius * Math.cos(latRad) * Math.sin(lngRad - rotYRad);
            const y0 = -radius * Math.sin(latRad);
            const z0 = radius * Math.cos(latRad) * Math.cos(lngRad - rotYRad);

            const x = x0;
            const y = y0 * Math.cos(rotXRad) - z0 * Math.sin(rotXRad);
            const z = y0 * Math.sin(rotXRad) + z0 * Math.cos(rotXRad);

            return {
              screenX: cx + x,
              screenY: cy + y,
              z: z,
            };
          };

          ctx.clearRect(0, 0, width, height);

          // 1. Space background
          const bgGrad = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 2.2);
          bgGrad.addColorStop(0, '#040d1a');
          bgGrad.addColorStop(0.5, '#020712');
          bgGrad.addColorStop(1, '#000308');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, width, height);

          // Stars
          for (let i = 0; i < 50; i++) {
            const starX = (Math.sin(i * 127 + rotYRef.current * 0.005) * 0.5 + 0.5) * width;
            const starY = (Math.cos(i * 43 + rotXRef.current * 0.005) * 0.5 + 0.5) * height;
            const size = i % 3 === 0 ? 1.4 : 0.8;
            ctx.fillStyle = i % 4 === 0 ? 'rgba(186, 230, 253, 0.7)' : 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(starX, starY, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // 2. Atmosphere Outer Halo
          const outerHaloGrad = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.25);
          outerHaloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
          outerHaloGrad.addColorStop(0.4, 'rgba(14, 165, 233, 0.28)');
          outerHaloGrad.addColorStop(0.8, 'rgba(3, 105, 161, 0.08)');
          outerHaloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.beginPath();
          ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2);
          ctx.fillStyle = outerHaloGrad;
          ctx.fill();

          // 3. Earth Ocean Base Body
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, Math.PI * 2);

          const oceanGrad = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, R * 0.05, cx, cy, R);
          oceanGrad.addColorStop(0, '#00b0ff');
          oceanGrad.addColorStop(0.25, '#0284c7');
          oceanGrad.addColorStop(0.65, '#0d47a1');
          oceanGrad.addColorStop(0.92, '#030f26');
          oceanGrad.addColorStop(1, '#38bdf8');
          ctx.fillStyle = oceanGrad;
          ctx.fill();

          ctx.strokeStyle = 'rgba(125, 211, 252, 0.75)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
          ctx.clip();

          // 4. Latitude / Longitude Holographic Grid Lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
          ctx.lineWidth = 1;

          for (let lng = -180; lng < 180; lng += 30) {
            ctx.beginPath();
            let first = true;
            for (let lat = -90; lat <= 90; lat += 5) {
              const pt = project3D(lat, lng);
              if (pt.z > 0) {
                if (first) {
                  ctx.moveTo(pt.screenX, pt.screenY);
                  first = false;
                } else {
                  ctx.lineTo(pt.screenX, pt.screenY);
                }
              } else {
                first = true;
              }
            }
            ctx.stroke();
          }

          for (let lat = -60; lat <= 60; lat += 30) {
            ctx.beginPath();
            let first = true;
            for (let lng = -180; lng <= 180; lng += 10) {
              const pt = project3D(lat, lng);
              if (pt.z > 0) {
                if (first) {
                  ctx.moveTo(pt.screenX, pt.screenY);
                  first = false;
                } else {
                  ctx.lineTo(pt.screenX, pt.screenY);
                }
              } else {
                first = true;
              }
            }
            ctx.stroke();
          }

          // Equator Line
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          let eqFirst = true;
          for (let lng = -180; lng <= 180; lng += 5) {
            const pt = project3D(0, lng);
            if (pt.z > 0) {
              if (eqFirst) {
                ctx.moveTo(pt.screenX, pt.screenY);
                eqFirst = false;
              } else {
                ctx.lineTo(pt.screenX, pt.screenY);
              }
            } else {
              eqFirst = true;
            }
          }
          ctx.stroke();

          // 5. Shallow Turquoise Coral Shelf Glow under Continents
          EARTH_LAND_POLYGONS.forEach((land) => {
            ctx.beginPath();
            let polyFirst = true;
            let visibleSegmentCount = 0;

            land.points.forEach(([lat, lng]) => {
              const pt = project3D(lat, lng);
              if (pt.z > -R * 0.15) {
                visibleSegmentCount++;
                if (polyFirst) {
                  ctx.moveTo(pt.screenX, pt.screenY);
                  polyFirst = false;
                } else {
                  ctx.lineTo(pt.screenX, pt.screenY);
                }
              } else {
                polyFirst = true;
              }
            });

            if (visibleSegmentCount > 2) {
              ctx.closePath();
              ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
              ctx.lineWidth = 4;
              ctx.stroke();
            }
          });

          // 6. Photorealistic Earth Landmasses with Biome Colors
          EARTH_LAND_POLYGONS.forEach((land) => {
            ctx.beginPath();
            let polyFirst = true;
            let visibleSegmentCount = 0;

            land.points.forEach(([lat, lng]) => {
              const pt = project3D(lat, lng);
              if (pt.z > -R * 0.15) {
                visibleSegmentCount++;
                if (polyFirst) {
                  ctx.moveTo(pt.screenX, pt.screenY);
                  polyFirst = false;
                } else {
                  ctx.lineTo(pt.screenX, pt.screenY);
                }
              } else {
                polyFirst = true;
              }
            });

            if (visibleSegmentCount > 2) {
              ctx.closePath();

              if (land.type === 'ICE') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
                ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
              } else if (land.type === 'DESERT') {
                ctx.fillStyle = 'rgba(230, 81, 0, 0.85)';
                ctx.strokeStyle = 'rgba(255, 224, 130, 0.9)';
              } else if (land.type === 'MOUNTAIN') {
                ctx.fillStyle = 'rgba(109, 76, 65, 0.9)';
                ctx.strokeStyle = 'rgba(215, 204, 200, 0.8)';
              } else {
                ctx.fillStyle = 'rgba(27, 94, 32, 0.9)';
                ctx.strokeStyle = 'rgba(129, 199, 132, 0.9)';
              }

              ctx.lineWidth = 1.2;
              ctx.fill();
              ctx.stroke();
            }
          });

          // 7. Night-side City Lights
          CITY_LIGHTS.forEach(([lat, lng]) => {
            const pt = project3D(lat, lng);
            if (pt.z > 5) {
              ctx.beginPath();
              ctx.arc(pt.screenX, pt.screenY, 1.8, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 215, 0, 0.95)';
              ctx.fill();

              ctx.beginPath();
              ctx.arc(pt.screenX, pt.screenY, 3.5, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255, 179, 0, 0.4)';
              ctx.fill();
            }
          });

          // 8. Dynamic Cloud Swirls
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          const cloudLngOffset = cloudOffsetRef.current;
          
          [
            { lat: 25, lng: -40 + cloudLngOffset, r: 28 },
            { lat: -15, lng: -80 + cloudLngOffset, r: 35 },
            { lat: 45, lng: 20 + cloudLngOffset, r: 30 },
            { lat: 10, lng: 70 + cloudLngOffset, r: 40 },
            { lat: -25, lng: 130 + cloudLngOffset, r: 32 },
            { lat: 55, lng: -140 + cloudLngOffset, r: 26 },
          ].forEach((cloud) => {
            const pt = project3D(cloud.lat, cloud.lng, R * 1.01);
            if (pt.z > 0) {
              ctx.beginPath();
              ctx.arc(pt.screenX, pt.screenY, cloud.r * (pt.z / R), 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // 9. Day / Night Sunlight Shading
          const sunShadeGrad = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.4, 0, cx, cy, R);
          sunShadeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
          sunShadeGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
          sunShadeGrad.addColorStop(1, 'rgba(2, 6, 23, 0.65)');
          ctx.fillStyle = sunShadeGrad;
          ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

          ctx.restore(); // Restore Earth clip

          // 10. Update Pin Coordinates
          const coordsMap: Record<string, { x: number; y: number; isVisible: boolean }> = {};
          regionPins.forEach((pin) => {
            const pt = project3D(pin.lat, pin.lng);
            coordsMap[pin.tz] = {
              x: pt.screenX,
              y: pt.screenY,
              isVisible: pt.z > 15,
            };

            if (pt.z > 0) {
              const isSelected = selectedTimezone === pin.tz;

              ctx.beginPath();
              ctx.arc(pt.screenX, pt.screenY, isSelected ? 7 : 4.5, 0, Math.PI * 2);
              ctx.fillStyle = isSelected ? '#f59e0b' : '#38bdf8';
              ctx.fill();

              ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
              ctx.lineWidth = isSelected ? 2 : 1;
              ctx.stroke();

              if (isSelected) {
                ctx.beginPath();
                ctx.arc(pt.screenX, pt.screenY, 15, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
                ctx.lineWidth = 2.5;
                ctx.stroke();
              }
            }
          });

          setPinScreenCoords(coordsMap);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [selectedTimezone, regionPins]);

  const selectedPin = regionPins.find((p) => p.tz === selectedTimezone) || regionPins[16];

  const handleToggleAutoRotate = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsAutoRotate((prev) => {
      const next = !prev;
      isAutoRotateRef.current = next;
      return next;
    });
  };

  const handleSwitchSatelliteClick = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSwitchToSatellite();
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      className="relative w-full h-[380px] sm:h-[500px] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 select-none group touch-none cursor-grab active:cursor-grabbing"
    >
      {/* Dynamic Responsive 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* TOP OVERLAY TOOLBAR: Non-overlapping Flex Bar */}
      <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-20 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left Side: Concise 3D Earth Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl shadow-xl text-white shrink min-w-0 pointer-events-none">
          <span className="p-1 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md shrink-0">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[11px] sm:text-xs font-black text-amber-400 tracking-wide truncate">
              3D Earth Globe
            </h3>
            <p className="text-[9px] sm:text-[10px] text-slate-300 font-medium truncate hidden xs:block">
              Drag to spin • Tap pin
            </p>
          </div>
        </div>

        {/* Right Side: Fully Functional Isolated Control Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={handleToggleAutoRotate}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-xl active:scale-95 cursor-pointer ${
              isAutoRotate
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/20 hover:bg-amber-400'
                : 'bg-slate-900/90 text-slate-100 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {isAutoRotate ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current text-slate-950" /> Orbiting
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-amber-400" /> Spin
              </>
            )}
          </button>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={handleSwitchSatelliteClick}
            className="px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400 transition-all flex items-center gap-1.5 shadow-xl active:scale-95 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" /> Satellite
          </button>
        </div>
      </div>

      {/* Mobile-Responsive HTML Pin Cards */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {regionPins.map((pin) => {
          const coord = pinScreenCoords[pin.tz];
          if (!coord || !coord.isVisible) return null;

          const isSelected = selectedTimezone === pin.tz;

          return (
            <button
              key={pin.tz}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(pin.tz);
              }}
              style={{
                left: `${coord.x}px`,
                top: `${coord.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className={`absolute pointer-events-auto transition-all duration-300 flex flex-col items-center group/pin ${
                isSelected ? 'z-30 scale-110' : 'z-10 hover:scale-105'
              }`}
            >
              {/* Flag & Region Name Card */}
              <div
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-[10px] sm:text-xs font-black shadow-xl flex items-center gap-1 sm:gap-1.5 transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 via-coral-500 to-indigo-600 text-white border-amber-300 ring-4 ring-amber-500/30'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/90'
                }`}
              >
                <span className="text-xs sm:text-sm">{pin.flag}</span>
                <span className="truncate max-w-[80px] sm:max-w-[110px]">{pin.name.split('/')[0]}</span>
                {isSelected && <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 animate-bounce" />}
              </div>

              {/* Pin Pointer Stem */}
              <div
                className={`w-0.5 sm:w-1 h-2 sm:h-3 rounded-full transition-colors ${
                  isSelected ? 'bg-amber-400 shadow-lg shadow-amber-400' : 'bg-sky-400'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Floating Info Box at Bottom Left */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs p-2.5 sm:p-3.5 rounded-2xl shadow-xl space-y-0.5 pointer-events-none max-w-[220px] sm:max-w-[300px]">
        <div className="flex items-center gap-1.5 font-black text-amber-400 text-[11px] sm:text-xs">
          <Navigation className="w-3.5 h-3.5 text-coral-500 animate-bounce shrink-0" />
          <span className="truncate">{selectedPin ? `${selectedPin.flag} ${selectedPin.name}` : 'Select Region'}</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate">
          Region: <strong className="text-white">{selectedPin?.region}</strong>
        </p>
        <p className="text-[10px] sm:text-[11px] text-coral-400 font-mono font-bold truncate">
          Timezone: {selectedTimezone}
        </p>
      </div>

      {/* Spin Tutorial Badge */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 pointer-events-none bg-slate-900/80 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-800 text-[9px] sm:text-[10px] text-slate-300 font-extrabold flex items-center gap-1">
        <RefreshCw className="w-3 h-3 text-amber-400" /> Spin Earth
      </div>
    </div>
  );
};

export const TimezoneSelectorStep: React.FC<Props> = ({
  selectedTimezone,
  onSelect,
  onNext,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedTz, setDetectedTz] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [activeTab, setActiveTab] = useState<'3D_GLOBE' | 'MAP' | 'LIST'>('3D_GLOBE');
  const [mapType, setMapType] = useState<'TERRAIN' | 'SATELLITE'>('TERRAIN');
  const step3HeaderRef = useRef<HTMLDivElement>(null);

  const { data: timezones = [], isLoading } = useQuery({
    queryKey: ['timezones'],
    queryFn: api.getTimezones,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    if (step3HeaderRef.current) {
      step3HeaderRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, []);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setDetectedTz(detected);
      }
    } catch (e) {
      setDetectedTz('America/New_York');
    }
  }, []);

  const handleSelect = (tz: string) => {
    onSelect(tz);
    setShowError(false);
  };

  const handleNextClick = () => {
    if (!selectedTimezone) {
      setShowError(true);
      return;
    }
    onNext();
  };

  const selectedPin = REGION_PINS.find((p) => p.tz === selectedTimezone) || REGION_PINS[16];

  const mapEmbedUrl = selectedTimezone
    ? `https://maps.google.com/maps?q=${encodeURIComponent(
        selectedTimezone.split('/')[1] || selectedTimezone
      )}&z=${mapType === 'SATELLITE' ? 5 : 4}&t=${mapType === 'SATELLITE' ? 'k' : 'm'}&output=embed`
    : `https://maps.google.com/maps?q=20,0&z=2&t=${mapType === 'SATELLITE' ? 'k' : 'm'}&output=embed`;

  const filteredTimezones = timezones.filter((tz) => {
    const q = searchQuery.toLowerCase();
    return (
      tz.identifier.toLowerCase().includes(q) ||
      tz.name.toLowerCase().includes(q) ||
      tz.formattedOffset.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={step3HeaderRef} className="space-y-6 scroll-mt-6 border-2 border-slate-300 rounded-3xl p-4 sm:p-8 bg-white shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-300 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-coral-50 text-coral-600 border border-coral-200">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">Step 3: Select Your Region & Timezone</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Explore 24 global regions using our 3D Earth Globe, Satellite Map, or Search List.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-200/90 rounded-2xl border border-slate-300 shrink-0 self-start sm:self-center overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('3D_GLOBE')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === '3D_GLOBE'
                ? 'bg-gradient-to-r from-coral-500 to-amber-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 font-bold'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-white" /> 3D Earth Globe
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MAP')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'MAP'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 font-bold'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-amber-400" /> Google Map View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LIST')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'LIST'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 font-bold'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-coral-400" /> Timezone List
          </button>
        </div>
      </div>

      {/* Browser Location Banner */}
      {detectedTz && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-indigo-600 shrink-0 animate-spin" />
            <span className="text-xs text-slate-700 font-medium">
              Detected Browser Location:{' '}
              <strong className="text-indigo-700 font-extrabold">{detectedTz}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSelect(detectedTz)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 ${
              selectedTimezone === detectedTz
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-indigo-100 border-indigo-300 text-indigo-700'
            }`}
          >
            {selectedTimezone === detectedTz ? '✓ Selected' : 'Use Detected Timezone'}
          </button>
        </div>
      )}

      {/* 24 REGIONS FAST SELECT SCROLLBAR */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-coral-500" /> 24 Global Region Pins (Click to Focus):
          </span>
          <span className="text-[10px] text-coral-600 font-bold">24 Regions Loaded</span>
        </label>

        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {REGION_PINS.map((pin) => {
            const isSelected = selectedTimezone === pin.tz;
            return (
              <button
                key={pin.tz}
                type="button"
                onClick={() => handleSelect(pin.tz)}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-coral-500 via-amber-500 to-indigo-600 text-white border-coral-400 font-black shadow-md ring-2 ring-coral-500/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 font-bold'
                }`}
              >
                <span className="text-sm">{pin.flag}</span>
                <span>{pin.name}</span>
                {isSelected && <Sparkles className="w-3 h-3 text-amber-300 animate-bounce" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODE 1: PHOTOREALISTIC 3D EARTH GLOBE VISUALIZATION */}
      {activeTab === '3D_GLOBE' && (
        <Interactive3DEarthGlobe
          selectedTimezone={selectedTimezone}
          regionPins={REGION_PINS}
          onSelect={handleSelect}
          onSwitchToSatellite={() => setActiveTab('MAP')}
        />
      )}

      {/* MODE 2: GOOGLE MAP & SATELLITE TERRAIN VIEW */}
      {activeTab === 'MAP' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-coral-500" /> Map Type & Terrain View:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMapType('TERRAIN')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  mapType === 'TERRAIN'
                    ? 'bg-slate-900 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                🗺️ Vector Map
              </button>
              <button
                type="button"
                onClick={() => setMapType('SATELLITE')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                  mapType === 'SATELLITE'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                🛰️ 3D Satellite View
              </button>
            </div>
          </div>

          <div className="relative w-full h-[340px] sm:h-[420px] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 group">
            <iframe
              title="Google Map Regional Selector"
              src={mapEmbedUrl}
              className="w-full h-full border-0 filter contrast-105 opacity-95"
              allowFullScreen
              loading="lazy"
            />

            <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white text-xs p-3.5 rounded-2xl shadow-xl space-y-1 pointer-events-none max-w-[280px]">
              <div className="flex items-center gap-1.5 font-black text-amber-400 text-xs">
                <MapPin className="w-4 h-4 text-coral-500 shrink-0 animate-bounce" />
                <span className="truncate">{selectedPin ? `${selectedPin.flag} ${selectedPin.name}` : selectedTimezone}</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {selectedPin ? `${selectedPin.region} • (${selectedPin.lat}, ${selectedPin.lng})` : 'Google Map active'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: TIMEZONE LIST VIEW */}
      {activeTab === 'LIST' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any timezone (e.g. Asia/Kolkata, London, New York, Tokyo)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 shadow-xs transition-all"
            />
          </div>

          {isLoading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredTimezones.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold">No timezone matched "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-extrabold text-coral-600 hover:underline"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {filteredTimezones.map((tz) => {
                const isSelected = selectedTimezone === tz.identifier;
                return (
                  <button
                    key={tz.identifier}
                    type="button"
                    onClick={() => handleSelect(tz.identifier)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between active:scale-[0.99] ${
                      isSelected
                        ? 'bg-coral-50/90 border-coral-500 ring-2 ring-coral-500/30 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{tz.identifier}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 font-mono font-bold">
                          {tz.formattedOffset}
                        </span>
                      </div>
                      <p className="text-[10px] text-coral-600 mt-1 font-bold flex items-center gap-2">
                        <span>Now: {tz.currentTimeDisplay}</span>
                        {tz.dstStatus && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
                            {tz.dstStatus}
                          </span>
                        )}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                        isSelected ? 'bg-coral-500 border-coral-500 text-white shadow-xs' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Timezone Summary Banner */}
      {selectedTimezone && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-coral-500/50 text-white flex items-center justify-between gap-3 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-coral-500 text-white shadow-md">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">Selected Timezone</span>
              <h4 className="text-sm font-black text-white">
                {selectedPin ? `${selectedPin.flag} ${selectedPin.name}` : selectedTimezone}
              </h4>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black">
            ✓ Confirmed Region
          </span>
        </div>
      )}

      {showError && !selectedTimezone && (
        <p className="text-xs font-extrabold text-rose-600 flex items-center gap-1 animate-bounce">
          <AlertCircle className="w-4 h-4" /> Please select a region or timezone above to continue.
        </p>
      )}

      {/* Footer Nav */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quiz
        </button>

        <button
          type="button"
          disabled={!selectedTimezone}
          onClick={handleNextClick}
          className="px-6 py-2.5 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-coral-500/20 transition-all flex items-center gap-2 active:scale-95 font-black"
        >
          Continue to Date <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
