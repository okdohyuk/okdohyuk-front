import React from 'react';
import { X } from 'lucide-react';

type TagProps = {
  value: string;
  removeTag: (tag: string) => void;
};

function Tag({ value, removeTag }: TagProps) {
  return (
    <span className="flex items-center px-1 rounded t-d-1 t-basic-1 bg-basic-4">
      {value}
      <button
        type="button"
        className="ml-2 cursor-pointer"
        onClick={() => removeTag(value)}
        aria-label={`remove ${value}`}
      >
        <X />
      </button>
    </span>
  );
}

export default Tag;
