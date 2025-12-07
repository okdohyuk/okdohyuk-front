import React from 'react';

type IconProps = {
  icon: React.ReactElement;
  className?: string;
  size?: number | string;
};

const Icon = ({ icon, className, size = 24 }: IconProps) => {
  const mergedClassName = [icon.props.className, className].filter(Boolean).join(' ').trim();

  return React.cloneElement(icon, {
    className: mergedClassName || undefined,
    size,
  });
};

export default Icon;
