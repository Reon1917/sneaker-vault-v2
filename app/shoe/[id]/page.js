'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../supabase/client'

export default function ShoeDetailPage({ params }) {
  const [shoe, setShoe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isInVault, setIsInVault] = useState(false)

  useEffect(() => {
    fetchShoeDetails()
    checkVaultStatus()
  }, [])

  const fetchShoeDetails = async () => {
    try {
      const response = await fetch(`/api/shoes/${params.id}`)
      const data = await response.json()
      setShoe(data)
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
            retail_price: shoe.retailPrice
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
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <img 
            src={shoe.thumbnail} 
            alt={shoe.name}
            className="w-full rounded-lg shadow-lg"
          />
          <div className="grid grid-cols-3 gap-2">
            {shoe.imageLinks?.slice(0, 3).map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`${shoe.name} view ${index + 1}`}
                className="w-full rounded-md shadow"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{shoe.name}</h1>
          <p className="text-xl">{shoe.brand}</p>
          
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-title">Retail Price</div>
              <div className="stat-value">${shoe.retailPrice}</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Release Date</div>
              <div className="stat-value">{new Date(shoe.releaseDate).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Description</h3>
            <p className="text-gray-600">{shoe.description || 'No description available'}</p>
          </div>

          <button 
            className={`btn btn-primary w-full ${isInVault ? 'btn-disabled' : ''}`}
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
