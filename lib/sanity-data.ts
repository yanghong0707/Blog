import { client } from '../sanity/lib/client'
import {
  POSTS_QUERY,
  POST_QUERY,
  AUTHORS_QUERY,
  AUTHOR_QUERY,
  TAGS_QUERY,
  POSTS_BY_TAG_QUERY,
} from '../sanity/lib/queries'
import { urlFor } from '../sanity/lib/image'
import { slug } from 'github-slugger'
import readingTime from 'reading-time'
import siteMetadata from '../data/siteMetadata'

// 类型定义
export interface SanityImage {
  asset: {
    _ref: string
    _type: string
  }
  alt?: string
}

export interface SanityAuthor {
  _id: string
  name: string
  slug: {
    current: string
  }
  avatar?: SanityImage
  occupation?: string
  company?: string
  email?: string
  twitter?: string
  bluesky?: string
  linkedin?: string
  github?: string
  wechat?: string
  layout?: string
  bio?: unknown[]
}

export interface SanityPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  date: string
  lastmod?: string
  summary?: string
  tags?: string[]
  images?: SanityImage[]
  authors?: { name: string }[] // 现在是包含name的对象数组
  layout?: string
  bibliography?: string
  canonicalUrl?: string
  body?: unknown[]
}

export interface TransformedPost {
  _id: string
  type: 'Blog' // 添加type字段以匹配Contentlayer格式
  title: string
  slug: string
  date: string
  lastmod?: string
  summary?: string
  tags?: string[]
  images?: { url: string; alt: string }[]
  authors?: string[] // 简化为字符串数组
  layout?: string
  bibliography?: string
  canonicalUrl?: string
  body?: {
    raw: string
    html: string
  }
  readingTime: string // 改为必填字段
  path: string // 改为必填字段
  filePath: string // 改为必填字段
  toc?: unknown[]
  structuredData?: Record<string, unknown>
}

export interface TransformedAuthor {
  _id: string
  type: 'Authors' // 添加type字段以匹配Contentlayer格式
  name: string
  slug: string
  avatar: string
  occupation?: string
  company?: string
  email?: string
  twitter?: string
  bluesky?: string
  linkedin?: string
  github?: string
  wechat?: string
  layout?: string
  bio?: unknown[]
}

// 将Portable Text转换为HTML字符串
function portableTextToHtml(blocks: unknown[]): string {
  if (!blocks || blocks.length === 0) return ''

  // 这里需要实现Portable Text到HTML的转换
  // 为了简化，我们返回JSON字符串，实际使用时需要更复杂的转换
  return JSON.stringify(blocks)
}

// 从Portable Text中提取TOC
function extractTocFromPortableText(blocks: unknown[]): unknown[] {
  if (!blocks || blocks.length === 0) return []

  const toc: unknown[] = []

  blocks.forEach((block: unknown) => {
    const blockObj = block as { _type?: string; style?: string; children?: unknown[] }
    if (
      blockObj._type === 'block' &&
      blockObj.style &&
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(blockObj.style)
    ) {
      const text =
        blockObj.children
          ?.map((child: unknown) => {
            const childObj = child as { text?: string }
            return childObj.text || ''
          })
          .join('') || ''

      toc.push({
        level: parseInt(blockObj.style.slice(1)),
        text: text,
        slug: slug(text),
      })
    }
  })

  return toc
}

