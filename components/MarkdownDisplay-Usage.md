# MarkdownDisplay Component Usage Guide

The `MarkdownDisplay` component is used to render markdown content with math formula support throughout your application.

## Basic Usage

```tsx
import { ProductDescriptionDisplay } from '@/components/MarkdownDisplay'

function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <ProductDescriptionDisplay content={product.description} />
    </div>
  )
}
```

## Available Components

### 1. Main Component
```tsx
import MarkdownDisplay from '@/components/MarkdownDisplay'

<MarkdownDisplay 
  content="Your **markdown** content with $math$ formulas"
  className="custom-styling"
  proseClasses="prose prose-lg prose-blue max-w-none"
/>
```

### 2. Specialized Components

#### Product Descriptions
```tsx
import { ProductDescriptionDisplay } from '@/components/MarkdownDisplay'

<ProductDescriptionDisplay content={product.description} />
```

#### Project Descriptions  
```tsx
import { ProjectDescriptionDisplay } from '@/components/MarkdownDisplay'

<ProjectDescriptionDisplay content={project.description} />
```

#### Blog Content
```tsx
import { BlogContentDisplay } from '@/components/MarkdownDisplay'

<BlogContentDisplay content={post.content} />
```

#### Technical Documentation
```tsx
import { TechnicalDocsDisplay } from '@/components/MarkdownDisplay'

<TechnicalDocsDisplay content={docs.content} />
```

#### Compact Content (Comments, etc.)
```tsx
import { CompactMarkdownDisplay } from '@/components/MarkdownDisplay'

<CompactMarkdownDisplay content={comment.text} />
```

## Using Presets

```tsx
import MarkdownDisplay, { MarkdownDisplayPresets } from '@/components/MarkdownDisplay'

<MarkdownDisplay 
  content={content}
  {...MarkdownDisplayPresets.productDescription}
/>
```

## Available Presets

| Preset | Use Case | Prose Classes | Styling |
|--------|----------|---------------|---------|
| `productDescription` | Product descriptions | `prose-lg` | Larger text, good spacing |
| `projectDescription` | Project descriptions | `prose` | Standard prose |
| `blogContent` | Blog posts | `prose-xl` | Optimized for reading |
| `technicalDocs` | Documentation | `prose-sm` | Compact, precise |
| `compact` | Comments, small content | `prose-sm` | Smaller text |

## Math Formula Support

All components support KaTeX mathematical expressions:

### Inline Math
```markdown
Einstein's equation: $E = mc^2$
Efficiency: $\eta = \frac{P_{out}}{P_{in}} \times 100\%$
```

### Block Math
```markdown
The quadratic formula:
$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

Pressure formula:
$$P = \frac{F}{A}$$
```

## Custom Styling

### With Custom CSS Classes
```tsx
<ProductDescriptionDisplay 
  content={description}
  className="my-4 border-l-4 border-blue-500 pl-4"
/>
```

### With Custom Prose Classes
```tsx
<MarkdownDisplay 
  content={content}
  proseClasses="prose prose-2xl prose-blue max-w-none"
  className="text-center"
/>
```

## Integration Examples

### Product Detail Page
```tsx
// app/products/[slug]/page.tsx
import { ProductDescriptionDisplay } from '@/components/MarkdownDisplay'

export default function ProductDetailPage() {
  return (
    <div>
      {/* Other content */}
      
      {product.description && (
        <div>
          <h3>Description</h3>
          <ProductDescriptionDisplay content={product.description} />
        </div>
      )}
    </div>
  )
}
```

### Project Detail Page
```tsx
// app/projects/[slug]/page.tsx
import { ProjectDescriptionDisplay } from '@/components/MarkdownDisplay'

export default function ProjectDetailPage() {
  return (
    <div>
      <ProjectDescriptionDisplay content={project.description} />
    </div>
  )
}
```

### Blog Post Page
```tsx
// app/blog/[slug]/page.tsx
import { BlogContentDisplay } from '@/components/MarkdownDisplay'

export default function BlogPostPage() {
  return (
    <article>
      <h1>{post.title}</h1>
      <BlogContentDisplay content={post.content} />
    </article>
  )
}
```

### Admin Preview
```tsx
// In admin forms for previewing content
import { CompactMarkdownDisplay } from '@/components/MarkdownDisplay'

function ContentPreview({ content }) {
  return (
    <div className="border rounded p-4">
      <h4>Preview:</h4>
      <CompactMarkdownDisplay content={content} />
    </div>
  )
}
```

## Features

- ✅ **Math Support**: KaTeX integration for mathematical formulas
- ✅ **TypeScript**: Full TypeScript support with proper types
- ✅ **Consistent Styling**: Tailwind prose classes for beautiful typography
- ✅ **Presets**: Pre-configured setups for common use cases
- ✅ **Customizable**: Highly configurable with sensible defaults
- ✅ **Performance**: Optimized for rendering markdown content
- ✅ **Accessible**: Proper semantic HTML output
