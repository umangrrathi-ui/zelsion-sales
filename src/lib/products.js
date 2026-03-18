// Product catalog management
// Products are stored in localStorage and can be managed via Settings > Manage Products
// Default products are the standard Zelsion MCC product line

const STORAGE_KEY = 'zelsion_products'

const DEFAULT_PRODUCTS = [
  'MCC PH 101',
  'MCC PH 102',
  'MCC PH 112',
  'MCC PH 200',
  'MCC PH 301',
  'MCC PH 302',
]

export function getProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    // ignore parse errors
  }
  return [...DEFAULT_PRODUCTS]
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

export function addProduct(name) {
  const trimmed = name.trim()
  if (!trimmed) return false
  const products = getProducts()
  if (products.some(p => p.toLowerCase() === trimmed.toLowerCase())) return false
  products.push(trimmed)
  products.sort()
  saveProducts(products)
  return true
}

export function removeProduct(name) {
  const products = getProducts().filter(p => p !== name)
  saveProducts(products)
  return products
}

// Parse order items from product_name field
// Supports: plain text "MCC PH 101", comma-separated "MCC PH 101, MCC PH 102"
// and JSON format [{"name":"MCC PH 101","qty":500}]
export function parseOrderItems(productName, quantityKg) {
  if (!productName) return []

  // Try JSON format first
  try {
    if (productName.startsWith('[')) {
      const items = JSON.parse(productName)
      if (Array.isArray(items)) return items
    }
  } catch (e) {
    // not JSON, continue
  }

  // Plain text - single product
  return [{ name: productName, qty: quantityKg || '' }]
}

// Format order items for storage in product_name field
export function formatOrderItems(items) {
  if (!items || items.length === 0) return { product_name: '', quantity_kg: null }

  if (items.length === 1) {
    const qty = items[0].qty ? parseFloat(items[0].qty) : null
    return {
      product_name: items[0].name,
      quantity_kg: (qty && !isNaN(qty)) ? qty : null
    }
  }

  // Multiple items - store as JSON
  const totalQty = items.reduce((sum, i) => sum + (parseFloat(i.qty) || 0), 0)
  return {
    product_name: JSON.stringify(items.map(i => ({ name: i.name, qty: i.qty || '' }))),
    quantity_kg: totalQty > 0 ? totalQty : null
  }
}

// Get display text for product items
export function getProductDisplay(productName) {
  if (!productName) return '---'

  try {
    if (productName.startsWith('[')) {
      const items = JSON.parse(productName)
      if (Array.isArray(items)) {
        return items.map(i => i.qty ? `${i.name} (${i.qty} kg)` : i.name).join(', ')
      }
    }
  } catch (e) {
    // not JSON
  }

  return productName
}

// Get short display (just product names, no quantities)
export function getProductNames(productName) {
  if (!productName) return '---'

  try {
    if (productName.startsWith('[')) {
      const items = JSON.parse(productName)
      if (Array.isArray(items)) {
        return items.map(i => i.name).join(', ')
      }
    }
  } catch (e) {
    // not JSON
  }

  return productName
}
