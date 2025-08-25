'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'

/**
 * Reusable Markdown Display Component
 * For rendering markdown content with math formula support
 * 
 * Features:
 * - KaTeX mathematical formulas support
 * - Proper typography with Tailwind prose classes
 * - Consistent styling across the application
 */

export interface MarkdownDisplayProps {
  /** Markdown content to render */
  content: string
  /** Additional CSS classes */
  className?: string
  /** Custom prose classes (default: "prose prose-gray max-w-none") */
  proseClasses?: string
}

/**
 * Clean markdown content by converting HTML breaks to proper markdown
 */
function cleanMarkdownContent(content: string): string {
  return content
    // Convert <br> and <br/> tags to proper line breaks
    .replace(/<br\s*\/?>/gi, '  \n')
    // Convert &nbsp; to spaces
    .replace(/&nbsp;/g, ' ')
    // Ensure headings are properly formatted with line breaks
    .replace(/(\S)(#{1,6}\s)/g, '$1\n\n$2')
    .replace(/(#{1,6}[^\n]*?)(<br\s*\/?>)/gi, '$1\n')
    // Clean up multiple consecutive line breaks but preserve heading structure
    .replace(/\n{3,}/g, '\n\n')
    // Ensure proper spacing around headings
    .replace(/\n(#{1,6}\s[^\n]*)\n/g, '\n\n$1\n\n')
    // Trim whitespace
    .trim()
}

/**
 * Default component for displaying markdown content
 */
export default function MarkdownDisplay({
  content,
  className = "",
  proseClasses = "prose prose-gray max-w-none"
}: MarkdownDisplayProps) {
  if (!content || !content.trim()) {
    return null
  }

  // Clean the content before rendering
  const cleanedContent = cleanMarkdownContent(content)

  return (
    <div className={`markdown-display ${proseClasses} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  )
}

/**
 * Preset configurations for different use cases
 */
export const MarkdownDisplayPresets = {
  /**
   * For product descriptions - larger text, good spacing
   */
  productDescription: {
    proseClasses: "prose prose-gray max-w-none",
    className: "text-gray-700 leading-relaxed"
  },

  /**
   * For project descriptions - standard prose
   */
  projectDescription: {
    proseClasses: "prose prose-gray max-w-none",
    className: "text-gray-700"
  },

  /**
   * For blog content - optimized for reading
   */
  blogContent: {
    proseClasses: "prose prose-xl prose-gray max-w-none",
    className: "text-gray-800"
  },

  /**
   * For technical documentation - compact, precise
   */
  technicalDocs: {
    proseClasses: "prose prose-sm prose-gray max-w-none",
    className: "text-gray-700"
  },

  /**
   * For comments or smaller content
   */
  compact: {
    proseClasses: "prose prose-sm prose-gray max-w-none",
    className: "text-gray-600"
  }
} as const

/**
 * Specialized components for common use cases
 */

/**
 * For displaying product descriptions
 */
export function ProductDescriptionDisplay({ content, className = "" }: { content: string; className?: string }) {
  return (
    <MarkdownDisplay
      content={content}
      {...MarkdownDisplayPresets.productDescription}
      className={`${MarkdownDisplayPresets.productDescription.className} ${className}`}
    />
  )
}

/**
 * For displaying project descriptions
 */
export function ProjectDescriptionDisplay({ content, className = "" }: { content: string; className?: string }) {
  return (
    <MarkdownDisplay
      content={content}
      {...MarkdownDisplayPresets.projectDescription}
      className={`${MarkdownDisplayPresets.projectDescription.className} ${className}`}
    />
  )
}

/**
 * For displaying blog content
 */
export function BlogContentDisplay({ content, className = "" }: { content: string; className?: string }) {
  return (
    <MarkdownDisplay
      content={content}
      {...MarkdownDisplayPresets.blogContent}
      className={`${MarkdownDisplayPresets.blogContent.className} ${className}`}
    />
  )
}

/**
 * For displaying technical documentation
 */
export function TechnicalDocsDisplay({ content, className = "" }: { content: string; className?: string }) {
  return (
    <MarkdownDisplay
      content={content}
      {...MarkdownDisplayPresets.technicalDocs}
      className={`${MarkdownDisplayPresets.technicalDocs.className} ${className}`}
    />
  )
}

/**
 * For displaying compact content (comments, small descriptions)
 */
export function CompactMarkdownDisplay({ content, className = "" }: { content: string; className?: string }) {
  return (
    <MarkdownDisplay
      content={content}
      {...MarkdownDisplayPresets.compact}
      className={`${MarkdownDisplayPresets.compact.className} ${className}`}
    />
  )
}
