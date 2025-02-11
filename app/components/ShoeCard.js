'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Check, Trash, FolderClosed } from 'lucide-react'

export default function ShoeCard({ shoe, showVaultControls = true }) {
  const [saving, setSaving] = useState(false)
  const [isInVault, setIsInVault] = useState(false)
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  const checkVaultStatus = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('user_id', userId)
        .eq('sneaker_id', shoe.styleID)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking vault status:', error)
      }
      setIsInVault(!!data)
    } catch (error) {
      console.error('Error checking vault status:', error)
    }
  }, [supabase, shoe.styleID])

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(session?.user || null)
        if (session?.user) {
          checkVaultStatus(session.user.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        checkVaultStatus(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, checkVaultStatus])

  const handleAddToVault = async () => {
    if (!user) {
      alert('Please sign in to add shoes to your vault')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('vault_items')
        .insert([
          {
            user_id: user.id,
            sneaker_id: shoe.styleID,
            name: shoe.shoeName || shoe.name,
            brand: shoe.brand,
            thumbnail: shoe.thumbnail
          }
        ])

      if (error) {
        if (error.code === '23505') {
          alert('This shoe is already in your vault')
        } else {
          console.error('Error adding to vault:', error)
          alert('Failed to add to vault. Please try again.')
        }
        return
      }
      
      setIsInVault(true)
      alert('Added to vault successfully!')
    } catch (error) {
      console.error('Error adding to vault:', error)
      alert('Failed to add to vault. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveFromVault = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('vault_items')
        .delete()
        .eq('user_id', user.id)
        .eq('sneaker_id', shoe.styleID)

      if (error) {
        console.error('Error removing from vault:', error)
        alert('Failed to remove from vault. Please try again.')
        return
      }

      setIsInVault(false)
      alert('Removed from vault successfully!')
    } catch (error) {
      console.error('Error removing from vault:', error)
      alert('Failed to remove from vault. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
      <figure className="relative px-4 pt-4">
        <Link href={`/shoe/${shoe.styleID}`}>
          <div className="relative w-full h-56">
            <Image
              src={shoe.thumbnail}
              alt={shoe.shoeName || shoe.name}
              width={400}
              height={400}
              className="rounded-xl object-contain bg-gray-50 w-full h-full"
              priority={true}
              onError={(e) => {
                console.error('Image load error:', e)
                e.target.style.display = 'none'
              }}
            />
          </div>
        </Link>
      </figure>
      <div className="card-body pt-4">
        <Link href={`/shoe/${shoe.styleID}`}>
          <h2 className="card-title text-lg font-bold line-clamp-2 hover:text-primary transition-colors">
            {shoe.shoeName || shoe.name}
          </h2>
        </Link>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{shoe.brand}</p>
          <p className="text-sm text-gray-500">{shoe.colorway}</p>
          {shoe.releaseDate && (
            <p className="text-sm text-gray-500">
              Released: {new Date(shoe.releaseDate).toLocaleDateString()}
            </p>
          )}
          <p className="text-lg font-semibold">
            ${shoe.retailPrice || 'N/A'}
          </p>
        </div>
        {showVaultControls && (
          <div className="card-actions justify-end mt-4">
            {isInVault ? (
              <div className="flex gap-2 w-full">
                <button
                  className="btn btn-outline btn-primary flex-1"
                  onClick={() => {}}
                  disabled={saving}
                >
                  <FolderClosed size={18} />
                  Add to Collection
                </button>
                <button
                  className="btn btn-ghost text-error"
                  onClick={handleRemoveFromVault}
                  disabled={saving}
                >
                  <Trash size={18} />
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary w-full"
                onClick={handleAddToVault}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <Plus size={18} />
                    Add to Vault
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 