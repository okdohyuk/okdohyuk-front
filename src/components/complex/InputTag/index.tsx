import React from 'react';
import Tag from './Tag';
import { cls } from '@utils/classNameUtils';

type InputTagProps = {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
};

type InputTagFC = React.FC<InputTagProps>;

const InputTag: InputTagFC = ({ tags, addTag, removeTag }) => {
  const [isFocus, setIsFocus] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>('');
  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <label
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
        onKeyDown={(e) => onKeyUp(e)}
        type="text"
        name="tag-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
      />
    </label>
  );
};

export default InputTag;
