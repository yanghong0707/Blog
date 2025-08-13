// 导入Contentlayer核心函数，用于定义文档类型和创建数据源
import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer2/source-files'
// 导入文件系统操作模块，用于写入文件
import { writeFileSync } from 'fs'
// 导入阅读时间计算工具
import readingTime from 'reading-time'
// 导入GitHub风格的slug生成工具
import { slug } from 'github-slugger'
// 导入路径处理模块
import path from 'path'
// 导入HTML转换工具，用于处理图标
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'

// Remark相关插件 - 用于处理Markdown内容
import remarkGfm from 'remark-gfm' // 支持GitHub Flavored Markdown
import remarkMath from 'remark-math' // 支持数学公式
import { remarkAlert } from 'remark-github-blockquote-alert' // 支持GitHub风格的引用警报
import {
  remarkExtractFrontmatter, // 提取frontmatter元数据
  remarkCodeTitles, // 支持代码块标题
  remarkImgToJsx, // 将图片转换为JSX组件
  extractTocHeadings, // 提取目录标题
} from 'pliny/mdx-plugins/index.js'

// Rehype相关插件 - 用于处理HTML转换
import rehypeSlug from 'rehype-slug' // 为标题添加ID
import rehypeAutolinkHeadings from 'rehype-autolink-headings' // 为标题添加链接
import rehypeKatex from 'rehype-katex' // 渲染KaTeX数学公式
import rehypeKatexNoTranslate from 'rehype-katex-notranslate' // 防止KaTeX内容被翻译
import rehypeCitation from 'rehype-citation' // 处理引用
import rehypePrismPlus from 'rehype-prism-plus' // 代码高亮
import rehypePresetMinify from 'rehype-preset-minify' // 最小化HTML输出

// 导入站点元数据配置
import siteMetadata from './data/siteMetadata'
// 导入Pliny工具函数，用于内容处理
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'
// 导入代码格式化工具
import prettier from 'prettier'

// 导入Sanity数据获取函数（只用于博客文章）
import { getAllPosts } from './lib/sanity-data'

// 获取当前工作目录
const root = process.cwd()
// 判断是否为生产环境
const isProduction = process.env.NODE_ENV === 'production'

// 创建标题前的链接图标（使用heroicon的迷你链接图标）
const icon = fromHtmlIsomorphic(
  `
  <span class="content-header-link">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 linkicon">
  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
  <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
  </svg>
  </span>
`,
  { fragment: true } // 作为片段处理，不生成完整HTML文档
)

// 定义计算字段 - 这些字段会根据文档内容自动计算生成
const computedFields: ComputedFields = {
  readingTime: {
    type: 'json',
    resolve: (doc) => readingTime(doc.body.raw), // 计算阅读时间
  },
  slug: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath.replace(/^.+?(\/)/, ''), // 生成slug
  },
  path: {
    type: 'string',
    resolve: (doc) => doc._raw.flattenedPath, // 获取文档路径
  },
  filePath: {
    type: 'string',
    resolve: (doc) => doc._raw.sourceFilePath, // 获取源文件路径
  },
  toc: {
    type: 'json',
    resolve: (doc) => extractTocHeadings(doc.body.raw), // 提取目录
  },
}

/**
 * 统计所有博客文章中标签的出现次数，并写入JSON文件
 */
async function createTagCount(allBlogs) {
  const tagCount: Record<string, number> = {}
  allBlogs.forEach((file) => {
    // 只处理非草稿文章（生产环境）或所有文章（开发环境）
    if (file.tags && (!isProduction || file.draft !== true)) {
      file.tags.forEach((tag) => {
        const formattedTag = slug(tag) // 格式化标签为slug格式
        if (formattedTag in tagCount) {
          tagCount[formattedTag] += 1
        } else {
          tagCount[formattedTag] = 1
        }
      })
    }
  })
  // 使用prettier格式化JSON并写入文件
  const formatted = await prettier.format(JSON.stringify(tagCount, null, 2), { parser: 'json' })
  writeFileSync('./app/tag-data.json', formatted)
}

/**
 * 创建本地搜索索引
 */
function createSearchIndex(allBlogs) {
  // 检查配置是否启用了kbar搜索
  if (
    siteMetadata?.search?.provider === 'kbar' &&
    siteMetadata.search.kbarConfig.searchDocumentsPath
  ) {
    // 写入搜索索引文件
    writeFileSync(
      `public/${path.basename(siteMetadata.search.kbarConfig.searchDocumentsPath)}`,
      JSON.stringify(allCoreContent(sortPosts(allBlogs)))
    )
    console.log('Local search index generated...')
  }
}

