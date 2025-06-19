'use client'

import { useState } from 'react'
import {
  Mail,
  Github,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  X,
  Mastodon,
  Threads,
  Instagram,
  Medium,
  Bluesky,
  Wechat,
} from './icons'

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  x: X,
  mastodon: Mastodon,
  threads: Threads,
  instagram: Instagram,
  medium: Medium,
  bluesky: Bluesky,
  wechat: Wechat,
}

type SocialIconProps = {
  kind: keyof typeof components
  href?: string
  size?: number
  title?: string
}

const SocialIcon = ({ kind, href, size = 8, title }: SocialIconProps) => {
  const [showCopied, setShowCopied] = useState(false)

  // if (
  //   !href ||
  //   (kind === 'mail' && !/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href))
  // )
  //   return null

  const SocialSvg = components[kind]

  const handleClick = async (e: React.MouseEvent) => {
    if (title) {
      e.preventDefault()
      try {
        await navigator.clipboard.writeText(title)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      } catch (err) {
        // 降级方案：使用传统的复制方法
        const textArea = document.createElement('textarea')
        textArea.value = title
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      }
    }
  }

  return (
    <div className="group relative">
      <a
        className="cursor-pointer text-sm text-gray-500 transition hover:text-gray-600"
        target="_blank"
        rel="noopener noreferrer"
        href={href}
        onClick={handleClick}
      >
        <span className="sr-only">{kind}</span>
        <SocialSvg
          className={`hover:text-primary-500 dark:hover:text-primary-400 fill-current text-gray-700 dark:text-gray-200 h-${size} w-${size}`}
        />
      </a>
      {title && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {title}
          <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
      {showCopied && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 transform rounded bg-green-600 px-2 py-1 text-xs whitespace-nowrap text-white opacity-100 transition-opacity duration-200">
          已复制
          <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-green-600"></div>
        </div>
      )}
    </div>
  )
}

export default SocialIcon
