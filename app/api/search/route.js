import { NextResponse } from 'next/server'
const SneaksAPI = require('sneaks-api')
const sneaks = new SneaksAPI()

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

    return NextResponse.json(products)
  } catch (error) {
    console.error('Sneaks API error:', error)
    return NextResponse.json({ error: 'Failed to fetch sneaker data' }, { status: 500 })
  }
}
