/**
 * Build multipart FormData for product create / update.
 * Matches backend product.controller field names.
 */
export function buildProductFormData(fields, { action = 'draft', coverFile = null, galleryFiles = [] } = {}) {
  const formData = new FormData()

  const append = (key, value) => {
    if (value === undefined || value === null) return
    formData.append(key, value)
  }

  append('action', action)
  append('title', fields.title || '')
  append('sku', fields.sku || '')
  append('brand', fields.brand === 'Select brand' ? '' : fields.brand || '')
  append('main_category_id', fields.main_category_id || '')
  append('category_id', fields.category_id || '')
  append('sub_category_id', fields.sub_category_id || '')
  append('short_description', fields.short_description || '')
  append('description', fields.description || '')
  append('price', fields.price ?? '0')
  append('discounted_price', fields.discounted_price ?? '0')
  // Only send stock when the form provides it — otherwise updates wipe inventory to 0.
  if (fields.stock_qty !== undefined && fields.stock_qty !== null && fields.stock_qty !== '') {
    append('stock_qty', String(fields.stock_qty))
  } else if (fields.stock !== undefined && fields.stock !== null && fields.stock !== '') {
    append('stock_qty', String(fields.stock))
  }
  append('stock_status', fields.stock_status || 'In Stock')
  append('manage_stock', String(Boolean(fields.manage_stock)))
  append('allow_backorder', String(Boolean(fields.allow_backorder)))
  append('product_type', fields.product_type || 'physical')
  append('visibility', fields.visibility || 'Visible')
  append('purchase_note', fields.purchase_note || '')
  append('enable_reviews', String(fields.enable_reviews !== false))

  append('meta_title', fields.meta_title || fields.title || '')
  append('meta_description', fields.meta_description || fields.short_description || '')
  append('meta_keywords', fields.meta_keywords || '')
  append('og_title', fields.og_title || fields.meta_title || fields.title || '')
  append('og_description', fields.og_description || fields.meta_description || '')
  append('canonical_url', fields.canonical_url || '')

  append('sizes', JSON.stringify(fields.sizes || []))
  append('colors', JSON.stringify(fields.colors || []))
  append('tags', JSON.stringify(fields.tags || fields.selectedTags || []))

  if (coverFile instanceof File) {
    formData.append('cover_image', coverFile)
  }

  ;(galleryFiles || []).forEach((file) => {
    if (file instanceof File) formData.append('gallery', file)
  })

  return formData
}

export function mapStoreProduct(item) {
  if (!item) return null
  const price = Number(item.effective_price ?? item.discounted_price ?? item.price ?? 0)
  const mrp = Number(item.price ?? item.mrp ?? 0)
  return {
    id: String(item.id),
    slug: item.slug,
    name: item.title || item.name,
    title: item.title || item.name,
    brand: item.brand || '',
    category: item.category_name || item.category?.name || '',
    subcategory: item.sub_category_name || item.subCategory?.name || '',
    price: price > 0 ? price : mrp,
    mrp: mrp > price ? mrp : mrp,
    image: item.cover_image || '',
    images: item.gallery?.length ? item.gallery : item.cover_image ? [item.cover_image] : [],
    sizes: item.sizes || [],
    colors: item.colors || [],
    tags: item.tags || [],
    shortDescription: item.short_description || '',
    description: item.description || '',
    stock: item.stock_qty,
    stockStatus: item.stock_status,
    metaTitle: item.meta_title,
    metaDescription: item.meta_description,
    metaKeywords: item.meta_keywords,
    rating: item.rating || 4.5,
    discount:
      mrp > 0 && price > 0 && mrp > price
        ? `${Math.round(((mrp - price) / mrp) * 100)}%`
        : '',
  }
}
