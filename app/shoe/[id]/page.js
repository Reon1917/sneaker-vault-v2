'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../supabase/client'

export default function ShoeDetailPage({ params }) {
  const [shoe, setShoe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isInVault, setIsInVault] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchShoeDetails()
    checkVaultStatus()
  }, [])

  const fetchShoeDetails = async () => {
    try {
      const response = await fetch(`/api/shoes/${params.id}`)
      const data = await response.json()
      setShoe(data)
      setSelectedImage(data.thumbnail)
    } catch (error) {
      console.error('Error fetching shoe details:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkVaultStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data, error } = await supabase
        .from('vault')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('style_id', params.id)
        .single()
      
      setIsInVault(!!data)
    }
  }

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
    return <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg"></span></div>
  }

  if (!shoe) {
    return <div className="text-center p-8">Shoe not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-6">
          <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
            <img 
              src={selectedImage} 
              alt={shoe.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <img 
              src={shoe.thumbnail} 
              alt={shoe.name}
              onClick={() => setSelectedImage(shoe.thumbnail)}
              className={`w-full aspect-square rounded-lg cursor-pointer object-cover border-2 ${selectedImage === shoe.thumbnail ? 'border-primary' : 'border-transparent'}`}
            />
            {shoe.imageLinks?.slice(0, 3).map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`${shoe.name} view ${index + 1}`}
                onClick={() => setSelectedImage(img)}
                className={`w-full aspect-square rounded-lg cursor-pointer object-cover border-2 ${selectedImage === img ? 'border-primary' : 'border-transparent'}`}
              />
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{shoe.name}</h1>
            <p className="text-2xl text-gray-600">{shoe.brand}</p>
            <p className="text-lg text-gray-500 mt-2">{shoe.colorway}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Retail Price</div>
              <div className="stat-value">${shoe.retailPrice || 'N/A'}</div>
            </div>
            
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Release Date</div>
              <div className="stat-value text-2xl">
                {shoe.releaseDate ? new Date(shoe.releaseDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Description</h3>
            <p className="text-gray-600">{shoe.description || 'No description available'}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Resell Prices</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(shoe.resellPrices || {}).map(([platform, price]) => (
                price && (
                  <a
                    key={platform}
                    href={shoe.resellLinks[platform]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stat bg-base-200 rounded-box hover:bg-base-300 transition-colors"
                  >
                    <div className="stat-title capitalize">{platform}</div>
                    <div className="stat-value text-xl">${price}</div>
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
