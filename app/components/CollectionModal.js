'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, X, Trash } from 'lucide-react'

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

export default function CollectionModal({ isOpen, onClose, shoe, onSuccess }) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchCollections = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching collections:', error)
        showToast('Failed to load collections', 'error')
        return
      }

      setCollections(data || [])
      setLoading(false)
    }

    if (isOpen) {
      fetchCollections()
    }
  }, [supabase, isOpen])

  const handleCreateCollection = async (e) => {
    e.preventDefault()
    if (!newCollectionName.trim()) return

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('collections')
        .insert([
          {
            name: newCollectionName,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setCollections([...collections, data])
      setNewCollectionName('')
      setSelectedCollection(data.id)
      showToast('Collection created successfully!', 'success')
    } catch (error) {
      console.error('Error creating collection:', error)
      showToast('Failed to create collection. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCollection = async (collectionId) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)

      if (error) throw error

      setCollections(collections.filter(c => c.id !== collectionId))
      if (selectedCollection === collectionId) {
        setSelectedCollection(null)
      }
      showToast('Collection deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting collection:', error)
      showToast('Failed to delete collection. Please try again.', 'error')
    } finally {
      setSaving(false)
      setShowDeleteConfirm(null)
    }
  }

  const handleAddToCollection = async () => {
    if (!selectedCollection) {
      showToast('Please select a collection', 'error')
      return
    }

    if (!shoe || !shoe.styleID) {
      showToast('Invalid shoe data', 'error')
      return
    }

    setSaving(true)
    try {
      // Prepare the data with all required fields
      const collectionItem = {
        collection_id: selectedCollection,
        sneaker_id: shoe.styleID,
        name: shoe.shoeName || shoe.name || 'Unknown',
        brand: shoe.brand || 'Unknown',
        thumbnail: shoe.thumbnail || ''
      }

      // Validate required fields
      if (!collectionItem.sneaker_id || !collectionItem.name || !collectionItem.brand || !collectionItem.thumbnail) {
        throw new Error('Missing required shoe information')
      }

      const { error } = await supabase
        .from('collection_items')
        .insert([collectionItem])

      if (error) {
        if (error.code === '23505') {
          showToast('This shoe is already in the selected collection', 'error')
        } else {
          throw error
        }
        return
      }

      showToast('Added to collection successfully!', 'success')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error adding to collection:', error)
      if (error.message === 'Missing required shoe information') {
        showToast('Missing required shoe information. Please try again with complete data.', 'error')
      } else {
        showToast('Failed to add to collection. Please try again.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-base-100 dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-gray-100">Add to Collection</h3>
              <button onClick={onClose} className="btn btn-ghost btn-sm">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Collection Name"
                  className="input input-bordered flex-1 dark:bg-gray-700 dark:text-gray-100"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !newCollectionName.trim()}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    <Plus size={20} />
                  )}
                </button>
              </div>
            </form>

            {loading ? (
              <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-md" />
              </div>
            ) : collections.length === 0 ? (
              <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                No collections yet. Create one above!
              </p>
            ) : (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                      selectedCollection === collection.id
                        ? 'bg-primary text-primary-content'
                        : 'bg-base-200 hover:bg-base-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedCollection(collection.id)}
                  >
                    <h4 className="font-medium">{collection.name}</h4>
                    <button
                      className="btn btn-ghost btn-sm text-error"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteConfirm(collection.id)
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-base-200 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto sm:ml-3"
              onClick={handleAddToCollection}
              disabled={saving || !selectedCollection}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                'Add to Collection'
              )}
            </button>
            <button
              type="button"
              className="btn btn-ghost mt-3 w-full sm:mt-0 sm:w-auto dark:text-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Delete Collection Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirm(null)} />
            
            <div className="relative transform overflow-hidden rounded-lg bg-base-100 dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="px-4 pb-4 pt-5 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Delete Collection</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this collection? This action cannot be undone and will remove all shoes from this collection.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="btn btn-ghost"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(showDeleteConfirm)}
                    className="btn btn-error"
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 