import { DocumentTextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastmod',
      type: 'datetime',
    }),
    defineField({
      name: 'draft',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'summary',
      type: 'text',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'authors',
      type: 'array',
      of: [{ type: 'string' }], // 直接使用字符串数组，存储作者姓名
      description: '输入作者姓名，用逗号分隔',
    }),
    defineField({
      name: 'layout',
      type: 'string',
      options: {
        list: [
          { title: 'Post Simple', value: 'PostSimple' },
          { title: 'Post Banner', value: 'PostBanner' },
          { title: 'Post Layout', value: 'PostLayout' },
        ],
      },
    }),
    defineField({
      name: 'bibliography',
      type: 'text',
    }),
    defineField({
      name: 'canonicalUrl',
      type: 'url',
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'authors.0.name',
      media: 'images.0',
      date: 'date',
    },
    prepare(selection) {
      const { author, date } = selection
      return {
        ...selection,
        subtitle:
          author && date
            ? `by ${author} on ${new Date(date).toLocaleDateString()}`
            : author
              ? `by ${author}`
              : date
                ? new Date(date).toLocaleDateString()
                : '',
      }
    },
  },
})
