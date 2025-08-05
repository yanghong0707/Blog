import { PortableText as PortableTextComponent } from '@portabletext/react'
import { urlFor } from '../sanity/lib/image'

// Portable Text组件配置
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      return <img src={urlFor(value.asset).url()} alt={value.alt || ''} className="h-auto w-full" />
    },
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} rel={rel} className="text-blue-600 underline hover:text-blue-800">
          {children}
        </a>
      )
    },
  },
}

interface PortableTextProps {
  value: any[]
}

export default function PortableText({ value }: PortableTextProps) {
  return <PortableTextComponent value={value} components={portableTextComponents} />
}
