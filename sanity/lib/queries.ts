// ./src/sanity/lib/queries.ts

import { defineQuery } from 'next-sanity'

// 获取所有博客文章
export const POSTS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current) && draft != true] | order(date desc) {
  _id,
  title,
  slug,
  date,
  lastmod,
  summary,
  tags,
  images[]{
    asset->,
    alt
  },
  authors,
  layout,
  bibliography,
  canonicalUrl,
  body
}`)

// 获取单个博客文章
export const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  date,
  lastmod,
  summary,
  tags,
  images[]{
    asset->,
    alt
  },
  authors,
  layout,
  bibliography,
  canonicalUrl,
  body
}`)

// 获取所有作者
export const AUTHORS_QUERY =
  defineQuery(`*[_type == "author" && defined(slug.current)] | order(name asc) {
  _id,
  name,
  slug,
  avatar{
    asset->
  },
  occupation,
  company,
  email,
  twitter,
  bluesky,
  linkedin,
  github,
  wechat,
  layout,
  bio
}`)

// 获取单个作者
export const AUTHOR_QUERY = defineQuery(`*[_type == "author" && slug.current == $slug][0]{
  _id,
  name,
  slug,
  avatar{
    asset->
  },
  occupation,
  company,
  email,
  twitter,
  bluesky,
  linkedin,
  github,
  wechat,
  layout,
  bio
}`)

// 获取标签数据
export const TAGS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current) && draft != true] {
  tags
}`)

// 根据标签获取文章
export const POSTS_BY_TAG_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current) && draft != true && $tag in tags] | order(date desc) {
  _id,
  title,
  slug,
  date,
  lastmod,
  summary,
  tags,
  images[]{
    asset->,
    alt
  },
  authors,
  layout
}`)
