import { supabase } from './client'

// Vault operations
export const addToVault = async (sneaker) => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('vault_items')
    .insert({
      user_id: user.user.id,
      sneaker_id: sneaker.id,
      name: sneaker.name,
      brand: sneaker.brand,
      thumbnail: sneaker.thumbnail
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getVaultItems = async () => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('vault_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const removeFromVault = async (sneakerId) => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('vault_items')
    .delete()
    .match({ user_id: user.user.id, sneaker_id: sneakerId })

  if (error) throw error
  return true
}

// Collection operations
export const createCollection = async (name, description) => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: user.user.id,
      name,
      description
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getCollections = async () => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const addToCollection = async (collectionId, sneaker) => {
  const { data, error } = await supabase
    .from('collection_items')
    .insert({
      collection_id: collectionId,
      sneaker_id: sneaker.id,
      name: sneaker.name,
      brand: sneaker.brand,
      thumbnail: sneaker.thumbnail
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getCollectionItems = async (collectionId) => {
  const { data, error } = await supabase
    .from('collection_items')
    .select('*')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const removeFromCollection = async (collectionId, sneakerId) => {
  const { error } = await supabase
    .from('collection_items')
    .delete()
    .match({ collection_id: collectionId, sneaker_id: sneakerId })

  if (error) throw error
  return true
}

export const deleteCollection = async (collectionId) => {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)

  if (error) throw error
  return true
} 