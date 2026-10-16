# PRD: Who Wants to Be a Missionary (proof of concept)

**Date:** 2026-10-15
**Status:** Draft

## Problem

A 2D pixel art game in the style of Pokémon FireRed, where a missionary walks the places named in Acts 1:8 and solves Bible-based puzzles to move the story forward. There is a concept and no game. The author has never built one and the machine has no game tooling. Without a small, concrete first target, the project stays an idea.

## Background

- The mission verse is Mark 16:15 ("Ide por todo o mundo, pregai o evangelho a toda criatura"). The route is Acts 1:8: Jerusalém, Judeia, Samaria, confins da terra.
- Four maps, in that order. The route is also the book of Acts: Jerusalém (Atos 1 a 7), Judeia e Samaria (Atos 8), confins da terra (Atos 8:26-40 with the Ethiopian, then Paulo em Roma, Atos 28).
- Game text is in Portuguese. Code and file names are in English.
- Measured on the author's machine (Ubuntu 24.04, X11): Python 3.12, Go 1.26, Elixir 1.17, Java 21, Node 20. No game engine installed.

## Requirements

### Must Have

- **Walkable world.** The missionary walks on a tile grid, one tile per step, in four directions. The player talks to characters as in FireRed.
- **Look and feel.** Pixel art at GBA proportions (240x160 base resolution, scaled up), dialogue box at the bottom, keyboard controls (arrows to move, one key to confirm, one to cancel).
- **Puzzles gate progress.** A door blocks the path until a puzzle is solved. Solving it opens the door. The last door leads to the next map.
- **Scripture is the only source of truth.** Every puzzle names its passage. Every verse shown on screen is quoted word for word from one chosen translation. No puzzle depends on a claim outside the passage.
- **One verification file.** All verse text, puzzle answers and story text live in one plain file, each verse labelled with its reference. The author can review all Bible content without reading game code.
- **Evangelical focus.** Puzzles center on the gospel: sin, Christ's death and resurrection, repentance, faith, grace.
- **Local only.** One command starts the game on Ubuntu. No account, no publishing, no internet after setup.
- **Proof of concept slice.** Maps 1 and 2 (Jerusalém, Judeia) are playable from start to finish with 3 puzzles each and a transition screen at the end.

### Should Have

- Walk animation, title screen, pixel font with accented characters.
- Wrong answers give a hint that points back to the passage. No game over.
- Real tileset art (free license) replacing the placeholder colored tiles.
- More puzzle types: block pushing tied to a passage (for example Lucas 5:17-26).

### Out of Scope

- Publishing, web hosting, installers, other operating systems, mobile.
- Combat, random encounters, monster catching.
- Save and load. The slice is short enough to replay.
- Sound and music.
- Any art, sprite or music taken from Pokémon games.
- Maps 3 and 4 in the first build.

## Constraints

- First game for the author: fewest installs and least to learn. The slice uses a browser canvas and plain JavaScript, with no engine. An engine (Phaser) is added only if sprites, animation or scenes outgrow it.
- Maps are text grids, one character per tile. A visual editor (Tiled) is optional later.
- The Bible text must come from a translation whose license allows embedding. The chosen Portuguese translation is to be confirmed. Old Almeida editions are public domain, modern revisions may not be.
- Free pixel art must be checked for license per pack (Kenney is CC0).
- The author verifies Bible content manually.

## Acceptance Criteria

### Walking and dialogue
- Given the game is running, when I press an arrow key, then the missionary moves exactly one tile.
- Given I stand next to a character and press confirm, then a dialogue box shows their text and confirm advances it.
- Given I walk into a wall, water, tree or character, then the missionary does not move.

### Puzzle gating
- Given a closed door, when I walk into it, then I see a message saying it is closed and the door stays closed.
- Given I solve the puzzle correctly, then the matching door opens and stays open.
- Given I answer wrongly, then I see a hint with the passage reference and can try again without losing progress.

### Scripture accuracy
- Given any verse shown in the game, then it matches the verse file word for word and shows its reference.
- Given a puzzle, then the verse file lists its passage and correct answer.

### Map slices
- Given I start a new game, then I begin in Jerusalém with an opening that quotes Marcos 16:15 and Atos 1:8.
- Given I solve all Jerusalém puzzles and reach the exit, then the game names Judeia and places me at its start with its own opening.
- Given I solve all Judeia puzzles and reach the exit, then a screen names the next map (Samaria).
- Given Map 3 is not built, then that screen ends with "Continua..." instead of crashing.

### Setup
- Given a fresh checkout on Ubuntu 24.04, when I run `python3 -m http.server` in the project folder and open `localhost:8000`, then the game starts.
