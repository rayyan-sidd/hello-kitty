/**
 * TerraVue Command — Orbital Operations Grid
 * Home dashboard: asymmetric mission-control workspace, satellite visual layer, and thermal incident telemetry.
 */
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Flame,
  Gauge,
  Globe2,
  LayoutDashboard,
  MapPin,
  Menu,
  Maximize2,
  Radio,
  RefreshCw,
  Satellite,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TimerReset,
  Waypoints,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import MapView from "@/components/map/MapView";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";

const assets = {
  mark: "/manus-storage/terravue-mark_61ac7d4b.png",
  india: "/manus-storage/terravue-india-thermal_d5953d46.png",
  orbit: "/manus-storage/terravue-orbit_034c80c7.png",
  industrial: "/manus-storage/terravue-industrial_b2def7fc.png",
};

type Site = {
  id: string;
  location: string;
  district: string;
  type: "Industrial" | "Wildfire" | "Agricultural" | "Mining";
  confidence: number;
  delta: string;
  time: string;
  severity: "High" | "Watch" | "Review";
};

const sites: Site[] = [
  {
    id: "IN-23-044",
    location: "Korba Thermal Complex",
    district: "Chhattisgarh · 22.36° N, 82.68° E",
    type: "Industrial",
    confidence: 96,
    delta: "+18.4°C",
    time: "05:38 UTC",
    severity: "High",
  },
  {
    id: "IN-08-117",
    location: "Sawai Madhopur buffer",
    district: "Rajasthan · 26.01° N, 76.46° E",
    type: "Wildfire",
    confidence: 88,
    delta: "+11.2°C",
    time: "05:31 UTC",
    severity: "Watch",
  },
  {
    id: "IN-16-091",
    location: "Bargarh crop belt",
    district: "Odisha · 21.33° N, 83.62° E",
    type: "Agricultural",
    confidence: 82,
    delta: "+8.7°C",
    time: "05:25 UTC",
    severity: "Review",
  },
  {
    id: "IN-05-206",
    location: "Singrauli overburden",
    district: "Madhya Pradesh · 24.20° N, 82.67° E",
    type: "Mining",
    confidence: 79,
    delta: "+6.5°C",
    time: "05:18 UTC",
    severity: "Review",
  },
];

type ObservationSnapshot = {
  dateISO: string;
  dateLabel: string;
  shortDate: string;
  pass: string;
  signals: number;
  coverage: string;
  resolution: string;
  lastObserved: string;
  selectedConfidence: number;
  focusSiteId: string;
  note: string;
  hotspots: Array<{
    siteId: string;
    left: string;
    top: string;
    isCritical?: boolean;
    delay: string;
  }>;
};

