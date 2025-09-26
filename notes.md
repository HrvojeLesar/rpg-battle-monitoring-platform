# Notes

## Plan

- [x] Joining a game
- [x] Map
    - [x] Uploading background map
    - [x] Adjusting grid
    - [x] Character setup
    - [x] Turn order

## Core feature - MUST HAVE

- [ ] At least one integrated ruleset (e.g. DnD)
- [ ] Map
    - [x] Loading custom map
    - [x] Setting map scale
    - [x] Setting map field size (resize squares in case of DnD)
- [ ] Players
    - [x] Load charactes to map
    - [x] Load their stats
- [ ] Turn automation
    - [x] Turn order (hide unseen enemies from turn order)
    - [x] Visualize movement range
    - [ ] Visualize ability use (mark area for AoE abilities, highlight targets
            when using spells)

## Game hosting / Downloading

- [ ] Online (main, stores data in one central location)
- [ ] Locally (Mobile, desktop app behaves as host)
- [ ] Have options to choose server

## Defining your own game rules

- [ ] Maybe a phase state machine; for automatic enemy movement,
ability use, turn order, etc.
- [ ] Scripting basic ai
- [ ] Fog of war
- [ ] Vision based on distance
- [ ] Show available movement distance

## Game

- Starting a game, resuming
    - [ ] Connect to a room
        - [ ] Create new
        - [ ] Join existing
        - [ ] Load save
    - [ ] Savegame
        - [ ] Periodically save state
            - [ ] Keep most active session data in memory
            - [ ] Undo, redo system (tree or stack)
                - stack is simpler to implement, less flexible
                - tree is more tricky, needs visual view to navigate
