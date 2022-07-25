import React from 'react';
import { IconContext } from 'react-icons';

type Icon = {
  icon: React.ReactNode;
  className?: string;
  size?: string;
};

const Icon = ({ icon, className, size = '24' }: Icon) => {
  return (
    <>
      <IconContext.Provider value={{ className, size }}>
        <>{icon}</>
      </IconContext.Provider>
    </>
  );
};

export default Icon;
