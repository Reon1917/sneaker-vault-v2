import { NextResponse } from 'next/server'
const SneaksAPI = require('sneaks-api')
const sneaks = new SneaksAPI()

// Cache search results for 24 hours
export const revalidate = 86400

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const products = await new Promise((resolve, reject) => {
      sneaks.getProducts(query, 10, (err, products) => {
        if (err) reject(err)
        else resolve(products)
      })
    })

    // Cache the response
    const response = NextResponse.json(products)
    response.headers.set('Cache-Control', 'public, s-maxage=86400')
    return response
  } catch (error) {
    console.error('Sneaks API error:', error)
    return NextResponse.json({ error: 'Failed to fetch sneaker data' }, { status: 500 })
  }
}
