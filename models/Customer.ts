import { Schema, model, models, Types } from 'mongoose'

export interface ICustomer {
  _id: string
  name: string
  slug: string
  legalName?: string
  address?: string
  businessType: 'Machinary service' | 'Nhà chế tạo máy' | 'Nhà máy Việt Nam' | 'Nhà máy nước ngoài' | 'Xưởng sản xuất'
  industry?: string[] // Array of Industry IDs (optional now)
  website?: string
  logo?: string
  
  // Enhanced company images similar to Product model
  images: Array<{
    url: string
    alt?: string
    caption?: string
    isPrimary?: boolean
  }>
  
  // Customer Relationship
  province?: 'TP Ho Chi Minh' | 'TP Hà Nội' | 'TP Đà Nẵng' | 'TP Huế' | 'Quảng Ninh' | 'Cao Bằng' | 'Lạng Sơn' | 'Lai Châu' | 'Điện Biên' | 'Sơn La' | 'Thanh Hóa' | 'Nghệ An' | 'Hà Tĩnh' | 'Tuyên Quang' | 'Lào Cai' | 'Thái Nguyên' | 'Phú Thọ' | 'Bắc Ninh' | 'Hưng Yên' | 'TP Hải Phòng' | 'Ninh Bình' | 'Quảng Trị' | 'Quảng Ngãi' | 'Gia Lai' | 'Khánh Hòa' | 'Lâm Đồng' | 'Đắk Lắk' | 'Đồng Nai' | 'Tây Ninh' | 'TP Cần Thơ' | 'Vĩnh Long' | 'Đồng Tháp' | 'Cà Mau' | 'An Giang'
  nationality: 'Việt Nam' | 'Nhật Bản' | 'Hàn Quốc' | 'Trung Quốc' | 'Đài Loan' | 'Mỹ' | 'EU' | 'Thái Lan' | 'Other'
  
  // Description
  description?: string
  
  // Optional project-related fields
  projects?: { name: string; url?: string }[]
  pumpModelsUsed?: { name: string; url?: string }[]
  applications?: { name: string; url?: string }[]
  
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [200, 'Customer name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Customer slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Slug cannot exceed 100 characters'],
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  legalName: {
    type: String,
    trim: true,
    maxlength: [300, 'Legal name cannot exceed 300 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: [
      'Machinary service',
      'Nhà chế tạo máy', 
      'Nhà máy Việt Nam',
      'Nhà máy nước ngoài',
      'Xưởng sản xuất'
    ]
  },
  industry: [{
    type: Schema.Types.ObjectId,
    ref: 'Industry'
  }],
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please provide a valid website URL'
    }
  },
  logo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        // Allow both full URLs (http/https) and relative paths starting with /
        // Must end with valid image extensions
        return /^(https?:\/\/.+|\/[\w\-\/\.]+)\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
      },
      message: 'Please provide a valid logo image URL or path (relative paths must start with / and end with .jpg, .jpeg, .png, .gif, .webp, or .svg)'
    }
  },
  
  // Enhanced company images similar to Product model
  images: [{
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          // Allow both full URLs (http/https) and relative paths starting with /
          // Must end with valid image extensions
          return /^(https?:\/\/.+|\/[\w\-\/\.]+)\.(jpg|jpeg|png|gif|webp|svg)$/i.test(v);
        },
        message: 'Please provide a valid image URL or path (relative paths must start with / and end with .jpg, .jpeg, .png, .gif, .webp, or .svg)'
      }
    },
    alt: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Customer Relationship
  province: {
    type: String,
    required: false,
    enum: [
      'TP Ho Chi Minh',
      'TP Hà Nội', 
      'TP Đà Nẵng',
      'TP Huế',
      'Quảng Ninh',
      'Cao Bằng',
      'Lạng Sơn',
      'Lai Châu',
      'Điện Biên',
      'Sơn La',
      'Thanh Hóa',
      'Nghệ An',
      'Hà Tĩnh',
      'Tuyên Quang',
      'Lào Cai',
      'Thái Nguyên',
      'Phú Thọ',
      'Bắc Ninh',
      'Hưng Yên',
      'TP Hải Phòng',
      'Ninh Bình',
      'Quảng Trị',
      'Quảng Ngãi',
      'Gia Lai',
      'Khánh Hòa',
      'Lâm Đồng',
      'Đắk Lắk',
      'Đồng Nai',
      'Tây Ninh',
      'TP Cần Thơ',
      'Vĩnh Long',
      'Đồng Tháp',
      'Cà Mau',
      'An Giang'
    ],
    default: 'TP Ho Chi Minh'
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
    enum: [
      'Việt Nam',
      'Nhật Bản', 
      'Hàn Quốc',
      'Trung Quốc',
      'Đài Loan',
      'Mỹ',
      'EU',
      'Thái Lan',
      'Other'
    ],
    default: 'Việt Nam'
  },

  
  // Description - Markdown content from MarkdownEditor
  description: {
    type: String,
    required: false,
    maxlength: [50000, 'Description cannot exceed 50,000 characters'] // Allows rich HTML content
  },
  
  // Optional project-related fields
  projects: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters']
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Please provide a valid project URL'
      }
    }
  }],
  
  pumpModelsUsed: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Pump model name cannot exceed 200 characters']
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Please provide a valid pump model URL'
      }
    }
  }],
  
  applications: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Application name cannot exceed 200 characters']
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Please provide a valid application URL'
      }
    }
  }],
  
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes optimized for actual query patterns

// CRITICAL: Unique index for customer detail page lookups (/api/customers/[slug]) 
// Note: unique index automatically created by "unique: true" in schema field definition

// Essential single-field indexes for filtering and sorting
CustomerSchema.index({ businessType: 1 })     // Used in frontend filtering
CustomerSchema.index({ province: 1 })         // Used in admin queries and counts
CustomerSchema.index({ nationality: 1 })     // Used in frontend filtering and counts
CustomerSchema.index({ featured: 1 })         // Used for featured customer queries
CustomerSchema.index({ industry: 1 })         // Industry references (array field)
CustomerSchema.index({ createdAt: -1 })       // Admin list sorting

// Compound indexes for actual query patterns
CustomerSchema.index({ featured: -1, nationality: -1, createdAt: -1 }) // Main public page sort pattern
CustomerSchema.index({ businessType: 1, nationality: 1 }) // Frontend business type + nationality filtering

// Sparse indexes for optional fields (only indexes documents that have these fields)
// Removed completeDate index as field has been removed

// Input interface for creating/updating customers
export interface ICustomerInput {
  name: string
  slug: string
  legalName?: string
  address?: string
  businessType: ICustomer['businessType']
  industry?: string[]
  website?: string
  logo?: string
  province?: ICustomer['province']
  nationality?: ICustomer['nationality']
  description?: string
  projects?: { name: string; url?: string }[]
  pumpModelsUsed?: { name: string; url?: string }[]
  applications?: { name: string; url?: string }[]
  images?: Array<{
    url: string
    alt?: string
    caption?: string
    isPrimary?: boolean
  }>
  featured?: boolean
}

export default models.Customer || model<ICustomer>('Customer', CustomerSchema)