const observationSnapshots: ObservationSnapshot[] = [
  {
    dateISO: "2026-08-21",
    dateLabel: "21 AUG 2026",
    shortDate: "21 AUG",
    pass: "1134",
    signals: 14,
    coverage: "73%",
    resolution: "1 KM",
    lastObserved: "05:16 UTC",
    selectedConfidence: 81,
    focusSiteId: "IN-16-091",
    note: "Low-density thermal activity across the western crop belt.",
    hotspots: [
      { siteId: "IN-16-091", left: "51%", top: "64%", delay: "-0.25s" },
      { siteId: "IN-05-206", left: "22%", top: "58%", delay: "-1.8s" },
    ],
  },
  {
    dateISO: "2026-08-22",
    dateLabel: "22 AUG 2026",
    shortDate: "22 AUG",
    pass: "1135",
    signals: 16,
    coverage: "76%",
    resolution: "1 KM",
    lastObserved: "05:19 UTC",
    selectedConfidence: 84,
    focusSiteId: "IN-05-206",
    note: "Mining-related persistence detected near the Singrauli basin.",
    hotspots: [
      { siteId: "IN-05-206", left: "23%", top: "57%", delay: "-1.8s" },
      { siteId: "IN-16-091", left: "52%", top: "64%", delay: "-0.25s" },
      { siteId: "IN-08-117", left: "71%", top: "55%", delay: "-1.4s" },
    ],
  },
  {
    dateISO: "2026-08-23",
    dateLabel: "23 AUG 2026",
    shortDate: "23 AUG",
    pass: "1136",
    signals: 18,
    coverage: "78%",
    resolution: "1 KM",
    lastObserved: "05:22 UTC",
    selectedConfidence: 87,
    focusSiteId: "IN-08-117",
    note: "Wildfire probability rises along the Rajasthan buffer zone.",
    hotspots: [
      {
        siteId: "IN-08-117",
        left: "70%",
        top: "54%",
        delay: "-1.4s",
        isCritical: true,
      },
      { siteId: "IN-16-091", left: "52%", top: "63%", delay: "-0.25s" },
      { siteId: "IN-05-206", left: "23%", top: "57%", delay: "-1.8s" },
    ],
  },
  {
    dateISO: "2026-08-24",
    dateLabel: "24 AUG 2026",
    shortDate: "24 AUG",
    pass: "1137",
    signals: 17,
    coverage: "80%",
    resolution: "1 KM",
    lastObserved: "05:24 UTC",
    selectedConfidence: 89,
    focusSiteId: "IN-08-117",
    note: "Repeat observation confirms a persistent non-urban heat signature.",
    hotspots: [
      {
        siteId: "IN-08-117",
        left: "70%",
        top: "54%",
        delay: "-1.4s",
        isCritical: true,
      },
      { siteId: "IN-16-091", left: "52%", top: "63%", delay: "-0.25s" },
      { siteId: "IN-05-206", left: "24%", top: "57%", delay: "-1.8s" },
    ],
  },
  {
    dateISO: "2026-08-25",
    dateLabel: "25 AUG 2026",
    shortDate: "25 AUG",
    pass: "1138",
    signals: 20,
    coverage: "82%",
    resolution: "750 M",
    lastObserved: "05:28 UTC",
    selectedConfidence: 91,
    focusSiteId: "IN-23-044",
    note: "New industrial corridor signal enters the high-confidence queue.",
    hotspots: [
      {
        siteId: "IN-23-044",
        left: "39%",
        top: "38%",
        delay: "-0.75s",
        isCritical: true,
      },
      { siteId: "IN-08-117", left: "70%", top: "54%", delay: "-1.4s" },
      { siteId: "IN-16-091", left: "52%", top: "63%", delay: "-0.25s" },
    ],
  },
  {
    dateISO: "2026-08-26",
    dateLabel: "26 AUG 2026",
    shortDate: "26 AUG",
    pass: "1139",
    signals: 21,
    coverage: "84%",
    resolution: "750 M",
    lastObserved: "05:31 UTC",
    selectedConfidence: 92,
    focusSiteId: "IN-23-044",
    note: "Industrial signature strengthens against the local land-cover baseline.",
    hotspots: [
      {
        siteId: "IN-23-044",
        left: "39%",
        top: "38%",
        delay: "-0.75s",
        isCritical: true,
      },
      { siteId: "IN-08-117", left: "70%", top: "54%", delay: "-1.4s" },
      { siteId: "IN-16-091", left: "52%", top: "63%", delay: "-0.25s" },
      { siteId: "IN-05-206", left: "24%", top: "57%", delay: "-1.8s" },
    ],
  },
  {
    dateISO: "2026-08-27",
    dateLabel: "27 AUG 2026",
    shortDate: "27 AUG",
    pass: "1140",
    signals: 22,
    coverage: "85%",
    resolution: "500 M",
    lastObserved: "05:34 UTC",
    selectedConfidence: 94,
    focusSiteId: "IN-23-044",
    note: "Cross-sensor agreement moves Korba into analyst review.",
    hotspots: [
      {
        siteId: "IN-23-044",
        left: "39%",
        top: "38%",
        delay: "-0.75s",
        isCritical: true,
      },
      { siteId: "IN-08-117", left: "70%", top: "54%", delay: "-1.4s" },
      { siteId: "IN-16-091", left: "52%", top: "63%", delay: "-0.25s" },
      { siteId: "IN-05-206", left: "24%", top: "57%", delay: "-1.8s" },
    ],
  },
  {
    dateISO: "2026-08-28",
    dateLabel: "28 AUG 2026",
    shortDate: "28 AUG",
    pass: "1141",
    signals: 23,
    coverage: "87%",
    resolution: "375 M",
    lastObserved: "05:36 UTC",
    selectedConfidence: 95,
    focusSiteId: "IN-23-044",
    note: "Thermal delta remains above the industrial activity threshold.",
    hotspots: [
      {
        siteId: "IN-23-044",
        left: "39%",
        top: "38%",
        delay: "-0.75s",
        isCritical: true,
      },
      { siteId: "IN-08-117", left: "70%", top: "54%", delay: "-1.4s" },
      { siteId: "IN-16-091", left: "52%", top: "63%", delay: "-0.25s" },
      { siteId: "IN-05-206", left: "24%", top: "57%", delay: "-1.8s" },
    ],
  },
  {
    dateISO: "2026-08-29",
    dateLabel: "29 AUG 2026",
    shortDate: "29 AUG",
    pass: "1142",
    signals: 24,
    coverage: "88%",
    resolution: "375 M",
    lastObserved: "05:38 UTC",
    selectedConfidence: 96,
    focusSiteId: "IN-23-044",
    note: "Latest pass: high-confidence industrial fire candidate at Korba.",
    hotspots: [
      {
        siteId: "IN-23-044",
        left: "39%",
        top: "38%",
        delay: "-0.75s",
        isCritical: true,
      },
      { siteId: "IN-08-117", left: "70%", top: "54%", delay: "-1.4s" },
      { siteId: "IN-16-091", left: "52%", top: "63%", delay: "-0.25s" },
      { siteId: "IN-05-206", left: "24%", top: "57%", delay: "-1.8s" },
    ],
  },
];

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Analytics", icon: Activity },
  { label: "Alerts", icon: Bell, count: "24" },
  { label: "Settings", icon: Settings2 },
];

