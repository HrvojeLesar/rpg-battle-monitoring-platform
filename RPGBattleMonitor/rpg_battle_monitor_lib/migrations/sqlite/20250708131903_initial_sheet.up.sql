CREATE TABLE sheet (
    id INTEGER PRIMARY KEY AUTOINCREMENT
    , version INTEGER NOT NULL
    , attributes TEXT NOT NULL
    , hash VARCHAR(64)
    , config INTEGER REFERENCES sheet (id)
);

CREATE INDEX IF NOT EXISTS sheet_idx_hash ON sheet (hash);
CREATE INDEX IF NOT EXISTS sheet_idx_config ON sheet (config);
