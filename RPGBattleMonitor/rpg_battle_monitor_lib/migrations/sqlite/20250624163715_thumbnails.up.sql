CREATE TABLE thumbnails (
    id INTEGER PRIMARY KEY AUTOINCREMENT
    , dimensions VARCHAR(12) NOT NULL
    , image_id INTEGER REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS thumbnails_idx_image_id ON thumbnails (image_id);
