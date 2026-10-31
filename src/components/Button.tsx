import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  // sheen: a slow glint of light across the gold (index.css)
  primary: 'sheen bg-gold-500 text-velvet-950 hover:bg-gold-400 font-semibold',
  ghost: 'border border-velvet-500 text-cream-300 hover:border-gold-600 hover:text-gold-300',
  danger: 'border border-red-400/40 text-red-300 hover:bg-red-400/10',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`press min-h-11 rounded-xl px-4 py-2.5 text-sm disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
