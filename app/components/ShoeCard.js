'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Check, Trash, FolderClosed } from 'lucide-react'
import CollectionModal from './CollectionModal'

const showToast = (message, type = 'info') => {
  // Using DaisyUI's toast
  const toast = document.getElementById('toast')
  if (toast) {
    const alert = document.createElement('div')
    alert.className = `alert ${type === 'error' ? 'alert-error' : type === 'success' ? 'alert-success' : 'alert-info'}`
    alert.innerHTML = `<span>${message}</span>`
    toast.appendChild(alert)
    setTimeout(() => alert.remove(), 3000)
  }
}

export default function ShoeCard({ shoe, showVaultControls = true }) {
  const [saving, setSaving] = useState(false)
  const [isInVault, setIsInVault] = useState(false)
  const [user, setUser] = useState(null)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
      showToast('Please sign in to add shoes to your vault', 'error')
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
          showToast('This shoe is already in your vault', 'error')
        } else {
          console.error('Error adding to vault:', error)
          showToast('Failed to add to vault. Please try again.', 'error')
        }
        return
      }
      
      setIsInVault(true)
      showToast('Added to vault successfully!', 'success')
    } catch (error) {
      console.error('Error adding to vault:', error)
      showToast('Failed to add to vault. Please try again.', 'error')
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
        showToast('Failed to remove from vault. Please try again.', 'error')
        return
      }

      setIsInVault(false)
      showToast('Removed from vault successfully!', 'success')
    } catch (error) {
      console.error('Error removing from vault:', error)
      showToast('Failed to remove from vault. Please try again.', 'error')
    } finally {
      setSaving(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className="card bg-base-100 dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-shadow h-full flex flex-col">
        <figure className="relative px-4 pt-4">
          <Link href={`/shoe/${shoe.styleID}`} className="w-full">
            <div className="relative w-full h-56">
              <Image
                src={shoe.thumbnail}
                alt={shoe.shoeName || shoe.name}
                width={400}
                height={400}
                className="rounded-xl object-contain bg-gray-50 dark:bg-gray-900 w-full h-full"
                priority={true}
                onError={(e) => {
                  console.error('Image load error:', e)
                  e.target.style.display = 'none'
                }}
              />
            </div>
          </Link>
        </figure>
        <div className="card-body pt-4 flex flex-col flex-1">
          <Link href={`/shoe/${shoe.styleID}`}>
            <h2 className="card-title text-lg font-bold line-clamp-2 hover:text-primary transition-colors text-gray-900 dark:text-gray-100">
              {shoe.shoeName || shoe.name}
            </h2>
          </Link>
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{shoe.brand}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{shoe.colorway}</p>
            {shoe.releaseDate && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Released: {new Date(shoe.releaseDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              ${shoe.retailPrice || 'N/A'}
            </p>
          </div>
          {showVaultControls && (
            <div className="card-actions justify-end mt-auto pt-4 flex flex-col gap-2">
              {isInVault ? (
                <>
                  <button
                    className="btn btn-outline btn-primary w-full gap-2 dark:text-gray-100 dark:hover:text-primary-content"
                    onClick={() => {
                      setShowCollectionModal(true)
                      showToast('Select a collection to add this shoe', 'info')
                    }}
                    disabled={saving}
                  >
                    <FolderClosed size={18} />
                    Add to Collection
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn btn-ghost text-error w-full gap-2 hover:bg-error/10 dark:hover:bg-error/20"
                    disabled={saving}
                  >
                    <Trash size={18} />
                    Remove from Vault
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary w-full gap-2 dark:hover:brightness-110"
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

      <CollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        shoe={shoe}
        onSuccess={() => {
          showToast('Added to collection successfully!', 'success')
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(false)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-base-100 dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="px-4 pb-4 pt-5 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Remove from Vault</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to remove this shoe from your vault? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn btn-ghost"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveFromVault}
                    className="btn btn-error"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      'Remove'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 