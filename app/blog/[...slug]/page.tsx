import 'css/prism.css'
import 'katex/dist/katex.css'

import PageTitle from '@/components/PageTitle'
import { components } from '@/components/MDXComponents'
import {
  sortPosts,
  coreContent,
  allCoreContent,
  getAllPosts,
  getPost,
  getAllAuthors,
  coreContentAuthor,
} from '@/lib/sanity-data'
import PostSimple from '@/layouts/PostSimple'
import PostLayout from '@/layouts/PostLayout'
import PostBanner from '@/layouts/PostBanner'
import { Metadata } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { notFound } from 'next/navigation'
import PortableText from '@/components/PortableText'

const defaultLayout = 'PostLayout'
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))
  const allPosts = await getAllPosts()
  const post = allPosts.find((p) => p.slug === slug)

  if (!post) {
    return
  }

  const publishedAt = new Date(post.date).toISOString()
  const modifiedAt = new Date(post.lastmod || post.date).toISOString()
  const authors = post.authors || []
  let imageList = [siteMetadata.socialBanner]
  if (post.images && post.images.length > 0) {
    imageList = post.images.map((img) => img.url)
  }
  const ogImages = imageList.map((img) => {
    return {
      url: img && img.includes('http') ? img : siteMetadata.siteUrl + img,
    }
  })

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      url: './',
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: imageList,
    },
  }
}

export const generateStaticParams = async () => {
  const allPosts = await getAllPosts()
  return allPosts.map((p) => ({ slug: p.slug.split('/').map((name) => decodeURI(name)) }))
}

export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug.join('/'))

  // 获取所有文章和当前文章
  const allPosts = await getAllPosts()
  const sortedCoreContents = allCoreContent(sortPosts(allPosts))
  const postIndex = sortedCoreContents.findIndex((p) => p.slug === slug)

  if (postIndex === -1) {
    return notFound()
  }

  const prev = sortedCoreContents[postIndex + 1]
  const next = sortedCoreContents[postIndex - 1]
  const post = allPosts.find((p) => p.slug === slug)

  if (!post) {
    return notFound()
  }

  const authorList = post.authors || ['default']
  const allAuthors = await getAllAuthors()
  const authorDetails = authorList
    .map((author) => {
      const authorResults = allAuthors.find((p) => p.name === author)
      return authorResults ? coreContentAuthor(authorResults) : null
    })
    .filter(Boolean)

  const mainContent = coreContent(post)
  const jsonLd = post.structuredData || {}
  if (authorDetails.length > 0) {
    jsonLd['author'] = authorDetails.map((author) => {
      return {
        '@type': 'Person',
        name: author?.name || 'Unknown',
      }
    })
  }

  const Layout = layouts[post.layout || defaultLayout]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Layout content={mainContent} authorDetails={authorDetails} next={next} prev={prev}>
        {post.body && post.body.raw ? (
          <PortableText value={JSON.parse(post.body.raw)} />
        ) : (
          <div>No content available</div>
        )}
      </Layout>
    </>
  )
}
