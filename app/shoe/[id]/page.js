'use client'

import { useState, useEffect, use, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../supabase/client'
import { ArrowLeft } from 'lucide-react'

export default function ShoeDetailPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [shoe, setShoe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [isInVault, setIsInVault] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const fetchShoeDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/shoes/${resolvedParams.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Shoe not found')
        }
        throw new Error('Failed to fetch shoe details')
      }
      const data = await response.json()
      setShoe(data)
      setSelectedImage(data.thumbnail)
    } catch (error) {
      console.error('Error fetching shoe details:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  const checkVaultStatus = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data, error } = await supabase
        .from('vault')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('style_id', resolvedParams.id)
        .single()
      
      setIsInVault(!!data)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    fetchShoeDetails()
    checkVaultStatus()
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
            <Image 
              src={selectedImage} 
              alt={shoe?.name || ''}
              fill
              className="object-contain bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="relative aspect-square">
              <Image 
                src={shoe?.thumbnail} 
                alt={shoe?.name || ''}
                fill
                onClick={() => setSelectedImage(shoe.thumbnail)}
                className={`rounded-lg cursor-pointer object-contain bg-gray-50 dark:bg-gray-800 border-2 ${
                  selectedImage === shoe?.thumbnail ? 'border-primary' : 'border-transparent'
                }`}
              />
            </div>
            {shoe?.imageLinks?.slice(0, 3).map((img, index) => (
              <div key={index} className="relative aspect-square">
                <Image 
                  src={img} 
                  alt={`${shoe.name} view ${index + 1}`}
                  fill
                  onClick={() => setSelectedImage(img)}
                  className={`rounded-lg cursor-pointer object-contain bg-gray-50 dark:bg-gray-800 border-2 ${
                    selectedImage === img ? 'border-primary' : 'border-transparent'
                  }`}
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
