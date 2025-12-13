/**
 * Logo Component
 * 
 * Displays the LornuAI logo image.
 */

import { motion } from 'framer-motion'
import logo from '@/assets/logo.png'

interface LogoProps {
  className?: string
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-12'
}

export function Logo({ className = '', onClick, size = 'md' }: LogoProps) {
  const content = (
    <img 
      src={logo} 
      alt="Lornuai Enterprise AI Logo" 
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  )

  if (onClick) {
    return (
      <motion.button
        onClick={onClick}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center hover:opacity-80 transition-opacity"
        aria-label="LornuAI Home"
      >
        {content}
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center"
    >
      {content}
    </motion.div>
  )
}

