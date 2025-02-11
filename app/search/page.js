'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import ShoeCard from '../components/ShoeCard'

// Dynamically import icons with fallback
const Search = dynamic(() => import('lucide-react').then(mod => mod.Search), {
  ssr: false,
  loading: () => <span className="w-5 h-5" />
})

const Loader2 = dynamic(() => import('lucide-react').then(mod => mod.Loader2), {
  ssr: false,
  loading: () => <span className="w-5 h-5" />
})

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Sneaker Vault
        </h1>
        <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg">
          Search for your favorite sneakers and add them to your collection
        </p>
      </div>

      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search for sneakers..."
            className="input input-bordered w-full pl-12 h-14 text-lg focus:ring-2 focus:ring-primary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search sneakers"
          />
          <div className="absolute left-4">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <button
            type="submit"
            className="btn btn-primary ml-2 h-14 px-8"
            disabled={loading}
            aria-label={loading ? 'Searching...' : 'Search'}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
          {results.map((sneaker) => (
            <ShoeCard key={sneaker.styleID} shoe={sneaker} />
          ))}
        </div>
      )}

      {results.length === 0 && !loading && query && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No sneakers found. Try a different search term.</p>
        </div>
      )}
    </div>
  )
}
