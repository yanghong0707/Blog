import {
  getAllPosts,
  getAllAuthors,
  getPost,
  getAuthor,
  getTagCount,
  getPostsByTag,
} from './sanity-data'

// 重新导出Sanity数据，使其与Contentlayer格式兼容
export const allBlogs = async () => {
  return await getAllPosts()
}

export const allAuthors = async () => {
  return await getAllAuthors()
}

// 提供同步版本的数据获取函数（用于静态生成）
export async function getStaticBlogData() {
  const posts = await getAllPosts()
  const authors = await getAllAuthors()

  return {
    posts,
    authors,
  }
}

// 导出其他必要的函数
export { getPost, getAuthor, getTagCount, getPostsByTag }
