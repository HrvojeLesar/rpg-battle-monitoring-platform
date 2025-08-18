CREATE TABLE game (
    id INTEGER PRIMARY KEY AUTOINCREMENT
    , name TEXT NOT NULL
    , system TEXT NOT NULL
);

CREATE TABLE entity (
    uid TEXT NOT NULL
    , game INTEGER REFERENCES game (id)
    , timestamp INTEGER NOT NULL
    , kind TEXT NOT NULL
    , data BLOB
    , PRIMARY KEY (uid, game)
);

CREATE INDEX IF NOT EXISTS entity_idx_game ON entity (game);
CREATE INDEX IF NOT EXISTS entity_idx_uid ON entity (uid);
CREATE INDEX IF NOT EXISTS game_idx_system ON game (system);
