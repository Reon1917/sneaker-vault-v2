'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash, X, Check, FolderPlus } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionItems, setCollectionItems] = useState([]);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const supabase = createClientComponentClient();

  const fetchCollections = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collections:', error);
      return;
    }

    setCollections(data || []);
    setLoading(false);
  }, [supabase]);

  const fetchCollectionItems = useCallback(async (collectionId) => {
    if (!collectionId) return;

    const { data, error } = await supabase
      .from('collection_items')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collection items:', error);
      return;
    }

    setCollectionItems(data || []);
  }, [supabase]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionItems(selectedCollection.id);
    } else {
      setCollectionItems([]);
    }
  }, [selectedCollection, fetchCollectionItems]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

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
        .single();

      if (error) throw error;

      setCollections([data, ...collections]);
      setNewCollectionName('');
      alert('Collection created successfully!');
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCollection = async (collectionId) => {
    if (!editName.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('collections')
        .update({ name: editName })
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(collections.map(c => 
        c.id === collectionId ? { ...c, name: editName } : c
      ));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection({ ...selectedCollection, name: editName });
      }
      setEditingCollection(null);
      alert('Collection updated successfully!');
    } catch (error) {
      console.error('Error updating collection:', error);
      alert('Failed to update collection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(collections.filter(c => c.id !== collectionId));
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
      alert('Collection deleted successfully!');
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromCollection = async (sneakerId) => {
    if (!selectedCollection) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('collection_id', selectedCollection.id)
        .eq('sneaker_id', sneakerId);

      if (error) throw error;

      setCollectionItems(collectionItems.filter(item => item.sneaker_id !== sneakerId));
      alert('Removed from collection successfully!');
    } catch (error) {
      console.error('Error removing from collection:', error);
      alert('Failed to remove from collection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Collections</h1>
        <form onSubmit={handleCreateCollection} className="flex gap-2 w-full md:w-auto">
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New Collection Name"
            className="input input-bordered flex-1 md:w-64 bg-base-100 dark:bg-base-200"
          />
          <button
            type="submit"
            className="btn btn-primary gap-2"
            disabled={saving || !newCollectionName.trim()}
          >
            {saving ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <>
                <FolderPlus size={20} />
                Create
              </>
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collections List */}
        <div className="lg:col-span-1 space-y-4">
          {collections.length === 0 ? (
            <div className="text-center py-8 bg-base-200 dark:bg-base-300 rounded-lg">
              <div className="p-4">
                <FolderPlus size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No collections yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Create your first collection above!</p>
              </div>
            </div>
          ) : (
            collections.map((collection) => (
              <div
                key={collection.id}
                className={`card bg-base-100 dark:bg-base-200 shadow-md hover:shadow-lg transition-all cursor-pointer ${
                  selectedCollection?.id === collection.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCollection(collection)}
              >
                <div className="card-body p-4">
                  <div className="flex justify-between items-center">
                    {editingCollection === collection.id ? (
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1 mr-2 bg-base-100 dark:bg-base-200"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <h3 className="font-semibold dark:text-gray-100">{collection.name}</h3>
                    )}
                    <div className="flex gap-2">
                      {editingCollection === collection.id ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateCollection(collection.id);
                            }}
                            className="btn btn-ghost btn-sm"
                            disabled={saving}
                          >
                            <Check size={16} className="text-success" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCollection(null);
                            }}
                            className="btn btn-ghost btn-sm"
                          >
                            <X size={16} className="text-error" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCollection(collection.id);
                              setEditName(collection.name);
                            }}
                            className="btn btn-ghost btn-sm"
                          >
                            <Pencil size={16} className="text-gray-500 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCollection(collection.id);
                            }}
                            className="btn btn-ghost btn-sm"
                            disabled={saving}
                          >
                            <Trash size={16} className="text-error" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Collection Items */}
        <div className="lg:col-span-3">
          {selectedCollection ? (
            <>
              <h2 className="text-2xl font-bold mb-6 dark:text-gray-100">{selectedCollection.name}</h2>
              {collectionItems.length === 0 ? (
                <div className="text-center py-12 bg-base-200 dark:bg-base-300 rounded-lg">
                  <div className="p-4">
                    <Plus size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">No shoes in this collection yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Add shoes from your vault!</p>
                    <Link href="/vault" className="btn btn-primary mt-6">
                      Go to Vault
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collectionItems.map((item) => (
                    <div
                      key={item.id}
                      className="card bg-base-100 dark:bg-base-200 shadow-xl hover:shadow-2xl transition-shadow"
                    >
                      <figure className="relative px-4 pt-4">
                        <div className="relative w-full h-56">
                          <Image
                            src={item.thumbnail}
                            alt={item.name}
                            width={400}
                            height={400}
                            className="rounded-xl object-contain bg-gray-50 dark:bg-gray-800 w-full h-full"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      </figure>
                      <div className="card-body pt-4">
                        <Link href={`/shoe/${item.sneaker_id}`}>
                          <h3 className="card-title text-lg font-bold line-clamp-2 hover:text-primary transition-colors dark:text-gray-100">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{item.brand}</p>
                        <div className="card-actions justify-end mt-4">
                          <Link
                            href={`/shoe/${item.sneaker_id}`}
                            className="btn btn-outline btn-primary flex-1"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => handleRemoveFromCollection(item.sneaker_id)}
                            className="btn btn-ghost text-error"
                            disabled={saving}
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-base-200 dark:bg-base-300 rounded-lg">
              <div className="p-4">
                <FolderPlus size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">Select a collection to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 