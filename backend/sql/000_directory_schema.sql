CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    address TEXT,
    location VARCHAR(200),
    contact_number VARCHAR(50),
    whatsapp_number VARCHAR(50),
    website_url TEXT,
    image_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS businesses_created_at_idx
    ON businesses (created_at DESC);

CREATE INDEX IF NOT EXISTS businesses_category_id_idx
    ON businesses (category_id);
