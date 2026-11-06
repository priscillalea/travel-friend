import React, { createContext, useContext, useMemo, useState } from 'react';
import { TripPhase } from '../components/PhaseSwitch';

interface PhaseContextValue {
  phase: TripPhase;
  setPhase: (phase: TripPhase) => void;
}

const PhaseContext = createContext<PhaseContextValue>({
  phase: 'durante',
  setPhase: () => undefined,
});

export function PhaseProvider({
  initialPhase = 'durante',
  children,
}: {
  initialPhase?: TripPhase;
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<TripPhase>(initialPhase);
  const value = useMemo(() => ({ phase, setPhase }), [phase]);

  return <PhaseContext.Provider value={value}>{children}</PhaseContext.Provider>;
}

export function useTripPhase(): PhaseContextValue {
  return useContext(PhaseContext);
}