// 定义Blog文档类型 - 现在从Sanity获取，但保持Contentlayer结构
export const Blog = defineDocumentType(() => ({
  name: 'Blog', // 文档类型名称
  filePathPattern: 'blog/**/*.mdx', // 匹配的文件路径模式（虽然实际不使用）
  contentType: 'mdx', // 内容类型为MDX
  fields: {
    // 定义文档的元数据字段
    title: { type: 'string', required: true }, // 标题（必填）
    date: { type: 'date', required: true }, // 发布日期（必填）
    tags: { type: 'list', of: { type: 'string' }, default: [] }, // 标签列表
    lastmod: { type: 'date' }, // 最后修改日期
    draft: { type: 'boolean' }, // 是否为草稿
    summary: { type: 'string' }, // 摘要
    images: { type: 'json' }, // 图片列表
    authors: { type: 'list', of: { type: 'string' } }, // 作者列表
    layout: { type: 'string' }, // 布局类型
    bibliography: { type: 'string' }, // 参考文献
    canonicalUrl: { type: 'string' }, // 规范URL
  },
  computedFields: {
    // 计算字段
    ...computedFields, // 继承通用计算字段
    structuredData: {
      // 生成结构化数据（用于SEO）
      type: 'json',
      resolve: (doc) => ({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: doc.title,
        datePublished: doc.date,
        dateModified: doc.lastmod || doc.date,
        description: doc.summary,
        image: doc.images ? doc.images[0] : siteMetadata.socialBanner,
        url: `${siteMetadata.siteUrl}/${doc._raw.flattenedPath}`,
      }),
    },
  },
}))

// 定义Authors文档类型 - 继续从本地MDX获取
export const Authors = defineDocumentType(() => ({
  name: 'Authors', // 文档类型名称
  filePathPattern: 'authors/**/*.mdx', // 匹配的文件路径模式
  contentType: 'mdx', // 内容类型为MDX
  fields: {
    // 定义作者的元数据字段
    name: { type: 'string', required: true }, // 姓名（必填）
    avatar: { type: 'string' }, // 头像
    occupation: { type: 'string' }, // 职业
    company: { type: 'string' }, // 公司
    email: { type: 'string' }, // 邮箱
    twitter: { type: 'string' }, // Twitter账号
    bluesky: { type: 'string' }, // Bluesky账号
    linkedin: { type: 'string' }, // LinkedIn账号
    github: { type: 'string' }, // GitHub账号
    wechat: { type: 'string' }, // 微信账号
    layout: { type: 'string' }, // 布局类型
  },
  computedFields: {
    // 继承通用计算字段
    ...computedFields,
    // 添加slug字段
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace(/^authors\//, '').replace(/\.mdx$/, ''),
    },
  },
}))

// 创建并导出Contentlayer数据源配置
export default makeSource({
  contentDirPath: 'data', // 内容文件所在目录

  documentTypes: [Blog, Authors], // 注册文档类型

  mdx: {
    // MDX处理配置
    cwd: process.cwd(), // 当前工作目录

    // Remark插件配置 - 处理Markdown语法
    remarkPlugins: [
      remarkExtractFrontmatter, // 提取frontmatter
      remarkGfm, // 支持GFM语法
      remarkCodeTitles, // 代码块标题
      remarkMath, // 数学公式支持
      remarkImgToJsx, // 图片转JSX
      remarkAlert, // GitHub风格警报
    ],

    // Rehype插件配置 - 处理HTML转换
    rehypePlugins: [
      rehypeSlug, // 为标题添加ID
      [
        rehypeAutolinkHeadings, // 为标题添加链接
        {
          behavior: 'prepend', // 在标题前添加链接
          headingProperties: {
            className: ['content-header'], // 标题样式类
          },
          content: icon, // 使用自定义图标作为链接内容
        },
      ],
      rehypeKatex, // 渲染KaTeX数学公式
      rehypeKatexNoTranslate, // 防止翻译数学公式
      [rehypeCitation, { path: path.join(root, 'data') }], // 处理引用，指定数据路径
      [rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true }], // 代码高亮配置
      rehypePresetMinify, // 最小化HTML输出
    ],
  },

  // 处理成功后的回调函数
  onSuccess: async (importData) => {
    try {
      // 获取本地作者数据（从MDX文件）
      const { allAuthors } = await importData()

      // 从Sanity获取博客文章数据
      const allPosts = await getAllPosts()

      // 创建标签计数（使用Sanity的博客数据）
      createTagCount(allPosts)

      // 创建搜索索引（使用Sanity的博客数据）
      createSearchIndex(allPosts)

      console.log('Hybrid data processing completed: Authors from MDX, Posts from Sanity')
    } catch (error) {
      console.error('Error processing hybrid data:', error)
    }
  },
})
