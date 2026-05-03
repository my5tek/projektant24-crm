import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'font-display font-bold uppercase tracking-widest transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-orange text-white hover:bg-orange-d',
    ghost: 'bg-transparent text-mid border border-light hover:border-black hover:text-black',
  }
  const sizes = { sm: 'text-[11px] px-3 py-1.5', md: 'text-xs px-4 py-2' }
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}
