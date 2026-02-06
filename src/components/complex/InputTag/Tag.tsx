import React from 'react';
import { X } from 'lucide-react';

type TagProps = {
  value: string;
  removeTag: (tag: string) => void;
};

function Tag({ value, removeTag }: TagProps) {
  return (
    <span className="inline-flex h-8 items-center gap-1 rounded-full border border-point-2/50 bg-point-4/80 px-3 text-xs font-semibold text-point-1 dark:border-point-2/40 dark:bg-point-1/20 dark:text-point-2">
      <span className="max-w-[180px] truncate">{value}</span>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-point-1/80 transition-colors hover:bg-point-1/15 hover:text-point-1 dark:text-point-2/80 dark:hover:bg-point-2/20 dark:hover:text-point-2"
        onClick={() => removeTag(value)}
        aria-label={`remove ${value}`}
      >
        <X size={14} />
      </button>
    </span>
  );
}

export default Tag;
