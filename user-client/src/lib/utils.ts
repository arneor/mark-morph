import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isColorExclusivelyDark(color: string): boolean {
  if (!color) return true;

  const hex = color.replace('#', '');
  // Handle shorthand hex
  const fullHex = hex.length === 3
    ? hex.split('').map(c => c + c).join('')
    : hex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
