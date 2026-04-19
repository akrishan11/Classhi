import { useMemo, useState } from "react";
import type { MouseEvent } from "react";

interface MarketPricePoint {
  timestamp: number;
  yesPrice: number;
  noPrice: number;
}

interface MarketPriceChartProps {
  history: MarketPricePoint[];
  lastUpdate: number | null;
  inactive?: boolean;
}

const WIDTH = 520;
const HEIGHT = 260;
const PADDING = 42;
const KALSHI_GREEN = "#00C48D";
const KALSHI_RED = "#FF4D4F";

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getPriceRange(points: MarketPricePoint[]) {
  if (!points.length) {
    return { min: 0, max: 100 };
  }

  const values = points.flatMap((point) => [point.yesPrice, point.noPrice]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    min: Math.min(0, min),
    max: Math.max(Math.max(1, max), min + 10),
  };
}

export function MarketPriceChart({
  history,
  lastUpdate,
  inactive = false,
}: MarketPriceChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const points = history.slice(-60);
  const { min, max } = getPriceRange(points);
  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  const noActivity =
    inactive ||
    (points.length > 0 &&
      points.every(
        (point) =>
          point.yesPrice === points[0].yesPrice &&
          point.noPrice === points[0].noPrice,
      ));

  const coords = useMemo(
    () =>
      points.map((point, index) => {
        const x =
          PADDING +
          (index / Math.max(points.length - 1, 1)) * (WIDTH - PADDING * 2);
        const normalizedYes = (point.yesPrice - min) / Math.max(max - min, 1);
        const normalizedNo = (point.noPrice - min) / Math.max(max - min, 1);
        return {
          ...point,
          x,
          yYes: HEIGHT - PADDING - normalizedYes * (HEIGHT - PADDING * 2),
          yNo: HEIGHT - PADDING - normalizedNo * (HEIGHT - PADDING * 2),
        };
      }),
    [points, min, max],
  );

  const yesPath = coords
    .map(
      (point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.yYes}`,
    )
    .join(" ");
  const noPath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.yNo}`)
    .join(" ");

  const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xRatio = Math.min(
      Math.max((event.clientX - rect.left) / rect.width, 0),
      1,
    );
    const targetX = PADDING + xRatio * (WIDTH - PADDING * 2);

    let closest = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;
    coords.forEach((point, index) => {
      const distance = Math.abs(point.x - targetX);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closest = index;
      }
    });

    setHoverIndex(closest);
  };

  const handleMouseLeave = () => setHoverIndex(null);

  const hasPoints = coords.length > 0;
  const hoverPoint = hoverIndex !== null ? coords[hoverIndex] : undefined;
  const tooltipX = hoverPoint
    ? Math.min(Math.max(hoverPoint.x, 72), WIDTH - 72)
    : 0;
  const timeTicks = [
    0,
    Math.floor((coords.length - 1) / 2),
    coords.length - 1,
  ].filter((value, index, arr) => arr.indexOf(value) === index);

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-card">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-[#8A8A90]">
            Live price history
          </p>
          <p className="mt-1 text-base font-semibold text-[#111111] dark:text-white">
            YES / NO Movement
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-[#8A8A90]">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 dark:border-[#38383D] dark:bg-[#18181B]">
            <span className="h-2.5 w-2.5 rounded-full bg-classhi-green" /> Live
          </span>
          <span>
            {lastUpdate
              ? `Updated ${formatTime(lastUpdate)}`
              : "Waiting for update"}
          </span>
          {noActivity ? (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300">
              No activity yet
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-[#F8FAFC] p-3 dark:bg-[#111113]">
        {hasPoints ? (
          <>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-72 w-full"
              role="img"
              aria-label="Live market price chart"
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient
                  id="market-chart-gradient-yes"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={KALSHI_GREEN}
                    stopOpacity="0.35"
                  />
                  <stop
                    offset="100%"
                    stopColor={KALSHI_GREEN}
                    stopOpacity="0"
                  />
                </linearGradient>
                <linearGradient
                  id="market-chart-gradient-no"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={KALSHI_RED} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={KALSHI_RED} stopOpacity="0" />
                </linearGradient>
              </defs>

              {[0, 1, 2, 3].map((index) => {
                const y = PADDING + (index / 3) * (HEIGHT - PADDING * 2);
                const label = (max - ((max - min) * index) / 3).toFixed(0);
                return (
                  <g key={index}>
                    <line
                      x1={PADDING}
                      x2={WIDTH - PADDING}
                      y1={y}
                      y2={y}
                      stroke="#D1D5DB"
                      strokeWidth="1"
                      opacity="0.18"
                    />
                    <text
                      x={PADDING - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#6B7280"
                      fontSize="10"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {timeTicks.map((tickIndex) => {
                const point = coords[tickIndex];
                return (
                  <g key={tickIndex}>
                    <line
                      x1={point.x}
                      x2={point.x}
                      y1={HEIGHT - PADDING}
                      y2={HEIGHT - PADDING + 8}
                      stroke="#9CA3AF"
                      strokeWidth="1"
                    />
                    <text
                      x={point.x}
                      y={HEIGHT - PADDING + 20}
                      textAnchor="middle"
                      fill="#6B7280"
                      fontSize="10"
                    >
                      {formatTime(point.timestamp)}
                    </text>
                  </g>
                );
              })}

              <path
                d={yesPath}
                fill="none"
                stroke={KALSHI_GREEN}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={noPath}
                fill="none"
                stroke={KALSHI_RED}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={`${yesPath} L ${coords[coords.length - 1].x} ${HEIGHT - PADDING} L ${PADDING} ${HEIGHT - PADDING} Z`}
                fill="url(#market-chart-gradient-yes)"
                opacity="0.35"
              />
              <path
                d={`${noPath} L ${coords[coords.length - 1].x} ${HEIGHT - PADDING} L ${PADDING} ${HEIGHT - PADDING} Z`}
                fill="url(#market-chart-gradient-no)"
                opacity="0.35"
              />

              {hoverPoint && (
                <g>
                  <line
                    x1={hoverPoint.x}
                    x2={hoverPoint.x}
                    y1={PADDING}
                    y2={HEIGHT - PADDING}
                    stroke="#A1A1AA"
                    strokeWidth="1"
                    opacity="0.35"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.yYes}
                    r="4.5"
                    fill={KALSHI_GREEN}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <circle
                    cx={hoverPoint.x}
                    cy={hoverPoint.yNo}
                    r="4.5"
                    fill={KALSHI_RED}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                </g>
              )}
            </svg>

            {hoverPoint ? (
              <div
                className="pointer-events-none absolute top-3 z-10 px-3"
                style={{ left: tooltipX, transform: "translateX(-50%)" }}
              >
                <div className="w-max rounded-2xl bg-slate-950/95 px-3 py-2 text-xs text-white shadow-2xl ring-1 ring-white/10">
                  <div className="font-semibold">
                    {formatTime(hoverPoint.timestamp)}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-classhi-green" />
                    YES {hoverPoint.yesPrice.toFixed(0)}¢
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-classhi-coral" />
                    NO {hoverPoint.noPrice.toFixed(0)}¢
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-56 items-center justify-center text-sm text-gray-500 dark:text-[#8A8A90]">
            Waiting for live price data...
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#F8FAFC] p-3 text-sm dark:bg-[#111113]">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-[#8A8A90]">
            Latest YES
          </p>
          <p className="mt-2 text-lg font-semibold text-classhi-green">
            {latest?.yesPrice ?? "--"}¢
          </p>
          {previous ? (
            <p
              className={`mt-1 text-xs ${latest!.yesPrice >= previous.yesPrice ? "text-classhi-green" : "text-classhi-coral"}`}
            >
              {latest!.yesPrice >= previous.yesPrice ? "+" : "-"}
              {Math.abs(latest!.yesPrice - previous.yesPrice).toFixed(0)}¢ since
              previous
            </p>
          ) : null}
        </div>
        <div className="rounded-2xl bg-[#F8FAFC] p-3 text-sm dark:bg-[#111113]">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-500 dark:text-[#8A8A90]">
            Latest NO
          </p>
          <p className="mt-2 text-lg font-semibold text-classhi-coral">
            {latest?.noPrice ?? "--"}¢
          </p>
          {previous ? (
            <p
              className={`mt-1 text-xs ${latest!.noPrice >= previous.noPrice ? "text-classhi-green" : "text-classhi-coral"}`}
            >
              {latest!.noPrice >= previous.noPrice ? "+" : "-"}
              {Math.abs(latest!.noPrice - previous.noPrice).toFixed(0)}¢ since
              previous
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
