import React, { useState } from 'react';
import { cls } from '@utils/classNameUtils';
import Tag from './Tag';

type InputTagProps = {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
};

function InputTag({ tags, addTag, removeTag }: InputTagProps) {
  const [isFocus, setIsFocus] = useState(false);
  const [input, setInput] = useState('');

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      if (input.length === 0) return;
      if (tags.includes(input)) return;
      addTag(input);
      setInput('');
    }
    if (e.key === 'Backspace' && input.length === 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className={cls(
        'relative flex flex-row flex-wrap gap-2 input-text border-solid',
        isFocus ? 'outline outline-2 outline-point-2' : '',
      )}
    >
      {tags.map((tag) => (
        <Tag removeTag={removeTag} key={tag} value={tag} />
      ))}
      <input
        className="flex-1 outline-none bg-transparent"
        onKeyDown={handleKeyUp}
        type="text"
        name="tag-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />
    </div>
  );
}

export default InputTag;
