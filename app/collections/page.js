'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [vaultItems, setVaultItems] = useState([]);
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
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching collections:', error);
      return;
    }

    setCollections(data || []);
    setLoading(false);
  }, [supabase.auth]);

  const fetchVaultItems = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching vault items:', error);
      return;
    }

    setVaultItems(data || []);
  }, [supabase.auth]);

  useEffect(() => {
    fetchCollections();
    fetchVaultItems();
  }, [fetchCollections, fetchVaultItems]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('collections')
      .insert([
        {
          name: newCollectionName,
          user_id: user.id,
        },
      ])
      .select();

    if (error) {
      console.error('Error creating collection:', error);
      return;
    }

    setCollections([...collections, data[0]]);
    setNewCollectionName('');
  };

  const handleDeleteCollection = async (collectionId) => {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);

    if (error) {
      console.error('Error deleting collection:', error);
      return;
    }

    setCollections(collections.filter((c) => c.id !== collectionId));
    if (selectedCollection?.id === collectionId) {
      setSelectedCollection(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Collections</h1>
        <form onSubmit={handleCreateCollection} className="flex gap-4 mb-6">
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New Collection Name"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create Collection
          </button>
        </form>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Collections Yet</h2>
          <p className="text-gray-600">Create your first collection to start organizing your sneakers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{collection.name}</h3>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedCollection(collection)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDeleteCollection(collection.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCollection && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCollection.name}</h2>
              <button
                onClick={() => setSelectedCollection(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              {/* Collection details and management UI here */}
              <p className="text-gray-600">Collection management features coming soon!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 