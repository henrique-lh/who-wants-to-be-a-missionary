import { CHAPTERS, DONE_LINES, MapId, PuzzleType, quote } from './bible.js'
import { ROWS as EDEN } from './eden.js'

export const Mode = Object.freeze({ DIALOGUE: 'dialogue', MAP: 'map', PUZZLE: 'puzzle', NOTEBOOK: 'notebook', END: 'end' })
export const Key = Object.freeze({
  UP: 'up', DOWN: 'down', LEFT: 'left', RIGHT: 'right', CONFIRM: 'confirm', CANCEL: 'cancel', NOTEBOOK: 'notebook', ERASE: 'erase',
})
export const Tile = Object.freeze({
  WALL: '#', TREE: 'T', WATER: '~', GRASS: 'g', ROCK: 'R', PATH: '.', EXIT: '>', SPAWN: '@',
  CRACKED: ':', DEAD_TREE: 'Y', THORNS: '%',
})

// Player position is the tile's top-left corner, in tiles. The hitbox is a small square around the tile centre, so a few pixels of drift never snag on a neighbour.
const HITBOX = 0.15
const SOLID = new Set([Tile.WALL, Tile.TREE, Tile.WATER, Tile.ROCK, Tile.DEAD_TREE, Tile.THORNS])
const STEP = { [Key.UP]: [0, -1], [Key.DOWN]: [0, 1], [Key.LEFT]: [-1, 0], [Key.RIGHT]: [1, 0] }
const ROWS = { [MapId.EDEN]: EDEN }

export const rowsOf = (mapId) => ROWS[mapId]
export const readingsOf = (mapId) => CHAPTERS[mapId].readings
export const puzzlesOf = (mapId) => CHAPTERS[mapId].puzzles
// A puzzle belongs to a landmark, or to a stone with a blank to fill.
export const puzzleOf = (state) => puzzlesOf(state.map)[state.puzzle.id] ?? readingsOf(state.map)[state.puzzle.id].puzzle
const startOf = (mapId) => {
  const { x, y } = rowsOf(mapId).flatMap((row, y) => [...row].map((tile, x) => ({ tile, x, y }))).find(({ tile }) => tile === Tile.SPAWN)
  return { x, y }
}

export const isNpc = (mapId, tile) => Object.hasOwn(puzzlesOf(mapId), tile)
export const isDoor = (mapId, tile) => tile === tile.toUpperCase() && isNpc(mapId, tile.toLowerCase())
export const isReading = (mapId, tile) => Object.hasOwn(readingsOf(mapId), tile)
export const tileAt = (mapId, x, y) => rowsOf(mapId)[y]?.[x] ?? Tile.WALL
const touching = (mapId, { x, y }) =>
  [-HITBOX, HITBOX].flatMap((dy) => [-HITBOX, HITBOX].map((dx) => tileAt(mapId, Math.floor(x + 0.5 + dx), Math.floor(y + 0.5 + dy))))
export const visibleItems = (puzzle) => puzzle.order.filter((item) => !puzzle.picked.includes(item))

export const shardsOf = (state) => CHAPTERS[state.map].shards.filter((door) => state.opened.includes(door)).length

// ORDER and TYPE puzzles are one step per item, in sequence. A FIND puzzle lists its own steps.
const stepsOf = (definition) => definition.steps ?? definition.items.map((_, index) => ({ answers: [index] }))
export const currentStep = (definition, picked) =>
  stepsOf(definition).find(({ answers }) => !answers.every((answer) => picked.includes(answer)))

export function pick(definition, picked, index) {
  const correct = currentStep(definition, picked).answers.includes(index)
  const next = correct ? [...picked, index] : picked
  return { picked: next, correct, solved: !currentStep(definition, next) }
}

const normalized = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
// A typed answer is right when one of its words is a keyword of the current step; otherwise it picks nothing (-1).
function typedPick(definition, { picked, typed }) {
  const [index] = currentStep(definition, picked).answers
  const words = normalized(typed).split(/\s+/)
  return definition.keywords[index].some((keyword) => words.includes(keyword)) ? index : -1
}

export const isTyping = (state) => state.mode === Mode.PUZZLE && puzzleOf(state).type === PuzzleType.TYPE
export const typeText = (state, text) =>
  isTyping(state) ? { ...state, puzzle: { ...state.puzzle, typed: state.puzzle.typed + text, wrong: false } } : state

const shuffled = (count) =>
  [...Array(count).keys()].map((index) => [Math.random(), index]).sort(([a], [b]) => a - b).map(([, index]) => index)

const opening = (id, definition) => ({ id, picked: [], order: shuffled(definition.items.length), cursor: 0, wrong: false, typed: '' })
const missingOf = (state, { needs }) => needs.filter((need) => !state.read.includes(need) && !state.opened.includes(need))

