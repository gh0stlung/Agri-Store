import React from 'react';
import { useNavigation } from '../context/NavigationContext';

interface LinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

export const Link: React.FC<LinkProps> = ({ href, children, className, onClick }) => {
  const { push } = useNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick(e);
    push(href);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};

export default Link;