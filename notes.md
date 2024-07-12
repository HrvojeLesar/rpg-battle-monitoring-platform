# Notes

## Core feature - MUST HAVE

- [ ] At least one integrated ruleset (e.g. DnD)
- [ ] Map
    - [ ] Loading custom map
    - [ ] Setting map scale
    - [ ] Setting map field size (resize squares in case of DnD)
- [ ] Players
    - [ ] Load charactes to map
    - [ ] Load their stats
- [ ] Turn automation
    - [ ] Turn order (hide unseen enemies from turn order)
    - [ ] Visualize movement range
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
