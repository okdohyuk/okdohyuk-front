import React, { useState } from 'react';
import { cn } from '@utils/cn';
import Tag from './Tag';

type InputTagProps = {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
};

function InputTag({ tags, addTag, removeTag }: InputTagProps) {
  const [input, setInput] = useState('');

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      const nextTag = input.trim();
      if (nextTag.length === 0) return;
      if (tags.includes(nextTag)) return;
      addTag(nextTag);
      setInput('');
    }
    if (e.key === 'Backspace' && input.length === 0) {
      if (tags.length === 0) return;
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className={cn(
        'relative flex min-h-[32px] w-full flex-wrap items-center gap-2 rounded-lg border p-1',
        'border-gray-200 bg-white text-gray-900 transition-all duration-200',
        'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100',
        'focus-within:border-transparent focus-within:ring-2 focus-within:ring-point-1',
      )}
    >
      {tags.map((tag) => (
        <Tag removeTag={removeTag} key={tag} value={tag} />
      ))}
      <input
        className="min-h-7 min-w-[140px] flex-1 bg-transparent px-1 text-sm font-medium text-inherit outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        onKeyDown={handleKeyUp}
        type="text"
        name="tag-input"
        value={input}
        placeholder={tags.length === 0 ? '#tag' : ''}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
}

export default InputTag;
