import { UserIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'name',
      },
    }),
    defineField({
      name: 'avatar',
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
    defineField({
      name: 'occupation',
      type: 'string',
    }),
    defineField({
      name: 'company',
      type: 'string',
    }),
    defineField({
      name: 'email',
      type: 'string',
    }),
    defineField({
      name: 'twitter',
      type: 'string',
    }),
    defineField({
      name: 'bluesky',
      type: 'string',
    }),
    defineField({
      name: 'linkedin',
      type: 'string',
    }),
    defineField({
      name: 'github',
      type: 'string',
    }),
    defineField({
      name: 'wechat',
      type: 'string',
    }),
    defineField({
      name: 'layout',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'avatar',
      occupation: 'occupation',
    },
    prepare(selection) {
      const { occupation } = selection
      return {
        ...selection,
        subtitle: occupation || '',
      }
    },
  },
})
