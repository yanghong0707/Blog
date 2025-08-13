import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allAuthors } from 'contentlayer/generated'
import { getAllPostsForContentlayer } from '@/lib/sanity-contentlayer-adapter'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayoutWithTags'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Blog' })

export default async function BlogPage(props: { searchParams: Promise<{ page: string }> }) {
  // 从Sanity获取博客数据并转换为Contentlayer兼容格式
  const allPosts = await getAllPostsForContentlayer()

  // 从Contentlayer获取作者数据
  const allAuthorsData = allAuthors

  // 使用pliny的工具函数处理数据
  const posts = allCoreContent(sortPosts(allPosts))

  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="All Posts"
    />
  )
}
