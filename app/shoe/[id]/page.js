'use client'

import { useState, useEffect, use, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase/client'
import { ArrowLeft } from 'lucide-react'
import { getCachedData, setCachedData } from '../../utils/cache'

const VAULT_STATUS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function ShoeDetailPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [shoe, setShoe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isInVault, setIsInVault] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const abortControllerRef = useRef(null);
  const lastVaultCheckRef = useRef(0);

  const fetchShoeDetails = useCallback(async () => {
    try {
      // Check cache first
      const cacheKey = `shoe_${resolvedParams.id}`
      const cachedData = getCachedData(cacheKey)
      
      if (cachedData) {
        setShoe(cachedData)
        setSelectedImage(cachedData.thumbnail)
        setLoading(false)
        return
      }

      // Cancel previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch(
        `/api/shoes/${resolvedParams.id}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Shoe not found')
        }
        throw new Error('Failed to fetch shoe details')
      }

      const data = await response.json()
      
      // Cache the results
      setCachedData(cacheKey, data)
      setShoe(data)
      setSelectedImage(data.thumbnail)
    } catch (error) {
      if (error.name === 'AbortError') {
        // Request was aborted, do nothing
        return;
      }
      console.error('Error fetching shoe details:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  const checkVaultStatus = useCallback(async () => {
    const now = Date.now();
    // Only check vault status every 5 minutes unless forced
    if (now - lastVaultCheckRef.current < VAULT_STATUS_CACHE_DURATION) {
      return;
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const cacheKey = `vault_status_${session.user.id}_${resolvedParams.id}`;
      const cachedStatus = getCachedData(cacheKey);

      if (cachedStatus !== null) {
        setIsInVault(cachedStatus);
        return;
      }

      const { data, error } = await supabase
        .from('vault')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('style_id', resolvedParams.id)
        .single()
      
      const status = !!data;
      setIsInVault(status);
      setCachedData(cacheKey, status);
      lastVaultCheckRef.current = now;
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchShoeDetails()
    checkVaultStatus()

    return () => {
      // Cleanup: abort any ongoing requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchShoeDetails, checkVaultStatus])

  const handleAddToVault = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      alert('Please sign in to add shoes to your vault')
      setSaving(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('vault')
        .insert([
          {
            user_id: session.user.id,
            style_id: shoe.styleID,
            name: shoe.name,
            brand: shoe.brand,
            image_url: shoe.thumbnail,
            retail_price: shoe.retailPrice,
            colorway: shoe.colorway
          }
        ])

      if (error) throw error
      setIsInVault(true)
      alert('Added to vault!')
    } catch (error) {
      console.error('Error adding to vault:', error)
      alert('Failed to add to vault')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="btn btn-ghost mb-6 gap-2"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  if (error || !shoe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => router.back()}
          className="btn btn-ghost mb-6 gap-2"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="bg-base-200 dark:bg-base-300 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">
              {error === 'Shoe not found' ? 'Shoe Not Found' : 'Error Loading Shoe'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error === 'Shoe not found' 
                ? "The shoe you're looking for could not be found. It may have been removed or is temporarily unavailable."
                : "There was an error loading the shoe details. Please try again later."}
            </p>
            <button 
              onClick={() => router.back()}
              className="btn btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <button 
        onClick={() => router.back()}
        className="btn btn-ghost mb-6 gap-2"
      >
        <ArrowLeft size={20} />
        Back to Search
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-6">
          <div className="aspect-square rounded-xl overflow-hidden shadow-lg relative">
            <img 
              src={selectedImage} 
              alt={shoe?.name || ''}
              className="object-contain bg-gray-50 dark:bg-gray-800 w-full h-full"
              loading="eager"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="relative aspect-square">
              <img 
                src={shoe?.thumbnail} 
                alt={shoe?.name || ''}
                onClick={() => setSelectedImage(shoe.thumbnail)}
                className={`rounded-lg cursor-pointer object-contain bg-gray-50 dark:bg-gray-800 border-2 w-full h-full ${
                  selectedImage === shoe?.thumbnail ? 'border-primary' : 'border-transparent'
                }`}
                loading="lazy"
              />
            </div>
            {shoe?.imageLinks?.slice(0, 3).map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img 
                  src={img} 
                  alt={`${shoe.name} view ${index + 1}`}
                  onClick={() => setSelectedImage(img)}
                  className={`rounded-lg cursor-pointer object-contain bg-gray-50 dark:bg-gray-800 border-2 w-full h-full ${
                    selectedImage === img ? 'border-primary' : 'border-transparent'
                  }`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 dark:text-gray-100">{shoe.name}</h1>
            <p className="text-2xl text-gray-600 dark:text-gray-400">{shoe.brand}</p>
            <p className="text-lg text-gray-500 dark:text-gray-500 mt-2">{shoe.colorway}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="stat bg-base-200 dark:bg-base-300 rounded-box">
              <div className="stat-title dark:text-gray-400">Retail Price</div>
              <div className="stat-value dark:text-gray-100">${shoe.retailPrice || 'N/A'}</div>
            </div>
            
            <div className="stat bg-base-200 dark:bg-base-300 rounded-box">
              <div className="stat-title dark:text-gray-400">Release Date</div>
              <div className="stat-value text-2xl dark:text-gray-100">
                {shoe.releaseDate ? new Date(shoe.releaseDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold dark:text-gray-100">Description</h3>
            <p className="text-gray-600 dark:text-gray-400">{shoe.description || 'No description available'}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold dark:text-gray-100">Resell Prices</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(shoe.resellPrices || {}).map(([platform, price]) => (
                price && (
                  <a
                    key={platform}
                    href={shoe.resellLinks[platform]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stat bg-base-200 dark:bg-base-300 rounded-box hover:bg-base-300 dark:hover:bg-base-200 transition-colors"
                  >
                    <div className="stat-title capitalize dark:text-gray-400">{platform}</div>
                    <div className="stat-value text-xl dark:text-gray-100">${price}</div>
                  </a>
                )
              ))}
            </div>
          </div>

          <button 
            className={`btn btn-primary btn-lg w-full ${isInVault ? 'btn-disabled' : ''}`}
            onClick={handleAddToVault}
            disabled={saving || isInVault}
          >
            {saving ? <span className="loading loading-spinner"></span> :
             isInVault ? 'In Your Vault' : 'Add to Vault'}
          </button>
        </div>
      </div>
    </div>
  )
}
