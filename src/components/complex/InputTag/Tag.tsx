import React from 'react';
import { X } from 'lucide-react';

type TagProps = {
  value: string;
  removeTag: (tag: string) => void;
};

function Tag({ value, removeTag }: TagProps) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-md border border-basic-3 bg-basic-2 pl-2.5 pr-1 text-xs font-medium text-fg-2">
      <span className="max-w-[180px] truncate">{value}</span>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-fg-5 transition-colors hover:bg-basic-3 hover:text-fg-1 focus-ring"
        onClick={() => removeTag(value)}
        aria-label={`remove ${value}`}
      >
        <X size={14} aria-hidden />
      </button>
    </span>
  );
}

export default Tag;
