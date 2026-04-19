import { useEffect, useRef } from 'react';

export interface PriceUpdate {
  type: 'PRICE_UPDATE';
  marketId: string;
  yesPrice: number;
  noPrice: number;
}

export function useMarketWS(
  marketId: string | undefined,
  idToken: string | null,
  onPriceUpdate: (update: PriceUpdate) => void
): void {
  const wsRef = useRef<WebSocket | null>(null);
  const WS_BASE = import.meta.env.VITE_WS_API_URL as string | undefined;

  useEffect(() => {
    if (!marketId || !idToken || !WS_BASE) return;

    const url = `${WS_BASE}?token=${encodeURIComponent(idToken)}&marketId=${encodeURIComponent(marketId)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as PriceUpdate;
        if (data.type === 'PRICE_UPDATE' && data.marketId === marketId) {
          onPriceUpdate(data);
        }
      } catch {
        // malformed message — ignore silently
      }
    };

    ws.onerror = (err) => {
      console.error('[useMarketWS] socket error', err);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [marketId, idToken, WS_BASE, onPriceUpdate]);
}
