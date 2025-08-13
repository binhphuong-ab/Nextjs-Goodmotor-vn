import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Product, { IProductInput } from '@/models/Product'
import Brand from '@/models/Brand'
import PumpType from '@/models/PumpType'
import connectToDatabase from '@/lib/mongoose'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params
    
    await connectToDatabase()
    
    let product
    try {
      product = await Product.findById(id)
        .populate('brand', 'name country productLines')
        .populate('pumpType', 'pumpType')
    } catch (populateError) {
      console.warn('Population failed for product, fetching without population:', populateError)
      product = await Product.findById(id)
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params
    const updateData: IProductInput = await request.json()
    
    await connectToDatabase()
    
    // Get the original product to compare pump type changes
    const originalProduct = await Product.findById(id)
    if (!originalProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Check if slug already exists for a different product
    if (updateData.slug) {
      const existingProduct = await Product.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: id } 
      })
      if (existingProduct) {
      return NextResponse.json(
          { error: 'Product slug already exists' },
        { status: 400 }
      )
    }
    }
    
    let product = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    // AUTOMATIC USAGE TRACKING UPDATE ON PRODUCT MODIFICATION
    // This is the most complex part of usage tracking because we need to handle
    // multiple scenarios when a product is updated:
    // 1. Moving between pump types/brands (remove from old, add to new)
    // 2. Changing sub pump type/product line within same parent
    // 3. Renaming product (update name references everywhere)
    // 4. Multiple changes simultaneously
    try {
      const originalPumpTypeId = originalProduct.pumpType?.toString()
      const newPumpTypeId = updateData.pumpType
      const originalSubPumpTypeId = originalProduct.subPumpType?.toString()
      const newSubPumpTypeId = updateData.subPumpType
      const originalBrandId = originalProduct.brand?.toString()
      const newBrandId = updateData.brand
      const originalProductLineId = originalProduct.productLineId
      const newProductLineId = updateData.productLineId
      const originalName = originalProduct.name
      const newName = updateData.name
      
      // Handle pump type changes - most complex scenario
      if (originalPumpTypeId !== newPumpTypeId) {
        // Remove from old pump type
        if (originalPumpTypeId) {
          const oldPumpType = await PumpType.findById(originalPumpTypeId)
          if (oldPumpType) {
            // Remove product name from productUsage array
            oldPumpType.productUsage = oldPumpType.productUsage.filter((name: string) => name !== originalName)
            
            // Remove from subPumpTypeUsage if applicable
            if (originalSubPumpTypeId && oldPumpType.subPumpTypeUsage) {
              const subUsage = oldPumpType.subPumpTypeUsage.get(originalSubPumpTypeId) || []
              oldPumpType.subPumpTypeUsage.set(
                originalSubPumpTypeId, 
                subUsage.filter((name: string) => name !== originalName)
              )
            }
            
            await oldPumpType.save()
          }
        }
        
        // Add to new pump type
        if (newPumpTypeId) {
          const newPumpType = await PumpType.findById(newPumpTypeId)
          if (newPumpType) {
            // Add product name to productUsage array (avoid duplicates)
            if (!newPumpType.productUsage.includes(newName)) {
              newPumpType.productUsage.push(newName)
            }
            
            // Add to subPumpTypeUsage if applicable
            if (newSubPumpTypeId) {
              if (!newPumpType.subPumpTypeUsage) {
                newPumpType.subPumpTypeUsage = new Map()
              }
              const currentUsage = newPumpType.subPumpTypeUsage.get(newSubPumpTypeId) || []
              if (!currentUsage.includes(newName)) {
                currentUsage.push(newName)
                newPumpType.subPumpTypeUsage.set(newSubPumpTypeId, currentUsage)
              }
            }
            
            await newPumpType.save()
          }
        }
      } else if (originalPumpTypeId && (originalSubPumpTypeId !== newSubPumpTypeId || originalName !== newName)) {
        // Same pump type, but sub pump type or name changed
        // This handles the more common scenario of minor edits within the same pump type
        const pumpType = await PumpType.findById(originalPumpTypeId)
        if (pumpType) {
          // Update product name in productUsage array if name changed
          if (originalName !== newName) {
            const nameIndex = pumpType.productUsage.indexOf(originalName)
            if (nameIndex > -1) {
              pumpType.productUsage[nameIndex] = newName
            }
          }
          
          // Handle sub pump type change within same pump type
          if (originalSubPumpTypeId !== newSubPumpTypeId) {
            if (!pumpType.subPumpTypeUsage) {
              pumpType.subPumpTypeUsage = new Map()
            }
            
            // Remove from old sub pump type
            if (originalSubPumpTypeId) {
              const oldSubUsage = pumpType.subPumpTypeUsage.get(originalSubPumpTypeId) || []
              pumpType.subPumpTypeUsage.set(
                originalSubPumpTypeId, 
                oldSubUsage.filter((name: string) => name !== originalName)
              )
            }
            
            // Add to new sub pump type
            if (newSubPumpTypeId) {
              const newSubUsage = pumpType.subPumpTypeUsage.get(newSubPumpTypeId) || []
              if (!newSubUsage.includes(newName)) {
                newSubUsage.push(newName)
                pumpType.subPumpTypeUsage.set(newSubPumpTypeId, newSubUsage)
              }
            }
          } else if (originalSubPumpTypeId && originalName !== newName) {
            // Same sub pump type, but name changed
            const subUsage = pumpType.subPumpTypeUsage?.get(originalSubPumpTypeId) || []
            const nameIndex = subUsage.indexOf(originalName)
            if (nameIndex > -1) {
              subUsage[nameIndex] = newName
              pumpType.subPumpTypeUsage?.set(originalSubPumpTypeId, subUsage)
            }
          }
          
          await pumpType.save()
        }
      }
      
      // Handle brand changes
      if (originalBrandId !== newBrandId) {
        // Remove from old brand
        if (originalBrandId) {
          const oldBrand = await Brand.findById(originalBrandId)
          if (oldBrand) {
            oldBrand.productUsage = oldBrand.productUsage.filter((name: string) => name !== originalName)
            
            // Remove from productLineUsage if applicable
            if (originalProductLineId && oldBrand.productLineUsage) {
              const lineUsage = oldBrand.productLineUsage.get(originalProductLineId) || []
              oldBrand.productLineUsage.set(
                originalProductLineId, 
                lineUsage.filter((name: string) => name !== originalName)
              )
            }
            
            await oldBrand.save()
          }
        }
        
        // Add to new brand
        if (newBrandId) {
          const newBrand = await Brand.findById(newBrandId)
          if (newBrand) {
            if (!newBrand.productUsage.includes(newName)) {
              newBrand.productUsage.push(newName)
            }
            
            // Add to productLineUsage if applicable
            if (newProductLineId) {
              if (!newBrand.productLineUsage) {
                newBrand.productLineUsage = new Map()
              }
              const currentUsage = newBrand.productLineUsage.get(newProductLineId) || []
              if (!currentUsage.includes(newName)) {
                currentUsage.push(newName)
                newBrand.productLineUsage.set(newProductLineId, currentUsage)
              }
            }
            
            await newBrand.save()
          }
        }
      } else if (originalBrandId && (originalProductLineId !== newProductLineId || originalName !== newName)) {
        // Same brand, but product line or name changed
        const brand = await Brand.findById(originalBrandId)
        if (brand) {
          // Update product name in productUsage array
          if (originalName !== newName) {
            const nameIndex = brand.productUsage.indexOf(originalName)
            if (nameIndex > -1) {
              brand.productUsage[nameIndex] = newName
            }
          }
          
          // Handle product line change
          if (originalProductLineId !== newProductLineId) {
            if (!brand.productLineUsage) {
              brand.productLineUsage = new Map()
            }
            
            // Remove from old product line
            if (originalProductLineId) {
              const oldLineUsage = brand.productLineUsage.get(originalProductLineId) || []
              brand.productLineUsage.set(
                originalProductLineId, 
                oldLineUsage.filter((name: string) => name !== originalName)
              )
            }
            
            // Add to new product line
            if (newProductLineId) {
              const newLineUsage = brand.productLineUsage.get(newProductLineId) || []
              if (!newLineUsage.includes(newName)) {
                newLineUsage.push(newName)
                brand.productLineUsage.set(newProductLineId, newLineUsage)
              }
            }
          } else if (originalProductLineId && originalName !== newName) {
            // Same product line, but name changed
            const lineUsage = brand.productLineUsage?.get(originalProductLineId) || []
            const nameIndex = lineUsage.indexOf(originalName)
            if (nameIndex > -1) {
              lineUsage[nameIndex] = newName
              brand.productLineUsage?.set(originalProductLineId, lineUsage)
            }
          }
          
          await brand.save()
        }
      }
    } catch (usageError) {
      console.warn('Failed to update usage tracking:', usageError)
      // Don't fail the product update if usage tracking fails
    }
    
    // Try to populate brand and pumpType if possible
    try {
      product = await product?.populate([
        { path: 'brand', select: 'name country productLines' },
        { path: 'pumpType', select: 'pumpType' }
      ])
    } catch (populateError) {
      console.warn('Population failed after update, returning without population:', populateError)
      // product already has the updated data, just without population
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params
    
    await connectToDatabase()
    
    // Get the product details before deletion for usage tracking
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // AUTOMATIC USAGE TRACKING CLEANUP ON PRODUCT DELETION
    // When a product is deleted, we must remove all references to it
    // from the usage tracking systems to keep counts accurate.
    // This prevents "ghost" references to deleted products.
    try {
      // Remove from pump type usage tracking
      if (product.pumpType) {
        const pumpType = await PumpType.findById(product.pumpType)
        if (pumpType) {
          // Remove product name from productUsage array
          pumpType.productUsage = pumpType.productUsage.filter((name: string) => name !== product.name)
          
          // Remove from subPumpTypeUsage if product was using a sub pump type
          if (product.subPumpType && pumpType.subPumpTypeUsage) {
            const subUsage = pumpType.subPumpTypeUsage.get(product.subPumpType.toString()) || []
            pumpType.subPumpTypeUsage.set(
              product.subPumpType.toString(),
              subUsage.filter((name: string) => name !== product.name)
            )
          }
          
          await pumpType.save()
        }
      }
      
      // Remove from brand usage tracking
      if (product.brand) {
        const brand = await Brand.findById(product.brand)
        if (brand) {
          // Remove product name from productUsage array
          brand.productUsage = brand.productUsage.filter((name: string) => name !== product.name)
          
          // Remove from productLineUsage if product was using a product line
          if (product.productLineId && brand.productLineUsage) {
            const lineUsage = brand.productLineUsage.get(product.productLineId) || []
            brand.productLineUsage.set(
              product.productLineId,
              lineUsage.filter((name: string) => name !== product.name)
            )
          }
          
          await brand.save()
        }
      }
    } catch (usageError) {
      console.warn('Failed to update usage tracking on delete:', usageError)
      // Don't fail the product deletion if usage tracking fails
      // Usage tracking can be rebuilt using the sync utility if needed
    }
    
    // Delete the product
    await Product.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
} 