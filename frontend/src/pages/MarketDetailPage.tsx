import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../lib/api';

interface Market {
  marketId: string;
  title: string;
  description: string;
  status: 'scheduled' | 'open' | 'closed' | 'resolved';
  yesPrice: number;
  noPrice: number;
  volume: number;
  openAt: string;
  closeAt: string;
  createdAt: string;
  createdBy: string;
}

function formatDetailed(closeAt: string): string {
  const diff = new Date(closeAt).getTime() - Date.now();
  if (diff <= 0) return 'Closed';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function StatusBadge({ status }: { status: Market['status'] }) {
  const isOpen = status === 'open';
  return (
    <span
      className={`inline-block rounded px-3 py-1 text-sm font-semibold uppercase ${
        isOpen
          ? 'bg-classhi-green text-white'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}

export function MarketDetailPage() {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const { idToken } = useAuth();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchMarket() {
      try {
        const res = await apiFetch(`/markets/${marketId}`, idToken);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error('non-ok response');
        const data = await res.json() as { market: Market };
        if (!cancelled) {
          setMarket(data.market);
          setTimeLeft(formatDetailed(data.market.closeAt));
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMarket();
    return () => { cancelled = true; };
  }, [marketId, idToken]);

  // Ticking countdown
  useEffect(() => {
    if (!market) return;
    if (market.status !== 'open' && market.status !== 'scheduled') return;
    const interval = setInterval(() => {
      setTimeLeft(formatDetailed(market.closeAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [market]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-classhi-bg">
        <p className="text-gray-500">Loading market...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-classhi-bg">
        <p className="text-gray-500">Market not found.</p>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-classhi-bg">
        <p className="text-classhi-coral">Failed to load market.</p>
      </div>
    );
  }

  const showCountdown = market.status === 'open' || market.status === 'scheduled';

  return (
    <div className="min-h-screen bg-classhi-bg">
      <main className="mx-auto max-w-2xl px-6 py-8">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/markets')}
          className="mb-6 text-sm text-gray-500 hover:text-[#111111]"
        >
          ← Markets
        </button>

        {/* Status badge */}
        <div className="mb-4">
          <StatusBadge status={market.status} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-[#111111]">{market.title}</h1>

        {/* Description */}
        {market.description && (
          <p className="mt-2 text-base text-gray-500">{market.description}</p>
        )}

        {/* YES/NO price badges */}
        <div className="mt-6 flex items-center gap-4">
          <span className="rounded px-6 py-3 text-lg font-semibold bg-classhi-green text-white">
            YES {market.yesPrice}¢
          </span>
          <span className="rounded px-6 py-3 text-lg font-semibold bg-classhi-coral text-white">
            NO {market.noPrice}¢
          </span>
        </div>

        {/* Countdown */}
        {showCountdown && (
          <p className="mt-4 text-sm text-gray-500">
            Closes in {timeLeft}
          </p>
        )}

        {/* Phase 3 notice */}
        <p className="mt-6 text-sm text-gray-500">Betting opens in Phase 3.</p>
      </main>
    </div>
  );
}
