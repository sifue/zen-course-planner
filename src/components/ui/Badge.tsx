import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'introduction' | 'foundation' | 'expansion' | 'graduation_project' | 'free' | 'success' | 'warning' | 'error'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        {
          'bg-gray-100 text-gray-700': variant === 'default',
          'bg-blue-100 text-blue-800': variant === 'introduction',
          'bg-green-100 text-green-800': variant === 'foundation',
          'bg-purple-100 text-purple-800': variant === 'expansion',
          'bg-red-100 text-red-800': variant === 'graduation_project',
          'bg-gray-200 text-gray-600': variant === 'free',
          'bg-emerald-100 text-emerald-800': variant === 'success',
          'bg-amber-100 text-amber-800': variant === 'warning',
          'bg-red-100 text-red-700': variant === 'error',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
