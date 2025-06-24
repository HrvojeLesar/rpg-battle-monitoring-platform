CREATE TABLE assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT
    , name VARCHAR(255) NOT NULL
    , hash VARCHAR(64) NOT NULL
    , mime VARCHAR(64) NOT NULL
    , asset_type VARCHAR(32) NOT NULL
    , original_image_id INTEGER REFERENCES assets(id) ON DELETE CASCADE
    , created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS assets_idx_hash ON assets (hash);
CREATE INDEX IF NOT EXISTS assets_idx_asset_type ON assets (asset_type);
CREATE INDEX IF NOT EXISTS assets_idx_name ON assets (name);
CREATE INDEX IF NOT EXISTS assets_idx_original_image_id ON assets (original_image_id);
