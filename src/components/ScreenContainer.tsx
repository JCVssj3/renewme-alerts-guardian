import React from 'react';
interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
}
const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  className = ''
}) => {
  return <div style={{
    paddingTop: 'max(env(safe-area-inset-top), 1.5rem)'
  }} className="">
      {children}
    </div>;
};
export default ScreenContainer;