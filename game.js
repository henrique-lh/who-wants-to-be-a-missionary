import { CHAPTERS, DONE_LINES, DOOR_LINES, MapId, PuzzleType } from './bible.js'
import { ROWS as JERUSALEM } from './jerusalem.js'
import { ROWS as JUDEA } from './judea.js'

export const Mode = Object.freeze({ DIALOGUE: 'dialogue', MAP: 'map', PUZZLE: 'puzzle', END: 'end' })
export const Key = Object.freeze({ UP: 'up', DOWN: 'down', LEFT: 'left', RIGHT: 'right', CONFIRM: 'confirm', CANCEL: 'cancel' })
export const Tile = Object.freeze({ WALL: '#', TREE: 'T', WATER: '~', GRASS: 'g', SAND: 's', ROCK: 'R', PATH: '.', EXIT: '>', SPAWN: '@' })

// Player position is the tile's top-left corner, in tiles. The hitbox is a square around the tile centre.
const HITBOX = 0.25
const SOLID = new Set([Tile.WALL, Tile.TREE, Tile.WATER, Tile.ROCK])
const STEP = { [Key.UP]: [0, -1], [Key.DOWN]: [0, 1], [Key.LEFT]: [-1, 0], [Key.RIGHT]: [1, 0] }
const MAPS = [{ id: MapId.JERUSALEM, rows: JERUSALEM }, { id: MapId.JUDEA, rows: JUDEA }]

export const rowsOf = (mapId) => MAPS.find(({ id }) => id === mapId).rows
export const puzzlesOf = (mapId) => CHAPTERS[mapId].puzzles
export const puzzleOf = (state) => puzzlesOf(state.map)[state.puzzle.id]
const startOf = (mapId) => {
  const { x, y } = rowsOf(mapId).flatMap((row, y) => [...row].map((tile, x) => ({ tile, x, y }))).find(({ tile }) => tile === Tile.SPAWN)
  return { x, y }
}

export const isNpc = (mapId, tile) => Object.hasOwn(puzzlesOf(mapId), tile)
export const isDoor = (mapId, tile) => tile === tile.toUpperCase() && isNpc(mapId, tile.toLowerCase())
export const tileAt = (mapId, x, y) => rowsOf(mapId)[y]?.[x] ?? Tile.WALL
const touching = (mapId, { x, y }) =>
  [-HITBOX, HITBOX].flatMap((dy) => [-HITBOX, HITBOX].map((dx) => tileAt(mapId, Math.floor(x + 0.5 + dx), Math.floor(y + 0.5 + dy))))
export const visibleItems = (puzzle) => puzzle.order.filter((item) => !puzzle.picked.includes(item))

export const expectedIndex = (definition, picked) =>
  definition.type === PuzzleType.ORDER ? picked.length : definition.answer

export function pick(definition, picked, index) {
  const correct = index === expectedIndex(definition, picked)
  const next = correct ? [...picked, index] : picked
  const solved = correct && (definition.type === PuzzleType.CHOICE || next.length === definition.items.length)
  return { picked: next, correct, solved }
}

// ponytail: biased shuffle, fine for 3 to 5 items
const shuffled = (count) => [...Array(count).keys()].sort(() => Math.random() - 0.5)

const say = (state, lines, then = { mode: Mode.MAP }) => ({ ...state, mode: Mode.DIALOGUE, dialogue: { lines, then } })

export const initialState = () =>
  say({ map: MapId.JERUSALEM, player: startOf(MapId.JERUSALEM), opened: [], puzzle: null }, CHAPTERS[MapId.JERUSALEM].introLines)

export function update(state, key, distance = 1) {
  switch (state.mode) {
    case Mode.MAP: return key === Key.CONFIRM ? talk(state) : move(state, key, distance)
    case Mode.DIALOGUE: return key === Key.CONFIRM ? advance(state) : state
    case Mode.PUZZLE: return choose(state, key)
    default: return state
  }
}

function advance(state) {
  const [, ...rest] = state.dialogue.lines
  return rest.length
    ? { ...state, dialogue: { ...state.dialogue, lines: rest } }
    : { ...state, dialogue: null, ...state.dialogue.then }
}

function move(state, key, distance) {
  const step = STEP[key]
  if (!step) return state
  const next = { x: state.player.x + step[0] * distance, y: state.player.y + step[1] * distance }
  const touched = touching(state.map, next)
  if (touched.some((tile) => isDoor(state.map, tile) && !state.opened.includes(tile))) return say(state, DOOR_LINES)
  if (touched.some((tile) => SOLID.has(tile) || isNpc(state.map, tile))) return state
  const moved = { ...state, player: next }
  return touched.includes(Tile.EXIT) ? say(moved, CHAPTERS[state.map].exitLines, afterExit(state.map)) : moved
}

function afterExit(mapId) {
  const nextMap = MAPS[MAPS.findIndex(({ id }) => id === mapId) + 1]
  return nextMap
    ? {
        map: nextMap.id,
        player: startOf(nextMap.id),
        opened: [],
        mode: Mode.DIALOGUE,
        dialogue: { lines: CHAPTERS[nextMap.id].introLines, then: { mode: Mode.MAP } },
      }
    : { mode: Mode.END }
}

function talk(state) {
  const x = Math.round(state.player.x)
  const y = Math.round(state.player.y)
  const npc = Object.values(STEP).map(([dx, dy]) => tileAt(state.map, x + dx, y + dy)).find((tile) => isNpc(state.map, tile))
  if (!npc) return state
  const puzzle = puzzlesOf(state.map)[npc]
  return state.opened.includes(npc.toUpperCase())
    ? say(state, DONE_LINES)
    : say(state, puzzle.introLines, {
        mode: Mode.PUZZLE,
        puzzle: { id: npc, picked: [], order: shuffled(puzzle.items.length), cursor: 0, wrong: false },
      })
}

function choose(state, key) {
  const { puzzle } = state
  const definition = puzzleOf(state)
  const visible = visibleItems(puzzle)
  if (key === Key.CANCEL) return { ...state, mode: Mode.MAP, puzzle: null }
  if (key === Key.UP || key === Key.DOWN) {
    const offset = key === Key.UP ? -1 : 1
    return { ...state, puzzle: { ...puzzle, cursor: (puzzle.cursor + offset + visible.length) % visible.length } }
  }
  if (key !== Key.CONFIRM) return state
  const result = pick(definition, puzzle.picked, visible[puzzle.cursor])
  return result.solved
    ? say({ ...state, puzzle: null, opened: [...state.opened, puzzle.id.toUpperCase()] }, definition.solvedLines)
    : { ...state, puzzle: { ...puzzle, picked: result.picked, cursor: 0, wrong: !result.correct } }
}