const say = (state, lines, then = { mode: Mode.MAP }) => ({ ...state, mode: Mode.DIALOGUE, dialogue: { lines, then } })

export const initialState = () => say(
  { map: MapId.EDEN, player: startOf(MapId.EDEN), opened: [], read: [], gems: [], puzzle: null, notebook: null },
  CHAPTERS[MapId.EDEN].introLines,
)

export function update(state, key, distance = 1) {
  if (key === Key.NOTEBOOK && (state.mode === Mode.MAP || state.mode === Mode.PUZZLE)) {
    return { ...state, mode: Mode.NOTEBOOK, notebook: { cursor: 0, back: state.mode } }
  }
  switch (state.mode) {
    case Mode.NOTEBOOK: return browse(state, key)
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
  const closed = touched.find((tile) => isDoor(state.map, tile) && !state.opened.includes(tile))
  if (closed) return say(state, puzzlesOf(state.map)[closed.toLowerCase()].closedLines)
  if (touched.some((tile) => SOLID.has(tile) || isNpc(state.map, tile) || isReading(state.map, tile))) return state
  const moved = { ...state, player: next }
  return touched.includes(Tile.EXIT) ? say(moved, CHAPTERS[state.map].exitLines, { mode: Mode.END }) : moved
}

// The landmark or stone next to the player, landmarks first.
export function interactable(state) {
  const x = Math.round(state.player.x)
  const y = Math.round(state.player.y)
  const around = Object.values(STEP).map(([dx, dy]) => tileAt(state.map, x + dx, y + dy))
  return around.find((tile) => isNpc(state.map, tile)) ?? around.find((tile) => isReading(state.map, tile))
}

function talk(state) {
  const tile = interactable(state)
  if (!tile) return state
  return isNpc(state.map, tile) ? visit(state, tile) : read(state, tile)
}

export const linesOf = ({ title, ref }) => [`${title}.`, quote(ref)]

function read(state, key) {
  const reading = readingsOf(state.map)[key]
  if (state.read.includes(key)) return say(state, linesOf(reading))
  return reading.puzzle
    ? { ...state, mode: Mode.PUZZLE, puzzle: opening(key, reading.puzzle) }
    : say({ ...state, read: [...state.read, key] }, linesOf(reading))
}

function visit(state, letter) {
  const puzzle = puzzlesOf(state.map)[letter]
  if (state.opened.includes(letter.toUpperCase())) return say(state, DONE_LINES)
  const missing = missingOf(state, puzzle)
  if (missing.length) return say(state, puzzle.missingLines(missing.length))
  if (!puzzle.type) return say({ ...state, opened: [...state.opened, letter.toUpperCase()] }, puzzle.solvedLines)
  return say(state, puzzle.introLines, { mode: Mode.PUZZLE, puzzle: opening(letter, puzzle) })
}

function browse(state, key) {
  const { notebook } = state
  if (key === Key.NOTEBOOK || key === Key.CANCEL) return { ...state, mode: notebook.back, notebook: null }
  if ((key !== Key.UP && key !== Key.DOWN) || !state.read.length) return state
  const cursor = (notebook.cursor + (key === Key.UP ? -1 : 1) + state.read.length) % state.read.length
  return { ...state, notebook: { ...notebook, cursor } }
}

function choose(state, key) {
  const { puzzle } = state
  const definition = puzzleOf(state)
  const typing = definition.type === PuzzleType.TYPE
  const visible = visibleItems(puzzle)
  if (key === Key.CANCEL) return { ...state, mode: Mode.MAP, puzzle: null }
  if (typing && key === Key.ERASE) return { ...state, puzzle: { ...puzzle, typed: puzzle.typed.slice(0, -1) } }
  if (!typing && (key === Key.UP || key === Key.DOWN)) {
    const offset = key === Key.UP ? -1 : 1
    return { ...state, puzzle: { ...puzzle, cursor: (puzzle.cursor + offset + visible.length) % visible.length } }
  }
  if (key !== Key.CONFIRM) return state
  const result = pick(definition, puzzle.picked, typing ? typedPick(definition, puzzle) : visible[puzzle.cursor])
  return result.solved
    ? solve(state, definition)
    : { ...state, puzzle: { ...puzzle, picked: result.picked, cursor: 0, wrong: !result.correct, typed: result.correct ? '' : puzzle.typed } }
}

// A solved stone is read, a solved landmark opens its door and may give a gem.
function solve(state, definition) {
  const { id } = state.puzzle
  const done = isReading(state.map, id)
    ? { ...state, read: [...state.read, id] }
    : { ...state, opened: [...state.opened, id.toUpperCase()], gems: definition.gem ? [...state.gems, definition.gem] : state.gems }
  return say({ ...done, puzzle: null }, definition.solvedLines)
}
