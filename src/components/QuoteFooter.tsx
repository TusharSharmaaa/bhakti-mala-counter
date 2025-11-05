import React from 'react';

type QuoteFooterProps = {
  onPrev: () => void;
  onNext: () => void;
  onShare: () => void;
};

export function QuoteFooter({ onPrev, onNext, onShare }: QuoteFooterProps) {
  return (
    <div style={{ marginTop: 12, paddingLeft: 16, paddingRight: 16 }}>
      <div className="flex items-center gap-2 sm:gap-3">
        <Btn label="Prev" onPress={onPrev} />
        <Btn label="Next" onPress={onNext} />
        <BtnPrimary label="Share on WhatsApp" onPress={onShare} />
      </div>
    </div>
  );
}

function Btn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="flex-1 min-w-0 h-11 px-3 rounded-lg border text-center truncate"
      type="button"
      title={label}
    >
      <span className="inline-block align-middle">{label}</span>
    </button>
  );
}

function BtnPrimary({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="flex-1 min-w-0 h-11 px-3 rounded-lg text-white font-semibold bg-neutral-900 hover:bg-neutral-800 text-center truncate"
      type="button"
      title={label}
    >
      <span className="inline-block align-middle">{label}</span>
    </button>
  );
}

export default QuoteFooter;


