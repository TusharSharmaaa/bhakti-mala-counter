import React, { createContext, useContext, useMemo, useState } from 'react';

type BannerInsetsContext = { h: number; setH: (n: number) => void };

const Ctx = createContext<BannerInsetsContext>({ h: 0, setH: () => {} });

export const BannerInsetsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [h, setH] = useState(0);
  const value = useMemo(() => ({ h, setH }), [h]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useBannerInsets() {
  return useContext(Ctx);
}

/** Adds bottom space so content is never covered by the banner */
export const BannerSpacer: React.FC<{ extra?: number }> = ({ extra = 0 }) => {
  const { h } = useBannerInsets();
  return <div style={{ height: h + extra }} />;
};


