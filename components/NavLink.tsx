'use client';

import Link from 'next/link';
import { useTransition } from './TransitionProvider';
import { ReactNode } from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, className = '', title, onClick }: NavLinkProps) {
  const { startTransition } = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.();
    startTransition(() => {
      window.location.href = href;
    });
  };

  return (
    <Link
      href={href}
      className={className}
      title={title}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
