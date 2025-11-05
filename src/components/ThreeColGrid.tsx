import React, { useMemo } from 'react';

type ThreeColGridProps<T> = {
  data: T[];
  renderItem: (args: { item: T; index: number; itemW: number }) => React.ReactNode;
  gap?: number;
  padH?: number;
};

export default function ThreeColGrid<T>({ data, renderItem, gap = 8, padH = 16 }: ThreeColGridProps<T>) {
  const itemW = useMemo(() => {
    if (typeof window === 'undefined') return 100;
    const width = window.innerWidth;
    return Math.floor((width - padH * 2 - gap * 2) / 3);
  }, [gap, padH]);

  return (
    <div style={{ paddingTop: 12, paddingBottom: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(3, ${itemW}px)`,
          columnGap: gap,
          rowGap: gap,
          paddingLeft: padH,
          paddingRight: padH,
          justifyContent: 'center',
        }}
      >
        {data.map((item, index) => (
          <div key={index} style={{ width: itemW }}>
            {renderItem({ item, index, itemW })}
          </div>
        ))}
      </div>
    </div>
  );
}


