import React from 'react';

type TagProps = {
  tag: string;
};

function Tag({ tag }: TagProps) {
  return (
    <span className="inline-block bg-basic-2 rounded-full px-3 py-1 text-sm font-semibold text-fg-3">
      {tag}
    </span>
  );
}

export default Tag;
