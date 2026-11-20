import React from 'react';

type TagProps = {
  tag: string;
};

function Tag({ tag }: TagProps) {
  return (
    <span className="inline-block rounded-sm bg-basic-2 px-2 py-0.5 text-xs font-medium text-fg-3">
      {tag}
    </span>
  );
}

export default Tag;
