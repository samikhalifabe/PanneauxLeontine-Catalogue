import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface ImageWithFillProps extends Omit<ImageProps, 'width' | 'height'> {
  fill: true
  containerClassName?: string
  children?: React.ReactNode
}

export function ImageWithFill({ 
  containerClassName, 
  className, 
  children,
  ...props 
}: ImageWithFillProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Image 
        {...props}
        fill
        className={className}
      />
      {children}
    </div>
  )
} 