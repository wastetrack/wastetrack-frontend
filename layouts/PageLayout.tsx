import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Layout wrapper untuk memastikan sticky footer bekerja dengan baik
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex min-h-screen flex-col ${className}`}>
      <main className='flex-1'>{children}</main>
    </div>
  );
};

export default PageLayout;
