-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vault_items table
CREATE TABLE IF NOT EXISTS vault_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sneaker_id TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, sneaker_id)
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Create collection_items table
CREATE TABLE IF NOT EXISTS collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    sneaker_id TEXT NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(collection_id, sneaker_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON collection_items(collection_id);

-- Set up Row Level Security (RLS)
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vault items"
    ON vault_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vault items"
    ON vault_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items"
    ON vault_items FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view items in their collections"
    ON collection_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert items to their collections"
    ON collection_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete items from their collections"
    ON collection_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )); 