const classificationCards = [
  {
    label: "Industrial fire",
    type: "Industrial Fire",
    value: "09",
    color: "#f97316",
    width: "82%",
  },
  {
    label: "Wildfire",
    type: "Wildfire",
    value: "06",
    color: "#dc2626",
    width: "70%",
  },
  {
    label: "Mining",
    type: "Mining",
    value: "04",
    color: "#78716c",
    width: "58%",
  },
  {
    label: "Agricultural burn",
    type: "Agricultural Burn",
    value: "07",
    color: "#facc15",
    width: "66%",
  },
  {
    label: "Gas flare",
    type: "Gas Flare",
    value: "02",
    color: "#3b82f6",
    width: "36%",
  },
  {
    label: "Persistent Industrial thermal source",
    type: "Persistent Industrial Thermal Source",
    value: "01",
    color: "#a855f7",
    width: "18%",
  },
];

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "amber" | "green" | "red" | "neutral";
}) {
  const styles = {
    amber: "border-[#ffd25a]/35 bg-[#ffd25a]/10 text-[#ffd25a]",
    green: "border-[#ffd25a]/30 bg-[#ffd25a]/10 text-[#ffd25a]",
    red: "border-[#ffaa5a]/35 bg-[#ffaa5a]/10 text-[#fffff0]",
    neutral: "border-white/10 bg-white/[0.035] text-[#e8dacb]",
  };
  return (
    <span
      className={`inline-flex items-center border px-2 py-1 tv-display text-[10px] font-bold uppercase tracking-[0.12em] ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="tv-section-heading px-4 sm:px-5">
      <div>
        <div className="tv-kicker mb-1">{eyebrow}</div>
        <div className="tv-display text-[15px] font-bold tracking-[0.08em] text-[#fffff0]">
          {title}
        </div>
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "normal",
  trend,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ElementType;
  tone?: "normal" | "amber";
  trend?: "up" | "down";
}) {
  return (
    <div className="tv-panel tv-corner-brackets tv-readout min-w-0 p-4">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="tv-kicker">{label}</span>
        <Icon
          className={
            tone === "amber"
              ? "h-4 w-4 text-[#ffd25a]"
              : "h-4 w-4 text-[#d8c8b9]"
          }
          strokeWidth={1.6}
        />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div
          className={`tv-metric-value ${tone === "amber" ? "is-amber" : ""}`}
        >
          {value}
        </div>
        {trend && (
          <div
            className={`mb-0.5 flex items-center gap-1 text-[10px] font-semibold ${trend === "up" ? "text-[#ffd25a]" : "text-[#fffff0]"}`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend === "up" ? "4.2%" : "1.8%"}
          </div>
        )}
      </div>
      <div className="mt-3 text-[11px] text-[#d8c8b9]">{note}</div>
      <div className="mt-3 flex items-center gap-2 tv-display text-[9px] font-bold uppercase tracking-[0.12em] text-[#c6ad9c]">
        <span className="h-1 w-1 bg-[#ffd25a]" />
        Live readout
      </div>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedSite, setSelectedSite] = useState(sites[0]);
  const [selectedDateISO, setSelectedDateISO] = useState("2026-08-27");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState("Thermal delta");
  const [mapMode, setMapMode] = useState("clusters");
  const [baseMap, setBaseMap] = useState<"satellite" | "dark">("satellite");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isLive, setIsLive] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [zoom, setZoom] = useState(4);
  const [search, setSearch] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const selectedSnapshot =
    observationSnapshots.find(
      observation => observation.dateISO === selectedDateISO
    ) ?? observationSnapshots[6];
  const currentObservation =
    selectedSnapshot.dateISO === selectedDateISO
      ? selectedSnapshot
      : {
          ...selectedSnapshot,
          dateISO: selectedDateISO,
          dateLabel: new Date(`${selectedDateISO}T00:00:00`)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            .toUpperCase(),
        };
  const selectedConfidence =
    selectedSite.id === currentObservation.focusSiteId
      ? currentObservation.selectedConfidence
      : selectedSite.confidence;
  const selectedCalendarDate = new Date(
    `${currentObservation.dateISO}T00:00:00`
  );
  const selectedProperties = (selectedFeature as any)?.properties;
  const selectedDisplay = {
    id: selectedProperties?.id ?? selectedSite.id,
    location: selectedProperties?.site ?? selectedSite.location,
    classification:
      selectedProperties?.classification ?? `${selectedSite.type} thermal`,
    confidence:
      selectedProperties?.confidence_score != null
        ? Math.round(Number(selectedProperties.confidence_score) * 100)
        : selectedConfidence,
    lastObserved:
      selectedProperties?.last_detected ?? currentObservation.lastObserved,
    delta:
      selectedProperties?.frp_per_day != null
        ? `${Number(selectedProperties.frp_per_day).toFixed(1)} FRP/day`
        : selectedSite.delta,
  };
  const { summary } = useDashboardSummary(
    currentObservation.dateISO,
    currentObservation.dateISO
  );
  const liveClassificationCards = classificationCards.map(item => {
    const live = summary?.by_type[item.type];
    const maxCount = summary
      ? Math.max(...Object.values(summary.by_type).map(entry => entry.count), 1)
      : 1;
    return live
      ? {
          ...item,
          value: String(live.count).padStart(2, "0"),
          width: `${Math.max(8, Math.round((live.count / maxCount) * 100))}%`,
        }
      : item;
  });

  const filteredSites = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sites;
    return sites.filter(site =>
      `${site.id} ${site.location} ${site.type} ${site.district}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const handleDateChange = (index: number) => {
    const snapshot = observationSnapshots[index];
    setSelectedDateISO(snapshot.dateISO);
    const focusSite = sites.find(site => site.id === snapshot.focusSiteId);
    if (focusSite) setSelectedSite(focusSite);
  };

  const handleCalendarSelect = (date?: Date) => {
    if (!date) return;
    const dateKey = toDateKey(date);
    if (dateKey < "2026-05-01" || dateKey > "2026-08-29") return;
    const index = observationSnapshots.findIndex(
      observation => observation.dateISO === dateKey
    );
    setSelectedDateISO(dateKey);
    if (index >= 0) {
      const focusSite = sites.find(
        site => site.id === observationSnapshots[index].focusSiteId
      );
      if (focusSite) setSelectedSite(focusSite);
    }
    setCalendarOpen(false);
  };

  const handleNav = (label: string) => {
    setActiveNav(label);
    if (label === "Analytics") {
      const date = currentObservation.dateISO;
      setLocation(`/analytics?start_date=${date}&end_date=${date}`);
      return;
    }
    if (label !== "Command")
      toast(`${label} module is staged for the next operations release.`);
  };

  const handleRefresh = () => {
    setRefreshCount(value => value + 1);
    toast.success("Telemetry synchronized", {
      description:
        "Latest satellite pass and classification queue are in view.",
    });
  };

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site);
    toast(`Signal ${site.id} selected`, {
      description: `${site.type} signature at ${site.location}.`,
    });
  };

  const handleScrollToQueue = () => {
    document
      .getElementById("incident-queue")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="tv-app min-h-screen">
      <main className="tv-main min-h-screen">
        <header className="sticky top-0 z-20 flex min-h-[82px] items-center justify-between gap-4 border-b border-[#ffd25a]/25 bg-[#3a1e16] px-4 py-4 sm:px-7 lg:px-9">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="tv-command-menu tv-focus-ring inline-flex shrink-0 items-center gap-2 border border-[#ffd25a]/35 bg-[#4a2417] px-3 py-2 text-left text-[#fffff0] transition hover:bg-[#ffaa5a]">
                <Menu className="h-4 w-4 text-[#ffd25a]" strokeWidth={1.7} />
                <span className="hidden tv-display text-[10px] font-bold uppercase tracking-[0.13em] sm:inline">
                  Operations
                </span>
                <span className="tv-display text-[10px] font-bold uppercase tracking-[0.13em] text-[#ffd25a]">
                  {activeNav}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-[#ffd25a]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="tv-command-menu-popover w-56 border-[#ffd25a]/30 bg-[#3a1e16] p-1 text-[#fffff0]"
            >
              <DropdownMenuLabel className="tv-kicker px-2 py-2">
                Operations
              </DropdownMenuLabel>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.label;
                return (
                  <DropdownMenuItem
                    key={item.label}
                    onSelect={() => handleNav(item.label)}
                    className={`tv-display flex cursor-pointer items-center gap-2 px-2 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] focus:bg-[#4a2417] focus:text-[#fffff0] ${isActive ? "bg-[#4a2417] text-[#ffd25a]" : "text-[#e8dacb]"}`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                    <span className="flex-1">{item.label}</span>
                    {item.count && (
                      <span className="border border-[#ffaa5a]/55 bg-[#ffaa5a]/20 px-1.5 py-0.5 text-[9px] text-[#fffff0]">
                        {item.count}
                      </span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2 tv-kicker">
              <span className="h-1.5 w-1.5 bg-[#ffd25a]" />
              <span>
                India sector / orbital pass {currentObservation.dateLabel}
              </span>
            </div>
            <h1 className="tv-display tv-hero-title text-[22px] font-bold uppercase leading-none tracking-[0.08em] text-[#fffff0] sm:text-[25px]">
              <span className="tv-heading-gradient">FireSight</span> AI
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 border border-[#ffd25a]/25 bg-[#ffd25a]/[0.07] px-3 py-2 sm:flex">
              <span className="tv-status-dot" />
              <span className="tv-display text-[10px] font-bold tracking-[0.13em] text-[#ffd25a]">
                SATELLITE LINK ACTIVE
              </span>
            </div>
          </div>
        </header>

        <div className="container py-5 sm:py-6 lg:py-8">
          <section className="mb-5 flex flex-col justify-between gap-4 border-y border-white/[0.08] py-3.5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="tv-live-pill">
                <span
                  className={`tv-status-dot ${!isLive ? "!bg-[#9d7765] !shadow-none" : ""}`}
                />
                {isLive ? "Live monitoring" : "Feed paused"}
              </div>
              <div className="hidden h-4 w-px bg-white/10 sm:block" />
              <div className="flex items-center gap-2 text-[11px] text-[#d8c8b9]">
                <Clock3 className="h-3.5 w-3.5 text-[#ffd25a]" /> Last sync{" "}
                {currentObservation.lastObserved} · pass{" "}
                {currentObservation.pass}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="tv-focus-ring inline-flex items-center gap-2 border border-white/[0.12] bg-white/[0.025] px-3 py-2 tv-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#e8dacb] transition hover:border-[#ffd25a]/50 hover:text-[#ffd25a]"
                onClick={handleRefresh}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${refreshCount ? "rotate-180" : ""} transition-transform duration-300`}
                />
                Sync telemetry
              </button>
              <button
                className="tv-focus-ring inline-flex items-center gap-2 border border-white/[0.12] bg-white/[0.025] px-3 py-2 tv-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#e8dacb] transition hover:border-[#ffd25a]/50 hover:text-[#ffd25a]"
                onClick={() => setIsLive(value => !value)}
              >
                <Radio className="h-3.5 w-3.5" />{" "}
                {isLive ? "Pause feed" : "Resume feed"}
              </button>
            </div>
          </section>

          <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.85fr)]">
            <div className="flex min-h-0 flex-col gap-4">
              <section
                className="tv-panel tv-calendar tv-corner-brackets tv-entrance"
                aria-label="Satellite observation date selector"
              >
                <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="tv-calendar-chip grid h-9 w-9 shrink-0 place-items-center border border-[#ffd25a]/35 bg-[#ffd25a]/[0.08] text-[#ffd25a]">
                      <CalendarDays className="h-4 w-4" strokeWidth={1.7} />
                    </div>
                    <div className="min-w-0">
                      <div className="tv-kicker mb-1">
                        Observation date / archive window
                      </div>
                      <div className="tv-display truncate text-[16px] font-bold tracking-[0.09em] text-[#fffff0]">
                        {currentObservation.dateLabel}
                      </div>
                    </div>
                  </div>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <button className="tv-calendar-trigger tv-focus-ring inline-flex shrink-0 items-center gap-2 border border-[#ffd25a]/35 bg-[#ffd25a]/[0.07] px-3 py-2 tv-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#ffd25a] transition hover:bg-[#ffd25a]/[0.14]">
                        <span className="hidden sm:inline">Change date</span>
                        <CalendarDays className="h-3.5 w-3.5 sm:hidden" />
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={10}
                      className="tv-calendar-popover w-auto border-white/[0.14] bg-[#3a1e16] p-2 text-[#fffff0] shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-8 border-b border-white/[0.1] px-2 pb-2 pt-1">
                        <div>
                          <div className="tv-kicker">
                            Available observations
                          </div>
                          <div className="mt-1 tv-display text-[13px] font-bold tracking-[0.08em] text-[#ffd25a]">
                            01 MAY–29 AUG 2026
                          </div>
                        </div>
                        <span className="tv-display text-[10px] font-bold tracking-[0.12em] text-[#c6ad9c]">
                          UTC
                        </span>
                      </div>
                      <Calendar
                        mode="single"
                        selected={selectedCalendarDate}
                        onSelect={handleCalendarSelect}
                        disabled={date =>
                          toDateKey(date) < "2026-05-01" ||
                          toDateKey(date) > "2026-08-29"
                        }
                        initialFocus
                        className="tv-calendar-widget"
                      />
                      <div className="flex items-center justify-between border-t border-white/[0.1] px-2 pb-1 pt-2 text-[10px] text-[#d8c8b9]">
                        <span>Pass {currentObservation.pass}</span>
                        <span>{currentObservation.signals} observations</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/[0.08] px-4 py-2.5 sm:px-5">
                  <div className="flex items-center gap-2 text-[10px] text-[#d8c8b9]">
                    <Radio className="h-3.5 w-3.5 text-[#ffd25a]" /> Showing
                    satellite observations for {currentObservation.dateLabel}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#d8c8b9]">
                    <span className="h-1.5 w-1.5 bg-[#ffd25a]" />{" "}
                    {currentObservation.resolution} resolution{" "}
                    <span className="text-white/20">/</span>{" "}
                    {currentObservation.lastObserved}
                  </div>
                </div>
              </section>

              <section
                className="tv-map-shell tv-corner-brackets tv-entrance tv-entrance-delay-1"
                aria-label="Thermal anomaly map"
              >
                <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4 sm:p-5">
                  <div>
                    <div className="tv-kicker text-[#e8dacb]">
                      Primary intelligence layer
                    </div>
                    <div className="mt-1 flex items-center gap-2 tv-display text-[16px] font-bold tracking-[0.08em] text-[#fffff0]">
                      INDIA / THERMAL DELTA{" "}
                      <span className="text-[#c6ad9c]">·</span>{" "}
                      <span className="text-[#ffd25a]">
                        {activeLayer.toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-1 tv-display text-[10px] font-semibold tracking-[0.1em] text-[#d8c8b9]">
                      OBSERVATION FRAME {currentObservation.dateLabel} · PASS{" "}
                      {currentObservation.pass}
                    </div>
                  </div>
                  <div className="hidden items-center gap-2 text-right sm:block">
                    <div className="tv-kicker">Spatial resolution</div>
                    <div className="mt-1 tv-display text-[12px] font-bold tracking-[0.1em] text-[#e8dacb]">
                      {currentObservation.resolution} · MODIS / VIIRS
                    </div>
                  </div>
                </div>

                <MapView
                  startDate={currentObservation.dateISO}
                  endDate={currentObservation.dateISO}
                  mapMode={mapMode}
                  basemap={baseMap}
                  onSelect={setSelectedFeature}
                />
                <div className="tv-scanline" />

                <div className="absolute bottom-4 left-4 z-10 max-w-[230px] border border-[#ffd25a]/30 bg-[#291711]/85 p-3  sm:bottom-5 sm:left-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-2 w-2 bg-[#ffaa5a] " />
                    <span className="tv-display text-[11px] font-bold tracking-[0.12em] text-[#e8dacb]">
                      SELECTED SIGNAL
                    </span>
                  </div>
                  <div className="tv-display text-sm font-bold tracking-[0.08em] text-[#fffff0]">
                    {selectedDisplay.id} ·{" "}
                    {String(selectedDisplay.classification).toUpperCase()}
                  </div>
                  <div className="mt-1 text-[10px] leading-relaxed text-[#d8c8b9]">
                    {selectedDisplay.location} · confidence{" "}
                    {selectedDisplay.confidence}% ·{" "}
                    {currentObservation.dateLabel}
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 z-10 flex items-end gap-2 sm:bottom-5 sm:right-5">
                  <div className="flex flex-col gap-1">
                    <button
                      className="tv-control tv-focus-ring"
                      onClick={() => setZoom(value => Math.min(value + 1, 8))}
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      className="tv-control tv-focus-ring"
                      onClick={() => setZoom(value => Math.max(value - 1, 1))}
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    className="tv-control tv-focus-ring"
                    onClick={() =>
                      toast("Map expands in the full-screen analyst view.")
                    }
                    aria-label="Expand map"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <div className="border border-white/[0.13] bg-[#291711]/85 px-2.5 py-2 tv-display text-[10px] font-bold tracking-[0.12em] text-[#e8dacb] ">
                    Z {String(zoom).padStart(2, "0")}
                  </div>
                </div>

                <div className="absolute right-5 top-[92px] z-10 flex items-center gap-2">
                  <div className="flex border border-[#ffd25a]/45 bg-[#291711]/90 p-1">
                    <button
                      className={`tv-layer-chip px-3 py-1.5 ${baseMap === "satellite" ? "is-active" : ""}`}
                      onClick={() => setBaseMap("satellite")}
                    >
                      ● SATELLITE
                    </button>
                    <button
                      className={`tv-layer-chip px-3 py-1.5 ${baseMap === "dark" ? "is-active" : ""}`}
                      onClick={() => setBaseMap("dark")}
                    >
                      ○ DARK OPS
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-1.5 border border-white/[0.11] bg-[#3a1e16] p-1.5 md:flex">
                  {[
                    ["clusters", "Clusters"],
                    ["heatmap", "Heatmap"],
                    ["pins", "Pins"],
                  ].map(([mode, label]) => (
                    <button
                      key={mode}
                      className={`tv-layer-chip px-2.5 py-1.5 ${mapMode === mode ? "is-active" : ""}`}
                      onClick={() => setMapMode(mode)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex min-h-0 flex-col gap-5">
              <section className="tv-panel tv-corner-brackets tv-entrance tv-entrance-delay-1 p-0">
                <SectionTitle
                  eyebrow="AI classifier / current queue"
                  title="Signal classification"
                  action={
                    <button
                      className="tv-focus-ring text-[#6f8796] transition hover:text-[#ffd25a]"
                      onClick={() =>
                        toast(
                          "Classifier thresholds are managed by the model governance team."
                        )
                      }
                      aria-label="Open classifier settings"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </button>
                  }
                />
                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                  {liveClassificationCards.map(item => (
                    <div
                      key={item.label}
                      className="border border-white/[0.09] bg-[#291711]/45 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <span
                            className="mt-1 h-2 w-2 shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[11px] font-semibold leading-tight text-[#e8dacb]">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className="tv-display text-[19px] font-bold"
                          style={{ color: item.color }}
                        >
                          {item.value}
                        </span>
                      </div>
                      <div className="mt-3 h-1 bg-white/[0.09]">
                        <div
                          className="h-1"
                          style={{
                            width: item.width,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/[0.08] px-4 py-3 sm:px-5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#d8c8b9]">
                      Classifier confidence / rolling mean
                    </span>
                    <span className="tv-display font-bold text-[#ffd25a]">
                      91.6%
                    </span>
                  </div>
                  <div className="mt-2 h-1 bg-white/[0.07]">
                    <div className="h-1 w-[91.6%] bg-[#ffd25a] " />
                  </div>
                </div>
              </section>

              <section className="tv-panel tv-entrance tv-entrance-delay-2 overflow-hidden p-0">
                <SectionTitle
                  eyebrow="Analyst focus / active review"
                  title="Selected signal"
                  action={
                    <StatusBadge
                      tone={selectedSite.severity === "High" ? "red" : "amber"}
                    >
                      {selectedSite.severity}
                    </StatusBadge>
                  }
                />
                <div
                  className="tv-thumb-asset"
                  style={{ backgroundImage: `url(${assets.industrial})` }}
                >
                  <div className="absolute bottom-3 left-4 z-10">
                    <div className="tv-kicker text-[#e8dacb]">
                      {selectedDisplay.id}
                    </div>
                    <div className="mt-1 tv-display text-[18px] font-bold tracking-[0.07em] text-[#fffff0]">
                      {selectedDisplay.location}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 px-4 py-4 sm:px-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="tv-kicker mb-1.5">Class</div>
                      <div className="text-[12px] font-semibold text-[#fffff0]">
                        {selectedDisplay.classification}
                      </div>
                    </div>
                    <div>
                      <div className="tv-kicker mb-1.5">Confidence</div>
                      <div className="text-[12px] font-semibold text-[#ffd25a]">
                        {selectedDisplay.confidence}% / high
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="tv-kicker mb-1.5">Thermal delta</div>
                      <div className="text-[12px] font-semibold text-[#fffff0]">
                        {selectedDisplay.delta}
                      </div>
                    </div>
                    <div>
                      <div className="tv-kicker mb-1.5">Last observed</div>
                      <div className="text-[12px] font-semibold text-[#fffff0]">
                        {selectedDisplay.lastObserved}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      className="h-9 flex-1 rounded-none bg-[#ffd25a] px-3 tv-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#291711]  transition hover:bg-[#ffd25a]"
                      onClick={() =>
                        toast.success(
                          `Review opened for ${selectedDisplay.id}`,
                          {
                            description:
                              "Analyst annotation workspace is ready.",
                          }
                        )
                      }
                    >
                      Review signal{" "}
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                    <button
                      className="tv-control tv-focus-ring"
                      onClick={() =>
                        toast(
                          "Signal metadata copied to the secure operator clipboard."
                        )
                      }
                      aria-label="Copy signal metadata"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </section>

              <section className="tv-panel tv-entrance tv-entrance-delay-3 relative overflow-hidden p-0">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
                  style={{ backgroundImage: `url(${assets.orbit})` }}
                />
                <div className="relative z-10 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="tv-kicker">Sensor provenance</div>
                      <div className="mt-1 tv-display text-[15px] font-bold tracking-[0.08em] text-[#fffff0]">
                        Multi-source fusion
                      </div>
                    </div>
                    <Satellite
                      className="h-5 w-5 text-[#ffd25a]"
                      strokeWidth={1.4}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["VIIRS", "375 m", "SYNC"],
                      ["MODIS", "1 km", "SYNC"],
                      ["INSAT-3D", "4 km", "LATENT"],
                    ].map(([name, resolution, state]) => (
                      <div
                        key={name}
                        className="border border-white/[0.1] bg-[#291711]/55 p-2.5"
                      >
                        <div className="tv-display text-[11px] font-bold tracking-[0.08em] text-[#e8dacb]">
                          {name}
                        </div>
                        <div className="mt-1 text-[10px] text-[#d8c8b9]">
                          {resolution}
                        </div>
                        <div
                          className={`mt-2 text-[9px] font-bold tracking-[0.1em] ${state === "SYNC" ? "text-[#ffd25a]" : "text-[#ffd25a]"}`}
                        >
                          • {state}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-4">
            <MetricCard
              label="Active signals"
              value={String(summary?.total ?? currentObservation.signals)}
              note={
                summary
                  ? "Live records returned by the backend"
                  : `Across ${currentObservation.coverage} of monitored regions`
              }
              icon={Flame}
              tone="amber"
              trend="up"
            />
            <MetricCard
              label="High confidence"
              value={String(
                summary?.high_confidence ??
                  Math.max(4, Math.round(currentObservation.signals * 0.29))
              ).padStart(2, "0")}
              note="Backend records with confidence ≥ 90%"
              icon={ShieldCheck}
              tone="normal"
              trend="down"
            />
            <MetricCard
              label="Avg. response"
              value="08m 42s"
              note={`Detection → analyst review · ${currentObservation.lastObserved}`}
              icon={TimerReset}
              tone="normal"
              trend="up"
            />
            <MetricCard
              label="Model precision"
              value="94.8%"
              note="Rolling 30-day validation"
              icon={Gauge}
              tone="normal"
              trend="up"
            />
          </section>

          <section
            id="incident-queue"
            className="tv-panel tv-corner-brackets tv-entrance tv-entrance-delay-4 overflow-hidden p-0"
          >
            <SectionTitle
              eyebrow={`Operational feed / ${currentObservation.signals} observed`}
              title="Incident queue"
              action={
                <div className="flex items-center gap-2">
                  <button
                    className="tv-control tv-focus-ring hidden sm:grid"
                    onClick={() =>
                      toast(
                        "Queue filters are applied in the analyst workspace."
                      )
                    }
                    aria-label="Filter incident queue"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                  <button
                    className="tv-control tv-focus-ring"
                    onClick={() =>
                      toast("CSV export is staged for the next release.")
                    }
                    aria-label="Export incident queue"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              }
            />
            <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="relative min-w-0 flex-1 sm:max-w-[360px]">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#c6ad9c]" />
                <input
                  type="text"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search ID, region, or class"
                  className="h-9 w-full pl-9 pr-8 text-[11px] placeholder:text-[#9d7765]"
                  aria-label="Search incident queue"
                />
                {search && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#d8c8b9] hover:text-[#ffd25a]"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-1.5 text-[11px] text-[#e8dacb] transition hover:text-[#ffd25a]"
                  onClick={() => toast("Showing all active signals.")}
                >
                  All signals <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <span className="h-3 w-px bg-white/10" />
                <span className="text-[10px] text-[#c6ad9c]">
                  Sorted by severity
                </span>
              </div>
            </div>
            <div className="tv-table-scroll overflow-x-auto">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-[1.25fr_1fr_0.8fr_0.6fr_0.65fr_0.65fr] gap-3 border-b border-white/[0.07] px-5 py-3 tv-kicker">
                  <span>Signal / location</span>
                  <span>Classification</span>
                  <span>Confidence</span>
                  <span>Δ thermal</span>
                  <span>Observed</span>
                  <span className="text-right">Status</span>
                </div>
                {filteredSites.length ? (
                  filteredSites.map(site => (
                    <button
                      key={site.id}
                      className={`tv-activity-row grid w-full grid-cols-[1.25fr_1fr_0.8fr_0.6fr_0.65fr_0.65fr] gap-3 px-5 py-4 text-left ${selectedSite.id === site.id ? "is-selected" : ""} ${site.severity === "High" ? "is-critical" : ""}`}
                      onClick={() => handleSiteSelect(site)}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin
                            className={`h-3.5 w-3.5 shrink-0 ${site.severity === "High" ? "text-[#ffaa5a]" : "text-[#ffd25a]"}`}
                          />
                          <span className="tv-display truncate text-[12px] font-bold tracking-[0.06em] text-[#fffff0]">
                            {site.id}
                          </span>
                        </div>
                        <div className="mt-1 truncate pl-5 text-[10px] text-[#d8c8b9]">
                          {site.location}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-[11px] text-[#e8dacb]">
                          {site.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-white/[0.08]">
                          <div
                            className={`h-1 ${site.confidence > 90 ? "bg-[#ffd25a]" : "bg-[#ffd25a]"}`}
                            style={{ width: `${site.confidence}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#e8dacb]">
                          {site.confidence}%
                        </span>
                      </div>
                      <div className="flex items-center text-[11px] text-[#e8dacb]">
                        {site.delta}
                      </div>
                      <div className="flex items-center text-[10px] text-[#d8c8b9]">
                        {site.time}
                      </div>
                      <div className="flex items-center justify-end">
                        <StatusBadge
                          tone={
                            site.severity === "High"
                              ? "red"
                              : site.severity === "Watch"
                                ? "amber"
                                : "neutral"
                          }
                        >
                          {site.severity}
                        </StatusBadge>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-5 py-10 text-center text-[12px] text-[#d8c8b9]">
                    No signal matches the current query.
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-between gap-3 border-t border-white/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:px-5">
              <div className="flex items-center gap-2 text-[10px] text-[#c6ad9c]">
                <Activity className="h-3.5 w-3.5 text-[#ffd25a]" /> Feed window
                05:00–05:42 UTC <span className="text-white/20">/</span>{" "}
                {filteredSites.length} rendered
              </div>
              <button
                className="tv-focus-ring inline-flex items-center gap-2 self-start tv-display text-[10px] font-bold uppercase tracking-[0.13em] text-[#ffd25a] transition hover:text-[#fffff0] sm:self-auto"
                onClick={handleScrollToQueue}
              >
                Open full incident queue{" "}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          <footer className="flex flex-col justify-between gap-2 py-6 text-[10px] text-[#9d7765] sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-[#ffd25a]" /> FireSight AI · Smart
              India Hackathon mission console
            </div>
            <div className="flex items-center gap-4">
              <span>Build 0.9.14-preview</span>
              <button
                className="transition hover:text-[#ffd25a]"
                onClick={() =>
                  toast(
                    "Secure audit trail is available to authorized operators."
                  )
                }
              >
                Audit status
              </button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
