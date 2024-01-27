import React from 'react';
import MobileScreenWrapper from './MobileScreenWrapper';

type AsideScreenWrapperProps = {
  children: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

type AsideScreenWrapperFC = React.FC<AsideScreenWrapperProps>;

const AsideScreenWrapper: AsideScreenWrapperFC = ({ children, left, right }) => {
  return (
    <div className="flex">
      <aside className="flex-1 hidden lg:flex">{left}</aside>
      <MobileScreenWrapper>{children}</MobileScreenWrapper>
      <aside className="flex-1 hidden lg:flex">{right}</aside>
    </div>
  );
};

export default AsideScreenWrapper;
