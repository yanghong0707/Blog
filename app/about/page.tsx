import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'About' })

export default function Page() {
  const authors = allAuthors.filter((p) => p.slug !== 'default') as Authors[]
  return (
    <>
      {authors.map((author) => (
        <div key={author.slug}>
          <AuthorLayout content={coreContent(author)}>
            <MDXLayoutRenderer code={author.body.code} />
          </AuthorLayout>
        </div>
      ))}
    </>
  )
}
