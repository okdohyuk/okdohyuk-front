import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';

type TagProps = {
  value: string;
  removeTag: (tag: string) => void;
};

type TagFC = React.FC<TagProps>;

const Tag: TagFC = ({ value, removeTag }) => {
  return (
    <p className="flex items-center px-1 rounded t-d-1 t-basic-1 bg-basic-4">
      {value}
      <MdOutlineCancel className="ml-2 cursor-pointer" onClick={() => removeTag(value)} />
    </p>
  );
};

export default Tag;