// 转换Sanity数据为Contentlayer格式
export function transformPost(post: SanityPost): TransformedPost {
  // 计算阅读时间（基于summary或默认值）
  const readingTimeText = post.summary ? readingTime(post.summary).text : '2 min read'

  // 生成路径
  const path = `blog/${post.slug.current}`

  // 提取目录（如果有body内容）
  const toc = post.body ? extractTocFromPortableText(post.body) : []

  // 转换作者信息
  const authors = post.authors || [] // authors现在是包含name的对象数组

  // 提取作者姓名
  const processedAuthors = authors.map((author) => author.name)

  // 调试信息
  console.log('TransformPost - Original authors:', post.authors)
  console.log('TransformPost - Processed authors:', processedAuthors)

  // 转换图片
  const images =
    post.images?.map((img) => ({
      url: urlFor(img.asset).url(),
      alt: img.alt || '',
    })) || []

  // 转换body内容
  const body = post.body
    ? {
        raw: JSON.stringify(post.body),
        html: portableTextToHtml(post.body),
      }
    : {
        raw: '',
        html: '',
      }

  const transformedPost: TransformedPost = {
    _id: post._id,
    type: 'Blog',
    title: post.title,
    slug: post.slug.current,
    date: post.date,
    lastmod: post.lastmod,
    summary: post.summary || '',
    tags: post.tags || [],
    images: images,
    authors: processedAuthors,
    layout: post.layout || 'PostLayout',
    bibliography: post.bibliography,
    canonicalUrl: post.canonicalUrl,
    body: body,
    readingTime: readingTimeText,
    path: path,
    filePath: `blog/${post.slug.current}.mdx`,
    toc: toc,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.date,
      dateModified: post.lastmod || post.date,
      description: post.summary,
      image: post.images?.[0] ? urlFor(post.images[0].asset).url() : siteMetadata.socialBanner,
      url: `${siteMetadata.siteUrl}/blog/${post.slug.current}`,
    },
  }

  return transformedPost
}

export function transformAuthor(author: SanityAuthor): TransformedAuthor {
  return {
    _id: author._id,
    type: 'Authors',
    name: author.name,
    slug: author.slug.current,
    avatar: author.avatar ? urlFor(author.avatar.asset).url() : '',
    occupation: author.occupation || '',
    company: author.company || '',
    email: author.email || '',
    twitter: author.twitter || '',
    bluesky: author.bluesky || '',
    linkedin: author.linkedin || '',
    github: author.github || '',
    wechat: author.wechat || '',
    layout: author.layout || '',
    bio: author.bio || [],
  }
}

// 数据获取函数
export async function getAllPosts(): Promise<TransformedPost[]> {
  const posts = await client.fetch(POSTS_QUERY)
  return posts.map(transformPost)
}

export async function getPost(slug: string): Promise<TransformedPost | null> {
  const post = await client.fetch(POST_QUERY, { slug })
  return post ? transformPost(post) : null
}

export async function getAllAuthors(): Promise<TransformedAuthor[]> {
  const authors = await client.fetch(AUTHORS_QUERY)
  return authors.map(transformAuthor)
}

export async function getAuthor(slug: string): Promise<TransformedAuthor | null> {
  const author = await client.fetch(AUTHOR_QUERY, { slug })
  return author ? transformAuthor(author) : null
}

export async function getTagCount(): Promise<Record<string, number>> {
  const posts = await client.fetch(TAGS_QUERY)
  const tagCount: Record<string, number> = {}

  posts.forEach((post: { tags?: string[] }) => {
    if (post.tags) {
      post.tags.forEach((tag: string) => {
        const formattedTag = slug(tag)
        tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1
      })
    }
  })

  return tagCount
}

export async function getPostsByTag(tag: string): Promise<TransformedPost[]> {
  const posts = await client.fetch(POSTS_BY_TAG_QUERY, { tag })
  return posts.map(transformPost)
}

// 排序函数
export function sortPosts(posts: TransformedPost[]) {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// 获取核心内容（用于搜索）
export function allCoreContent(posts: TransformedPost[]) {
  return posts.map(({ body, ...post }) => post)
}

// coreContent函数 - 从pliny/utils/contentlayer复制
export function coreContent<T extends { body?: { raw: string } }>(content: T) {
  const { body, ...rest } = content
  return rest
}

// 为作者类型提供coreContent函数
export function coreContentAuthor(content: TransformedAuthor) {
  return content
}
