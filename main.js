import { END_LINES, PuzzleType } from './bible.js'
import { Key, Mode, Tile, initialState, isDoor, isNpc, puzzleOf, rowsOf, tileAt, update, visibleItems } from './game.js'

const SCALE = 6
const STEP_MS = 350
const TILE = 16
const VIEW_W = 15
const VIEW_H = 10
const LINE = 9
const COLORS = {
  [Tile.WALL]: '#555', [Tile.TREE]: '#1b5e20', [Tile.WATER]: '#1565c0', [Tile.GRASS]: '#4caf50',
  [Tile.SAND]: '#b79c6a', [Tile.ROCK]: '#8d7b68',
  [Tile.PATH]: '#d7b98a', [Tile.SPAWN]: '#d7b98a', [Tile.EXIT]: '#ffd54f',
}
const DOOR_COLOR = '#8d6e63'
const KEYS = {
  ArrowUp: Key.UP, w: Key.UP, ArrowDown: Key.DOWN, s: Key.DOWN, ArrowLeft: Key.LEFT, a: Key.LEFT,
  ArrowRight: Key.RIGHT, d: Key.RIGHT, z: Key.CONFIRM, Enter: Key.CONFIRM, x: Key.CANCEL, Escape: Key.CANCEL,
}

const ctx = document.querySelector('canvas').getContext('2d')
ctx.scale(SCALE, SCALE)
ctx.font = '7px monospace'
ctx.textBaseline = 'top'

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
const snap = (value) => Math.round(value * SCALE) / SCALE

function wrap(text, width) {
  return text.split(' ').reduce((lines, word) => {
    const last = lines.at(-1)
    const candidate = last ? `${last} ${word}` : word
    return !last || ctx.measureText(candidate).width <= width ? [...lines.slice(0, -1), candidate] : [...lines, word]
  }, [])
}

const drawText = (text, x, y, width) =>
  wrap(text, width).reduce((top, line) => {
    ctx.fillText(line, x, top)
    return top + LINE
  }, y)

function drawBox(x, y, width, height) {
  ctx.fillStyle = '#fff'
  ctx.fillRect(x, y, width, height)
  ctx.strokeStyle = '#000'
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1)
  ctx.fillStyle = '#000'
}

const GROUND = { jerusalem: Tile.GRASS, judea: Tile.SAND }

function tileColor(map, tile, opened) {
  if (isDoor(map, tile)) return opened.includes(tile) ? COLORS[Tile.PATH] : DOOR_COLOR
  return isNpc(map, tile) ? COLORS[GROUND[map]] : COLORS[tile]
}

function drawMap({ map, opened, player }) {
  const rows = rowsOf(map)
  const camX = clamp(player.x - 7, 0, rows[0].length - VIEW_W)
  const camY = clamp(player.y - 4, 0, rows.length - VIEW_H)
  for (let ty = 0; ty <= VIEW_H; ty++) {
    for (let tx = 0; tx <= VIEW_W; tx++) {
      const mapX = Math.floor(camX) + tx
      const mapY = Math.floor(camY) + ty
      const tile = tileAt(map, mapX, mapY)
      const left = snap((mapX - camX) * TILE)
      const top = snap((mapY - camY) * TILE)
      ctx.fillStyle = tileColor(map, tile, opened)
      ctx.fillRect(left, top, TILE, TILE)
      if (isNpc(map, tile)) {
        ctx.fillStyle = '#7b1fa2'
        ctx.fillRect(left + 3, top + 3, 10, 10)
      }
    }
  }
  ctx.fillStyle = '#d32f2f'
  ctx.fillRect(snap((player.x - camX) * TILE) + 3, snap((player.y - camY) * TILE) + 3, 10, 10)
}

function drawPuzzle(state) {
  const { puzzle } = state
  const definition = puzzleOf(state)
  drawBox(4, 4, 232, 152)
  const afterPrompt = drawText(definition.prompt, 10, 10, 220)
  const afterPicked = definition.type === PuzzleType.ORDER && puzzle.picked.length
    ? drawText(`Montado: ${puzzle.picked.map((item) => definition.items[item]).join(' ')}`, 10, afterPrompt + 2, 220)
    : afterPrompt
  visibleItems(puzzle).reduce(
    (top, item, row) => drawText(`${row === puzzle.cursor ? '>' : ' '} ${definition.items[item]}`, 10, top + 2, 220),
    afterPicked + 2,
  )
  if (puzzle.wrong) drawText(`Não é isso. Releia ${definition.ref}.`, 10, 140, 220)
}

function draw(state) {
  if (state.mode === Mode.END) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, VIEW_W * TILE, VIEW_H * TILE)
    ctx.fillStyle = '#fff'
    END_LINES.reduce((top, line) => drawText(line, 10, top + 6, 220), 50)
    return
  }
  drawMap(state)
  if (state.mode === Mode.PUZZLE) drawPuzzle(state)
  if (state.mode === Mode.DIALOGUE) {
    drawBox(4, 108, 232, 48)
    drawText(state.dialogue.lines[0], 10, 114, 220)
  }
}

const DIRECTIONS = [Key.UP, Key.DOWN, Key.LEFT, Key.RIGHT]
const MAX_FRAME_MS = 50

let state = initialState()
let held = []
let lastFrame = 0

function frame(now) {
  const elapsed = Math.min(now - lastFrame, MAX_FRAME_MS)
  lastFrame = now
  const direction = held.at(-1)
  if (direction && state.mode === Mode.MAP) state = update(state, direction, elapsed / STEP_MS)
  draw(state)
  requestAnimationFrame(frame)
}

addEventListener('keydown', (event) => {
  const key = KEYS[event.key]
  if (!key) return
  event.preventDefault()
  if (event.repeat) return
  const isDirection = DIRECTIONS.includes(key)
  if (isDirection) held = [...held.filter((heldKey) => heldKey !== key), key]
  if (!isDirection || state.mode !== Mode.MAP) state = update(state, key)
})
addEventListener('keyup', (event) => {
  held = held.filter((key) => key !== KEYS[event.key])
})
addEventListener('blur', () => {
  held = []
})
requestAnimationFrame(frame)
