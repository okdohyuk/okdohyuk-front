import React from 'react';

type TagProps = {
  tag: string;
};

const Tag: React.FC<TagProps> = ({ tag }) => {
  return (
    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
      {tag}
    </span>
  );
};

export default Tag;
