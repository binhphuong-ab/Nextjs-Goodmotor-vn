'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import 'katex/dist/katex.min.css'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

/**
 * Reusable Markdown Editor Component with Math Formula Support
 * Features:
 * - Live preview with split view
 * - KaTeX mathematical formulas support
 * - Light mode forced (no dark mode)
 * - Customizable height and placeholder
 */

export interface MarkdownEditorProps {
  /** Current markdown value */
  value: string
  /** Callback when value changes */
  onChange: (value: string | undefined) => void
  /** Label for the editor */
  label?: string
  /** Placeholder text in the editor */
  placeholder?: string
  /** Height of the editor in pixels */
  height?: number
  /** Additional CSS class for the wrapper */
  className?: string
  /** Whether the field is required */
  required?: boolean
  /** Error message to display */
  error?: string
}

/**
 * Default placeholder with comprehensive examples
 */
const DEFAULT_PLACEHOLDER = `Enter content using Markdown syntax...

**Bold text**, *italic text*, \`code\`, [links](https://example.com)

## Headers
- Lists
- Items

> Blockquotes

\`\`\`
Code blocks
\`\`\`

### Math Formulas:
Inline: $E = mc^2$
Block: $$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$`

/**
 * Reusable Markdown Editor Component
 */
export default function MarkdownEditor({
  value,
  onChange,
  label = "Description (Markdown Editor)",
  placeholder = DEFAULT_PLACEHOLDER,
  height = 400,
  className = "",
  required = false,
  error
}: MarkdownEditorProps) {
  
  const handleChange = (val: string | undefined) => {
    onChange(val)
  }

  return (
    <div className={`markdown-editor-container ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Editor */}
      <div className="md-editor-wrapper" data-color-mode="light">
        <MDEditor
          value={value}
          onChange={handleChange}
          preview="live"
          hideToolbar={false}
          visibleDragbar={false}
          data-color-mode="light"
          previewOptions={{
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          }}
          textareaProps={{
            placeholder
          }}
          height={height}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {/* Light mode CSS for markdown editor */}
      <style jsx>{`
        .md-editor-wrapper {
          --color-mode: light;
        }
        .md-editor-wrapper :global(.w-md-editor) {
          background-color: white !important;
          color: #333 !important;
        }
        .md-editor-wrapper :global(.w-md-editor.w-md-editor-dark) {
          background-color: white !important;
          color: #333 !important;
        }
        .md-editor-wrapper :global(.w-md-editor-toolbar) {
          background-color: #f8f9fa !important;
          border-color: #e9ecef !important;
        }
        .md-editor-wrapper :global(.w-md-editor-text-textarea),
        .md-editor-wrapper :global(.w-md-editor-text) {
          background-color: white !important;
          color: #333 !important;
        }
        .md-editor-wrapper :global(.w-md-editor-preview) {
          background-color: white !important;
          color: #333 !important;
        }
      `}</style>
    </div>
  )
}

/**
 * Simplified version for minimal usage
 */
export function SimpleMarkdownEditor(props: MarkdownEditorProps) {
  return <MarkdownEditor {...props} />
}

/**
 * Preset configurations for common use cases
 */
export const MarkdownEditorPresets = {
  /**
   * For product descriptions - full featured with math support
   */
  productDescription: {
    label: "Product Description (Markdown Editor)",
    height: 400,
    placeholder: `Describe your product using Markdown...

**Key Features:**
- Feature 1
- Feature 2

## Technical Specifications
Efficiency: $\\eta = \\frac{P_{out}}{P_{in}} \\times 100\\%$

**Applications:**
Perfect for industrial applications requiring...`
  },

  /**
   * For project descriptions
   */
  projectDescription: {
    label: "Project Description (Markdown Editor)", 
    height: 350,
    placeholder: `Describe your project...

## Project Overview
Brief description of the project goals and scope.

## Key Challenges
- Challenge 1
- Challenge 2

## Solutions Implemented
Description of solutions and methodologies used.`
  },

  /**
   * For simple content editing
   */
  simpleContent: {
    label: "Content (Markdown Editor)",
    height: 300,
    placeholder: "Enter your content using Markdown syntax..."
  },

  /**
   * For technical documentation with math
   */
  technicalDocs: {
    label: "Technical Documentation (Markdown Editor)",
    height: 500,
    placeholder: `# Technical Documentation

## Overview
Brief technical overview...

## Formulas
Key mathematical relationships:

$$P = \\frac{F}{A}$$

Where:
- $P$ = Pressure
- $F$ = Force  
- $A$ = Area`
  }
} as const
