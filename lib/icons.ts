// Icon utilities for realm configurations
// This file is used client-side to avoid JSX in config files

import { Heart, Zap, BookOpen, LucideIcon } from 'lucide-react';
import { IconType } from './realms';

export function getIconComponent(iconType: IconType): LucideIcon {
  switch (iconType) {
    case 'zap':
      return Zap;
    case 'book-open':
      return BookOpen;
    case 'heart':
      return Heart;
    default:
      return Zap;
  }
}

export function renderRealmIcon(iconType: IconType) {
  const IconComponent = getIconComponent(iconType);
  return <IconComponent className="w-5 h-5" />;
}
