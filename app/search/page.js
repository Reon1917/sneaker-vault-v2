'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import ShoeCard from '../components/ShoeCard'
import { getCachedData, setCachedData } from '../utils/cache'
import { debounce } from '../utils/debounce'

// Dynamically import icons with fallback
const Search = dynamic(() => import('lucide-react').then(mod => mod.Search), {
  ssr: false,
  loading: () => <span className="w-5 h-5" />
})

const Loader2 = dynamic(() => import('lucide-react').then(mod => mod.Loader2), {
  ssr: false,
  loading: () => <span className="w-5 h-5" />
})

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_DELAY = 500;

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const abortControllerRef = useRef(null);

  const performSearch = useCallback(async (searchQuery) => {
    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Check cache first
      const cacheKey = `search_${searchQuery.toLowerCase()}`
      const cachedResults = getCachedData(cacheKey)
      
      if (cachedResults) {
        setResults(cachedResults)
        setLoading(false)
        return
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json()
      
      // Cache the results
      setCachedData(cacheKey, data)
      setResults(data)
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was aborted, do nothing
        return;
      }
      console.error('Search error:', error)
      setResults([]);
    } finally {
      setLoading(false)
    }
  }, []);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => performSearch(value), DEBOUNCE_DELAY),
    [performSearch]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

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

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search for sneakers..."
            className="input input-bordered w-full pl-12 h-14 text-lg focus:ring-2 focus:ring-primary"
            value={query}
            onChange={handleInputChange}
            aria-label="Search sneakers"
            minLength={MIN_QUERY_LENGTH}
          />
          <div className="absolute left-4">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <button
            type="submit"
            className="btn btn-primary ml-2 h-14 px-8"
            disabled={loading || query.length < MIN_QUERY_LENGTH}
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

      {results.length === 0 && !loading && query.length >= MIN_QUERY_LENGTH && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No sneakers found. Try a different search term.</p>
        </div>
      )}
    </div>
  )
}
