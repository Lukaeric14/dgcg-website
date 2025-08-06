import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to get user initials from name
export function getUserInitials(name: string): string {
  if (!name) return 'U';
  
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0][0]?.toUpperCase() || 'U';
  }
  
  return names
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
