# MarkdownEditor Component Usage Examples

The `MarkdownEditor` component is a reusable markdown editor with KaTeX math support that can be used across your application.

## Basic Usage

```tsx
import MarkdownEditor from '@/components/MarkdownEditor'

function MyForm() {
  const [content, setContent] = useState('')

  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      label="Content"
    />
  )
}
```

## Using Presets

The component comes with pre-configured presets for common use cases:

### 1. Product Description (Full Featured)
```tsx
import MarkdownEditor, { MarkdownEditorPresets } from '@/components/MarkdownEditor'

function ProductForm() {
  const [description, setDescription] = useState('')

  return (
    <MarkdownEditor
      value={description}
      onChange={setDescription}
      {...MarkdownEditorPresets.productDescription}
    />
  )
}
```

### 2. Project Description
```tsx
<MarkdownEditor
  value={projectDescription}
  onChange={setProjectDescription}
  {...MarkdownEditorPresets.projectDescription}
/>
```

### 3. Simple Content
```tsx
<MarkdownEditor
  value={content}
  onChange={setContent}
  {...MarkdownEditorPresets.simpleContent}
/>
```

### 4. Technical Documentation (with Math)
```tsx
<MarkdownEditor
  value={docs}
  onChange={setDocs}
  {...MarkdownEditorPresets.technicalDocs}
/>
```

## Custom Configuration

```tsx
<MarkdownEditor
  value={content}
  onChange={setContent}
  label="Custom Editor"
  height={500}
  required={true}
  error={validationError}
  placeholder="Enter your custom content..."
  className="my-custom-class"
/>
```

## Simplified Version

```tsx
import { SimpleMarkdownEditor } from '@/components/MarkdownEditor'

<SimpleMarkdownEditor
  value={content}
  onChange={setContent}
  label="Minimal Editor"
  height={300}
/>
```

## Full Props Interface

```tsx
interface MarkdownEditorProps {
  value: string                              // Current markdown content
  onChange: (value: string | undefined) => void  // Change handler
  label?: string                            // Field label
  placeholder?: string                      // Placeholder text
  height?: number                          // Editor height (pixels)
  className?: string                       // Additional CSS class
  required?: boolean                       // Required field indicator
  error?: string                           // Error message
}
```

## Math Formula Examples

The editor supports KaTeX mathematical expressions:

### Inline Math
```markdown
Einstein's equation: $E = mc^2$
Efficiency: $\eta = \frac{P_{out}}{P_{in}} \times 100\%$
```

### Block Math
```markdown
The quadratic formula:
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

Pressure formula:
$$
P = \frac{F}{A}
$$
```

### Advanced Math
```markdown
Integral: $\int_{0}^{\infty} e^{-x} dx = 1$
Summation: $\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$
Matrix: $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$
```

## Integration in Forms

### With Form Validation
```tsx
import MarkdownEditor from '@/components/MarkdownEditor'

function MyForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleDescriptionChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      description: value || ''
    }))
    
    // Clear error when user starts typing
    if (errors.description) {
      setErrors(prev => ({
        ...prev,
        description: ''
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <MarkdownEditor
        value={formData.description}
        onChange={handleDescriptionChange}
        label="Description"
        required={true}
        error={errors.description}
        {...MarkdownEditorPresets.productDescription}
      />
    </form>
  )
}
```

### Multiple Editors in One Form
```tsx
function ComprehensiveForm() {
  const [overview, setOverview] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [instructions, setInstructions] = useState('')

  return (
    <div className="space-y-6">
      {/* Product Overview */}
      <MarkdownEditor
        value={overview}
        onChange={setOverview}
        {...MarkdownEditorPresets.productDescription}
      />

      {/* Technical Specifications */}
      <MarkdownEditor
        value={specifications}
        onChange={setSpecifications}
        {...MarkdownEditorPresets.technicalDocs}
      />

      {/* Installation Instructions */}
      <MarkdownEditor
        value={instructions}
        onChange={setInstructions}
        label="Installation Instructions"
        height={300}
        placeholder="Provide step-by-step installation instructions..."
      />
    </div>
  )
}
```

## Available Presets

| Preset | Use Case | Height | Features |
|--------|----------|--------|----------|
| `productDescription` | Product descriptions | 400px | Full featured with math |
| `projectDescription` | Project overviews | 350px | Standard features |
| `simpleContent` | Basic content | 300px | Simple editing |
| `technicalDocs` | Technical documentation | 500px | Full featured with math |

## Real-World Examples

### Product Form
```tsx
// components/admin/ProductForm.tsx
import MarkdownEditor, { MarkdownEditorPresets } from '@/components/MarkdownEditor'

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    // ... other fields
  })

  const handleDescriptionChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      description: value || ''
    }))
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Other form fields */}
      
      <MarkdownEditor
        value={formData.description || ''}
        onChange={handleDescriptionChange}
        {...MarkdownEditorPresets.productDescription}
      />
      
      {/* More form fields */}
    </form>
  )
}
```

### Project Form
```tsx
// components/admin/ProjectForm.tsx
import MarkdownEditor, { MarkdownEditorPresets } from '@/components/MarkdownEditor'

function ProjectForm() {
  const [description, setDescription] = useState('')
  
  return (
    <MarkdownEditor
      value={description}
      onChange={setDescription}
      {...MarkdownEditorPresets.projectDescription}
    />
  )
}
```

### Blog Post Editor
```tsx
// components/BlogEditor.tsx
import MarkdownEditor from '@/components/MarkdownEditor'

function BlogEditor() {
  const [content, setContent] = useState('')
  
  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      label="Blog Content"
      height={600}
      placeholder="Write your blog post using markdown..."
    />
  )
}
```

### Technical Documentation Editor
```tsx
// components/DocsEditor.tsx
import MarkdownEditor, { MarkdownEditorPresets } from '@/components/MarkdownEditor'

function DocsEditor() {
  const [docs, setDocs] = useState('')
  
  return (
    <MarkdownEditor
      value={docs}
      onChange={setDocs}
      {...MarkdownEditorPresets.technicalDocs}
    />
  )
}
```

## Features

- ✅ **Live Preview**: Split-view with real-time markdown rendering
- ✅ **Math Support**: KaTeX integration for mathematical formulas  
- ✅ **Light Mode**: Forced light theme (no dark mode issues)
- ✅ **TypeScript**: Full TypeScript support with proper types
- ✅ **Validation**: Built-in error display support
- ✅ **Responsive**: Works on all screen sizes
- ✅ **Accessible**: Proper labels and ARIA attributes
- ✅ **Presets**: Pre-configured setups for common use cases
- ✅ **Customizable**: Highly configurable with sensible defaults

## Common Patterns

### Conditional Rendering
```tsx
{isEditMode ? (
  <MarkdownEditor
    value={content}
    onChange={setContent}
    {...MarkdownEditorPresets.simpleContent}
  />
) : (
  <MarkdownDisplay content={content} />
)}
```

### With Loading State
```tsx
function ContentEditor() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  
  return (
    <div className="relative">
      <MarkdownEditor
        value={content}
        onChange={setContent}
        {...MarkdownEditorPresets.productDescription}
      />
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-gray-600">Saving...</div>
        </div>
      )}
    </div>
  )
}
```

### With Character Counter
```tsx
function EditorWithCounter() {
  const [content, setContent] = useState('')
  
  return (
    <div>
      <MarkdownEditor
        value={content}
        onChange={setContent}
        label="Description"
        height={300}
      />
      <div className="text-right text-sm text-gray-500 mt-1">
        {content.length} characters
      </div>
    </div>
  )
}
```
