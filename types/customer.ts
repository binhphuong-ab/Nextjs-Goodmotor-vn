import { ICustomer } from '@/models/Customer'
import { IIndustry } from '@/models/Industry'

// Customer with populated industry field (for frontend display)
export interface ICustomerPopulated extends Omit<ICustomer, 'industry' | 'createdAt' | 'updatedAt'> {
  industry?: IIndustry[]
  createdAt: string  // Dates come as strings from API
  updatedAt: string
}

// Customer with either populated or unpopulated industry (for API responses)
export interface ICustomerWithIndustry extends Omit<ICustomer, 'industry' | 'createdAt' | 'updatedAt'> {
  industry?: (string | IIndustry)[]
  createdAt: string
  updatedAt: string
}

// Union type for components that handle both cases
export type CustomerDisplay = ICustomerPopulated | ICustomerWithIndustry

// Business type constants (single source of truth)
export const BUSINESS_TYPES = [
  { value: 'Machinary service' as const, label: 'Machinary service' },
  { value: 'Nhà chế tạo máy' as const, label: 'Nhà chế tạo máy' },
  { value: 'Nhà máy Việt Nam' as const, label: 'Nhà máy Việt Nam' },
  { value: 'Nhà máy nước ngoài' as const, label: 'Nhà máy nước ngoài' },
  { value: 'Xưởng sản xuất' as const, label: 'Xưởng sản xuất' }
] as const

// Province constants (single source of truth)
export const PROVINCES = [
  { value: 'TP Ho Chi Minh' as const, label: 'TP Hồ Chí Minh' },
  { value: 'TP Hà Nội' as const, label: 'TP Hà Nội' },
  { value: 'TP Đà Nẵng' as const, label: 'TP Đà Nẵng' },
  { value: 'TP Huế' as const, label: 'TP Huế' },
  { value: 'Quảng Ninh' as const, label: 'Quảng Ninh' },
  { value: 'Cao Bằng' as const, label: 'Cao Bằng' },
  { value: 'Lạng Sơn' as const, label: 'Lạng Sơn' },
  { value: 'Lai Châu' as const, label: 'Lai Châu' },
  { value: 'Điện Biên' as const, label: 'Điện Biên' },
  { value: 'Sơn La' as const, label: 'Sơn La' },
  { value: 'Thanh Hóa' as const, label: 'Thanh Hóa' },
  { value: 'Nghệ An' as const, label: 'Nghệ An' },
  { value: 'Hà Tĩnh' as const, label: 'Hà Tĩnh' },
  { value: 'Tuyên Quang' as const, label: 'Tuyên Quang' },
  { value: 'Lào Cai' as const, label: 'Lào Cai' },
  { value: 'Thái Nguyên' as const, label: 'Thái Nguyên' },
  { value: 'Phú Thọ' as const, label: 'Phú Thọ' },
  { value: 'Bắc Ninh' as const, label: 'Bắc Ninh' },
  { value: 'Hưng Yên' as const, label: 'Hưng Yên' },
  { value: 'TP Hải Phòng' as const, label: 'TP Hải Phòng' },
  { value: 'Ninh Bình' as const, label: 'Ninh Bình' },
  { value: 'Quảng Trị' as const, label: 'Quảng Trị' },
  { value: 'Quảng Ngãi' as const, label: 'Quảng Ngãi' },
  { value: 'Gia Lai' as const, label: 'Gia Lai' },
  { value: 'Khánh Hòa' as const, label: 'Khánh Hòa' },
  { value: 'Lâm Đồng' as const, label: 'Lâm Đồng' },
  { value: 'Đắk Lắk' as const, label: 'Đắk Lắk' },
  { value: 'Đồng Nai' as const, label: 'Đồng Nai' },
  { value: 'Tây Ninh' as const, label: 'Tây Ninh' },
  { value: 'TP Cần Thơ' as const, label: 'TP Cần Thơ' },
  { value: 'Vĩnh Long' as const, label: 'Vĩnh Long' },
  { value: 'Đồng Tháp' as const, label: 'Đồng Tháp' },
  { value: 'Cà Mau' as const, label: 'Cà Mau' },
  { value: 'An Giang' as const, label: 'An Giang' }
] as const

// Country constants (single source of truth)
export const COUNTRIES = [
  { value: 'Việt Nam' as const, label: 'Việt Nam' },
  { value: 'Nhật Bản' as const, label: 'Nhật Bản' },
  { value: 'Hàn Quốc' as const, label: 'Hàn Quốc' },
  { value: 'Trung Quốc' as const, label: 'Trung Quốc' },
  { value: 'Đài Loan' as const, label: 'Đài Loan' },
  { value: 'Mỹ' as const, label: 'Mỹ' },
  { value: 'EU' as const, label: 'EU' },
  { value: 'Thái Lan' as const, label: 'Thái Lan' },
  { value: 'Other' as const, label: 'Other' }
] as const
