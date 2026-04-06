'use client'

import Image from 'next/image'
import { ComponentProps } from 'react'

interface AvatarImageProps extends Omit<ComponentProps<typeof Image>, 'unoptimized'> {
  src: string
  alt: string
}

export function AvatarImage({ src, alt, ...props }: AvatarImageProps) {
  // Check if the image is an SVG (from Dicebear or similar)
  const isSvg = src.includes('.svg') || src.includes('dicebear.com')
  
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={isSvg}
      {...props}
    />
  )
}
