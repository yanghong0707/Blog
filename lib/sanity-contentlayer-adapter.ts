import { getAllPosts, getAllAuthors, TransformedPost, TransformedAuthor } from './sanity-data'

// 将Sanity数据转换为Contentlayer完全兼容的格式
export function adaptSanityPostToContentlayer(post: TransformedPost) {
  return {
    ...post,
    _raw: {
      flattenedPath: post.path,
      sourceFilePath: post.filePath,
      sourceFileName: post.filePath.split('/').pop() || '',
      sourceDirName: post.filePath.split('/').slice(-2, -1)[0] || '',
    },
    // 确保body字段存在且格式正确
    body: {
      raw: post.body?.raw || '',
      html: post.body?.html || '',
      code: post.body?.raw || '', // Contentlayer期望的code字段
    },
    // 添加Contentlayer期望的其他字段
    draft: false, // 默认非草稿
    lastmod: post.lastmod || post.date,
    // 确保所有必需字段都有值
    title: post.title || '',
    date: post.date || new Date().toISOString(),
    slug: post.slug || '',
    summary: post.summary || '',
    tags: post.tags || [],
    images: post.images || [],
    authors: post.authors || [],
    layout: post.layout || 'PostLayout',
    bibliography: post.bibliography || '',
    canonicalUrl: post.canonicalUrl || '',
    readingTime: post.readingTime || '0 min read',
    path: post.path || `blog/${post.slug}`,
    filePath: post.filePath || `blog/${post.slug}.mdx`,
    toc: post.toc || [],
    structuredData: post.structuredData || {},
  }
}

// 获取所有博客文章并转换为Contentlayer格式
export async function getAllPostsForContentlayer() {
  const posts = await getAllPosts()
  return posts.map(adaptSanityPostToContentlayer)
}

// 获取所有作者并转换为Contentlayer格式
export async function getAllAuthorsForContentlayer() {
  const authors = await getAllAuthors()
  return authors.map((author) => ({
    ...author,
    _raw: {
      flattenedPath: `authors/${author.slug}`,
      sourceFilePath: `data/authors/${author.slug}.mdx`,
      sourceFileName: `${author.slug}.mdx`,
      sourceDirName: 'authors',
    },
    // 确保所有必需字段都有值
    name: author.name || '',
    slug: author.slug || '',
    avatar: author.avatar || '',
    occupation: author.occupation || '',
    company: author.company || '',
    email: author.email || '',
    twitter: author.twitter || '',
    bluesky: author.bluesky || '',
    linkedin: author.linkedin || '',
    github: author.github || '',
    wechat: author.wechat || '',
    layout: author.layout || 'AuthorLayout',
    bio: author.bio || [],
  }))
}

// 导出类型定义
export type ContentlayerCompatiblePost = ReturnType<typeof adaptSanityPostToContentlayer>
export type ContentlayerCompatibleAuthor = Awaited<
  ReturnType<typeof getAllAuthorsForContentlayer>
>[number]
