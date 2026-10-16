import { END_LINES, MapId, PuzzleType } from './bible.js'
import { Key, Mode, Tile, initialState, isDoor, isNpc, loops, puzzleOf, rowsOf, tileAt, update, visibleItems, wrapped } from './game.js'

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
const CITY = sheet('assets/city.png', 4)
const cell = (from, index) => ({ sheet: from, index })
const SAND = cell(DESERT, 64)
const DOOR = cell(TOWN, 85)
const PATHS = { [MapId.JERUSALEM]: cell(TOWN, 25), [MapId.JUDEA]: cell(DESERT, 173) }
// Ground comes in variants picked by position, so open fields get tufts, flowers and dry brush.
const SURFACES = {
  [Tile.GRASS]: [...Array(7).fill([cell(TOWN, 0)]), ...Array(2).fill([cell(TOWN, 1)]), [cell(TOWN, 2)]],
  [Tile.SAND]: [...Array(7).fill([SAND]), ...Array(2).fill([cell(DESERT, 65)]), [SAND, cell(DESERT, 44)]],
}
const SAND_COLOR = '#f3cdac'
const BORDER_DEPTH = 3
// Water and roofs have no cells: they are painted from their neighbours so shapes join up.
const FLAT = {
  [Tile.WALL]: cell(TOWN, 126), [Tile.EXIT]: cell(TOWN, 109), [Tile.FACADE]: cell(CITY, 11), [Tile.WINDOW]: cell(CITY, 3),
  [Tile.HOUSE_DOOR]: cell(CITY, 7), [Tile.PAVING]: cell(CITY, 5),
}
const OBJECTS = { [Tile.TREE]: cell(TOWN, 28), [Tile.CACTUS]: cell(DESERT, 63), [Tile.ROCK]: cell(DESERT, 58) }
const WATER_SHALLOW = '#6fb8ee'
const WATER_DEEP = '#4d97dd'
const WATER_BANK = '#47324b'
const WATER_FOAM = '#a8dcf7'
const WATER_RIPPLE = '#8cc9f0'
const RIPPLE_MS = 700
const NEIGHBORS = [[0, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [1, -1], [1, 1], [-1, 1]]
const NPC_ROW = { a: 1, b: 2, c: 3 }
const VILLAGER_ROWS = [4, 5, 6, 7]
const BREATH_MS = 500
const NEAR_TILES = 2.5
const ARROW_FILL = '#ffd54f'
const ARROW_OUTLINE = '#47324b'
const ARROW = ['ooooooo', 'oyyyyyo', '.oyyyo.', '..oyo..', '...o...']
const CROSS = [[0, -1], [1, 0], [0, 1], [-1, 0]]
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

const mix = (x, y, salt) => Math.imul(Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(salt, 83492791), 2654435761) >>> 0

function surfaceKind(map, x, y) {
  const kinds = [1, 2, 3].flatMap((reach) => CROSS.map(([dx, dy]) => tileAt(map, x + dx * reach, y + dy * reach)))
  return kinds.find((tile) => tile === Tile.GRASS || tile === Tile.SAND) ?? Tile.GRASS
}

const sprite = (row) => cell(SPRITES, row * SPRITES.columns)
const isPerson = (map, tile) => isNpc(map, tile) || tile === Tile.VILLAGER || tile === Tile.CHATTER
const talks = (map, tile, opened) => tile === Tile.CHATTER || (isNpc(map, tile) && !opened.includes(tile.toUpperCase()))

function tileCells(map, tile, x, y, opened) {
  const variant = mix(x, y, 0)
  if (isDoor(map, tile)) return [opened.includes(tile) ? PATHS[map] : DOOR]
  if (tile === Tile.GRASS || tile === Tile.SAND) return SURFACES[tile][variant % SURFACES[tile].length]
  if (tile === Tile.PATH || tile === Tile.SPAWN) return [PATHS[map]]
  const ground = SURFACES[surfaceKind(map, x, y)][0]
  if (isPerson(map, tile)) return ground
  if (OBJECTS[tile]) return [...ground, OBJECTS[tile]]
  return FLAT[tile] ? [FLAT[tile]] : []
}

// People rise one pixel on every breath, out of step with each other, so the map is never still.
// A bobbing arrow marks anyone nearby who has something to say.
const isNear = (map, player, x, y) => {
  const height = rowsOf(map).length
  const dy = loops(map) ? wrapped(player.y - y + height / 2, height) - height / 2 : player.y - y
  return Math.hypot(player.x - x, dy) <= NEAR_TILES
}

function drawPerson(map, tile, x, y, left, top, opened, player) {
  const variant = mix(x, y, 0)
  const now = performance.now()
  const breath = Math.floor(now / BREATH_MS + (variant % 4)) % 2
  drawCell(sprite(isNpc(map, tile) ? NPC_ROW[tile] : VILLAGER_ROWS[variant % VILLAGER_ROWS.length]), left, top - breath)
  if (!talks(map, tile, opened) || !isNear(map, player, x, y)) return
  const arrowTop = top - 7 + snap(Math.sin(now / 230 + (variant % 7)) * 2)
  ARROW.forEach((line, row) => [...line].forEach((pixel, column) => {
    if (pixel === '.') return
    ctx.fillStyle = pixel === 'o' ? ARROW_OUTLINE : ARROW_FILL
    ctx.fillRect(left + 4 + column, arrowTop + row, 1, 1)
  }))
}

// Grass meets sand with a ragged edge, a few pixels deep, instead of a straight seam.
function drawBorder(map, x, y, left, top) {
  ctx.fillStyle = SAND_COLOR
  const edges = [
    (i, depth) => [left + i, top, 1, depth], (i, depth) => [left + TILE - depth, top + i, depth, 1],
    (i, depth) => [left + i, top + TILE - depth, 1, depth], (i, depth) => [left, top + i, depth, 1],
  ]
  CROSS.forEach(([dx, dy], side) => {
    if (tileAt(map, x + dx, y + dy) !== Tile.SAND) return
    for (let i = 0; i < TILE; i++) ctx.fillRect(...edges[side](i, 1 + (mix(x * TILE + i, y, side + 1) % BORDER_DEPTH)))
  })
}

function drawWater(map, mapX, mapY, left, top) {
  const [up, right, down, west, northWest, northEast, southEast, southWest] = NEIGHBORS.map(
    ([dx, dy]) => tileAt(map, mapX + dx, mapY + dy) !== Tile.WATER,
  )
  const paint = (color, [x, y, width, height]) => {
    ctx.fillStyle = color
    ctx.fillRect(left + x, top + y, width, height)
  }
  paint([up, right, down, west, northWest, northEast, southEast, southWest].some(Boolean) ? WATER_SHALLOW : WATER_DEEP, [0, 0, TILE, TILE])
  const phase = Math.floor(performance.now() / RIPPLE_MS) % 2
  const seed = (mapX * 7 + mapY * 13) % 5
  paint(WATER_RIPPLE, [3 + seed + phase * 2, 4 + (seed % 3) * 3, 3, 1])
  paint(WATER_RIPPLE, [8 - seed + phase * 2, 11 - (seed % 2) * 4, 3, 1])
  const banks = [
    [up, [0, 1, TILE, 1], [0, 0, TILE, 1]],
    [down, [0, TILE - 2, TILE, 1], [0, TILE - 1, TILE, 1]],
    [west, [1, 0, 1, TILE], [0, 0, 1, TILE]],
    [right, [TILE - 2, 0, 1, TILE], [TILE - 1, 0, 1, TILE]],
  ]
  banks.filter(([isLand]) => isLand).forEach(([, foam, bank]) => {
    paint(WATER_FOAM, foam)
    paint(WATER_BANK, bank)
  })
  const corners = [
    [northWest, up, west, [0, 0]], [northEast, up, right, [TILE - 1, 0]],
    [southEast, down, right, [TILE - 1, TILE - 1]], [southWest, down, west, [0, TILE - 1]],
  ]
  corners.filter(([diagonal, a, b]) => diagonal && !a && !b).forEach(([, , , [x, y]]) => paint(WATER_BANK, [x, y, 1, 1]))
}

function roofCell(map, mapX, mapY) {
  const isRoof = (dx, dy) => tileAt(map, mapX + dx, mapY + dy) === Tile.ROOF
  const column = !isRoof(-1, 0) ? 0 : !isRoof(1, 0) ? 2 : 1
  const row = !isRoof(0, -1) ? 0 : !isRoof(0, 1) ? 2 : 1
  return cell(CITY, row * 4 + column)
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
      const row = loops(map) ? wrapped(mapY, rows.length) : mapY
      tileCells(map, tile, mapX, row, opened).forEach((layer) => drawCell(layer, left, top))
      if (tile === Tile.GRASS) drawBorder(map, mapX, mapY, left, top)
      if (isPerson(map, tile)) drawPerson(map, tile, mapX, row, left, top, opened, player)
      if (tile === Tile.WATER) drawWater(map, mapX, mapY, left, top)
      if (tile === Tile.ROOF) drawCell(roofCell(map, mapX, mapY), left, top)
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
