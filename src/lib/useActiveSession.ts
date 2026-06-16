import { useEffect, useRef, useState } from 'react';
import { getActiveSession } from '../storage/activeSessionStorage';
import { ActiveSession } from '../types';

function elapsedSeconds(startedAt: string): number {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
}

export function useActiveSession() {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTick(startedAt: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(elapsedSeconds(startedAt));
    }, 1000);
  }

  function stopTick() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function refresh() {
    const active = await getActiveSession();
    setActiveSession(active);
    if (active) {
      setElapsed(elapsedSeconds(active.startedAt));
      startTick(active.startedAt);
    } else {
      stopTick();
      setElapsed(0);
    }
  }

  useEffect(() => {
    void refresh();
    return () => stopTick();
  }, []);

  return { activeSession, elapsed, refresh };
}
