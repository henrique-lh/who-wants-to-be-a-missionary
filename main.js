import { END_LINES, MapId, PuzzleType } from './bible.js'
import { Key, Mode, Tile, initialState, isDoor, isNpc, loops, puzzleOf, rowsOf, tileAt, update, visibleItems } from './game.js'

const SCALE = 6
const STEP_MS = 350
const TILE = 16
const VIEW_W = 15
const VIEW_H = 10
const LINE = 9
const sheet = (src, columns) => ({ image: Object.assign(new Image(), { src }), columns })
const TOWN = sheet('assets/town.png', 12)
const DESERT = sheet('assets/desert.png', 18)
const SPRITES = sheet('assets/sprites.png', 9)
const cell = (from, index) => ({ sheet: from, index })
const WATER = cell(SPRITES, 36)
const GRASS = cell(TOWN, 0)
const SAND = cell(DESERT, 64)
const WALL = cell(TOWN, 126)
const DOOR = cell(TOWN, 85)
const EXIT = cell(TOWN, 109)
const CACTUS = cell(DESERT, 63)
const ROCK = cell(DESERT, 58)
// Each tile is a stack of cells drawn bottom to top. `npc` is the ground under a character.
const THEMES = {
  [MapId.JERUSALEM]: {
    [Tile.GRASS]: [GRASS], [Tile.SAND]: [SAND], [Tile.WALL]: [WALL], [Tile.PATH]: [cell(TOWN, 25)],
    [Tile.EXIT]: [EXIT], [Tile.WATER]: [WATER], [Tile.TREE]: [GRASS, cell(TOWN, 16)],
    [Tile.CACTUS]: [SAND, CACTUS], [Tile.ROCK]: [SAND, ROCK], door: [DOOR], npc: [GRASS],
  },
  [MapId.JUDEA]: {
    [Tile.SAND]: [SAND], [Tile.WALL]: [WALL], [Tile.PATH]: [cell(DESERT, 173)], [Tile.EXIT]: [EXIT],
    [Tile.WATER]: [WATER], [Tile.CACTUS]: [SAND, CACTUS], [Tile.ROCK]: [SAND, ROCK], door: [DOOR], npc: [SAND],
  },
}
const NPC_ROW = { a: 1, b: 2, c: 3 }
const FACING_COLUMN = { [Key.DOWN]: 0, [Key.UP]: 1, [Key.LEFT]: 2, [Key.RIGHT]: 2 }
const WALK_FRAMES = [0, 1, 0, 2]
const KEYS = {
  ArrowUp: Key.UP, w: Key.UP, ArrowDown: Key.DOWN, s: Key.DOWN, ArrowLeft: Key.LEFT, a: Key.LEFT,
  ArrowRight: Key.RIGHT, d: Key.RIGHT, z: Key.CONFIRM, Enter: Key.CONFIRM, x: Key.CANCEL, Escape: Key.CANCEL,
}

const ctx = document.querySelector('canvas').getContext('2d')
ctx.scale(SCALE, SCALE)
ctx.imageSmoothingEnabled = false
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

function tileLayers(theme, map, tile, opened) {
  if (isDoor(map, tile)) return opened.includes(tile) ? theme[Tile.PATH] : theme.door
  if (isNpc(map, tile)) return theme.npc
  return theme[tile === Tile.SPAWN ? Tile.PATH : tile]
}

function drawCell({ sheet: from, index }, x, y) {
  const column = index % from.columns
  const row = Math.floor(index / from.columns)
  ctx.drawImage(from.image, column * TILE, row * TILE, TILE, TILE, x, y, TILE, TILE)
}

function drawPlayer(player, x, y) {
  const walking = held.length > 0 && state.mode === Mode.MAP
  const frame = walking ? WALK_FRAMES[Math.floor((player.x + player.y) * 2) & 3] : 0
  const sprite = cell(SPRITES, FACING_COLUMN[facing] * 3 + frame)
  ctx.save()
  ctx.translate(facing === Key.LEFT ? x + TILE : x, y)
  ctx.scale(facing === Key.LEFT ? -1 : 1, 1)
  drawCell(sprite, 0, 0)
  ctx.restore()
}

function drawMap({ map, opened, player }) {
  const theme = THEMES[map]
  const rows = rowsOf(map)
  const camX = clamp(player.x - 7, 0, rows[0].length - VIEW_W)
  const camY = loops(map) ? player.y - 4 : clamp(player.y - 4, 0, rows.length - VIEW_H)
  for (let ty = 0; ty <= VIEW_H; ty++) {
    for (let tx = 0; tx <= VIEW_W; tx++) {
      const mapX = Math.floor(camX) + tx
      const mapY = Math.floor(camY) + ty
      const tile = tileAt(map, mapX, mapY)
      const left = snap((mapX - camX) * TILE)
      const top = snap((mapY - camY) * TILE)
      tileLayers(theme, map, tile, opened).forEach((layer) => drawCell(layer, left, top))
      if (isNpc(map, tile)) drawCell(cell(SPRITES, NPC_ROW[tile] * SPRITES.columns), left, top)
    }
  }
  drawPlayer(player, snap((player.x - camX) * TILE), snap((player.y - camY) * TILE))
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
let facing = Key.DOWN
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
  if (isDirection) {
    held = [...held.filter((heldKey) => heldKey !== key), key]
    facing = key
  }
  if (!isDirection || state.mode !== Mode.MAP) state = update(state, key)
})
addEventListener('keyup', (event) => {
  held = held.filter((key) => key !== KEYS[event.key])
})
addEventListener('blur', () => {
  held = []
})
requestAnimationFrame(frame)
