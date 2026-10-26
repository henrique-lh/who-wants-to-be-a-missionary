import { CHAPTERS, END_LINES, PuzzleType, quote } from './bible.js'
import {
  Key, Mode, Tile, currentStep, initialState, interactable, isDoor, isNpc, isReading, isTyping, puzzleOf, puzzlesOf, readingsOf, shardsOf, rowsOf, tileAt, typeText,
  update, visibleItems,
} from './game.js'

const SCALE = 6
const STEP_MS = 350
const TILE = 16
const VIEW_W = 15
const VIEW_H = 10
const LINE = 9
// `gap` is the margin between cells in the sheet.
const sheet = (src, columns, gap = 0) => ({ image: Object.assign(new Image(), { src }), columns, gap })
const TOWN = sheet('assets/town.png', 12)
const RPG = sheet('assets/rpg.png', 57, 1)
const SPRITES = sheet('assets/sprites.png', 9)
const cell = (from, index) => ({ sheet: from, index })
const rpg = (column, row) => cell(RPG, row * RPG.columns + column)
const GRASS = cell(TOWN, 0)
const PATH = cell(TOWN, 25)
const EXIT = cell(TOWN, 109)
const DAY_STONE = rpg(46, 16)
const SLAB = rpg(44, 17)
// Ground comes in variants picked by position, so the garden gets tufts, flowers and fallen leaves.
const SURFACES = {
  [Tile.GRASS]: [
    ...Array(24).fill([GRASS]), [cell(TOWN, 1)], [cell(TOWN, 2)], [GRASS, rpg(29, 9)], [GRASS, rpg(30, 9)], [GRASS, rpg(31, 9)],
    [GRASS, rpg(28, 9)], [GRASS, rpg(43, 23)], [GRASS, rpg(22, 10)],
  ],
  [Tile.CRACKED]: [[rpg(6, 0)]],
}
// Objects stand on the ground around them, in variants picked by position.
const OBJECTS = {
  [Tile.TREE]: [rpg(13, 9), rpg(15, 9), rpg(16, 9), rpg(18, 9), rpg(13, 9), rpg(14, 9), rpg(19, 9), rpg(24, 9)],
  [Tile.ROCK]: [rpg(55, 21), rpg(54, 22), rpg(54, 19)],
  [Tile.DEAD_TREE]: [rpg(27, 9)],
}
const LANDMARKS = { a: rpg(48, 16), b: rpg(50, 16), c: rpg(23, 9), d: rpg(50, 16) }
const WATER_SHALLOW = '#6fb8ee'
const WATER_DEEP = '#4d97dd'
const WATER_BANK = '#47324b'
const WATER_FOAM = '#a8dcf7'
const WATER_RIPPLE = '#8cc9f0'
const RIPPLE_MS = 700
const NEIGHBORS = [[0, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [1, -1], [1, 1], [-1, 1]]
// Hand-drawn pixels, one character per pixel. '.' is transparent.
const PIXEL_COLORS = {
  o: '#47324b', y: '#ffd54f', w: '#ffffff', s: '#f0c8a0', r: '#e5533d', l: '#d8e2ee', b: '#7a5230', g: '#5d7a2e', p: '#c8925a',
}
const CHERUB = [
  '................', '.yy..........yy.', 'yyyy..oooo..yyyy', 'yyyyyossssoyyyyy', '.yyyyossssoyyyy.', '.yyyyoossooyyyy.',
  '..yyyowwwwoyyy..', '..yyowwwwwwoyy..', '...yowwwwwwoy...', '....owwwwwwo....', '....owwwwwwo....', '...owwwwwwwwo...',
  '...owwwwwwwwo...', '...oooooooooo...', '....oo....oo....',
]
const FLAMING_SWORD = [
  '.......rr.......', '......ryyr......', '.....ryllyr.....', '......rllr......', '.....ryllyr.....', '......rllr......',
  '.....ryllyr.....', '......rllr......', '.......ll.......', '.......ll.......', '....oooooooo....', '.......oo.......',
  '.......oo.......', '......oyyo......', '.......oo.......',
]
const THORNS = [
  '................', '................', '...b......b.....', '.b..b..b..b..b..', '..bbgb.b.bgbb...', 'b..bggbbbggb..b.',
  '.b.gbgbgbgbgb.b.', '..bbgbbgbbgbbb..', '.bgbbggbggbbgb..', 'bggbgbbgbbgbggb.', '.gbbgbgbgbgbbg..', '..bgbbgbbgbgb...',
  '...bbgbbgbbb....',
]
const CRACKS = [
  '................', '..b.............', '...b.......b....', '...bb.....b.....', '.....b...b......', '......bbb.......',
  '......b.........', '.....b..........', '....b.......b...', '............b...', '...........b.b..', '..........b...b.',
]
// A lit mark on a day stone that was filled in.
const LIT = [...Array(8).fill(''), '........yy......', '.......ywwy.....', '.......ywwy.....', '........yy......']
// Planks run across the river, so a run of bridge tiles repeats seamlessly.
const BRIDGE = [
  'oooooooooooooooo', 'bbbbbbbbbbbbbbbb', 'oooooooooooooooo', ...Array(9).fill('pppopppopppopppo'), 'bbbobbbobbbobbbo',
  'oooooooooooooooo', 'bbbbbbbbbbbbbbbb', 'oooooooooooooooo',
]
// One color per gem, in the order of the pedestals' needs. Placed gems fly one by one into a ring of sockets.
const GEM_COLORS = ['#fff59d', '#81d4fa', '#9ccc65', '#ffb74d', '#4db6ac', '#e57373', '#ce93d8']
const GEM_RING = 6
const GEM_STAGGER_MS = 160
const GEM_FLIGHT_MS = 450
// A bridge lays its planks one pixel column at a time, west to east, the first time it comes into view,
// after any gems have landed.
const BUILD_MS_PER_COLUMN = 30
const BRIDGE_DELAY_MS = GEM_STAGGER_MS * 6 + GEM_FLIGHT_MS + 200
const CROSS = [[0, -1], [1, 0], [0, 1], [-1, 0]]
const FACING_COLUMN = { [Key.DOWN]: 0, [Key.UP]: 1, [Key.LEFT]: 2, [Key.RIGHT]: 2 }
const WALK_FRAMES = [0, 1, 0, 2]
const KEYS = {
  ArrowUp: Key.UP, w: Key.UP, ArrowDown: Key.DOWN, s: Key.DOWN, ArrowLeft: Key.LEFT, a: Key.LEFT,
  ArrowRight: Key.RIGHT, d: Key.RIGHT, z: Key.CONFIRM, Enter: Key.CONFIRM, x: Key.CANCEL, Escape: Key.CANCEL, c: Key.NOTEBOOK,
  Tab: Key.NOTEBOOK, Backspace: Key.ERASE,
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
  return kinds.find((tile) => tile === Tile.GRASS || tile === Tile.CRACKED) ?? Tile.GRASS
}

// A door with water above or below is a river crossing; the other one is the gate.
const inRiver = (map, x, y) => tileAt(map, x, y - 1) === Tile.WATER || tileAt(map, x, y + 1) === Tile.WATER
const isWet = (map, x, y) => {
  const tile = tileAt(map, x, y)
  return tile === Tile.WATER || (isDoor(map, tile) && inRiver(map, x, y))
}
const variantOf = (cells, x, y) => cells[mix(x, y, 0) % cells.length]

function tileCells(map, tile, x, y, opened) {
  if (tile === Tile.WATER) return []
  if (isDoor(map, tile)) return inRiver(map, x, y) ? [] : [PATH]
  if (SURFACES[tile]) return variantOf(SURFACES[tile], x, y)
  if (tile === Tile.PATH || tile === Tile.SPAWN) return [PATH]
  if (tile === Tile.EXIT) return [EXIT]
  const ground = SURFACES[surfaceKind(map, x, y)][0]
  if (OBJECTS[tile]) return [...ground, variantOf(OBJECTS[tile], x, y)]
  if (LANDMARKS[tile]) return [...ground, LANDMARKS[tile]]
  if (isReading(map, tile)) return [...ground, /\d/.test(tile) ? DAY_STONE : SLAB]
  return ground
}

const isLit = ({ map, read }, tile) => isReading(map, tile) && Boolean(readingsOf(map)[tile].puzzle) && read.includes(tile)
// The landmark without a puzzle of its own: the pedestals that take the day gems.
const altarOf = (map) => Object.entries(puzzlesOf(map)).find(([, landmark]) => !landmark.type)
const positionOf = (map, tile) => {
  const y = rowsOf(map).findIndex((row) => row.includes(tile))
  return { x: rowsOf(map)[y].indexOf(tile), y }
}

function drawPixels(pattern, left, top, width = Infinity) {
  pattern.forEach((line, row) => [...line].forEach((pixel, column) => {
    if (pixel === '.' || column >= width) return
    ctx.fillStyle = PIXEL_COLORS[pixel]
    ctx.fillRect(left + column, top + row, 1, 1)
  }))
}

function drawWater(map, mapX, mapY, left, top) {
  const [up, right, down, west, northWest, northEast, southEast, southWest] = NEIGHBORS.map(
    ([dx, dy]) => !isWet(map, mapX + dx, mapY + dy),
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

function drawCell({ sheet: from, index }, x, y) {
  const column = index % from.columns
  const row = Math.floor(index / from.columns)
  ctx.drawImage(from.image, column * (TILE + from.gap), row * (TILE + from.gap), TILE, TILE, x, y, TILE, TILE)
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

const runIndex = (map, tile, x, y) => (tileAt(map, x - 1, y) === tile ? 1 + runIndex(map, tile, x - 1, y) : 0)
let seenAt = {}

// Time since an opened tile was first drawn, so its animation plays when the player can see it.
function sinceSeen(tile) {
  const now = performance.now()
  if (!seenAt[tile]) seenAt = { ...seenAt, [tile]: now }
  return now - seenAt[tile]
}

function drawBridge(map, tile, x, y, left, top) {
  drawPixels(BRIDGE, left, top, (sinceSeen(tile) - BRIDGE_DELAY_MS) / BUILD_MS_PER_COLUMN - runIndex(map, tile, x, y) * TILE)
}

function drawSocket(x, y) {
  ctx.fillStyle = PIXEL_COLORS.o
  ctx.fillRect(x - 1, y, 3, 1)
  ctx.fillRect(x, y - 1, 1, 3)
}

function drawGem(color, x, y) {
  ctx.fillStyle = PIXEL_COLORS.o
  ctx.fillRect(x - 2, y - 1, 5, 3)
  ctx.fillRect(x - 1, y - 2, 3, 5)
  ctx.fillStyle = color
  ctx.fillRect(x - 1, y, 3, 1)
  ctx.fillRect(x, y - 1, 1, 3)
  ctx.fillStyle = PIXEL_COLORS.w
  ctx.fillRect(x, y - 1, 1, 1)
}

// The pedestals show a ring of empty sockets until the gems are placed; then each gem flies in from the player.
function drawAltar({ map, opened }, camX, camY, from) {
  const [letter, { needs }] = altarOf(map)
  const { x, y } = positionOf(map, letter)
  const centre = { x: snap((x - camX) * TILE) + 8, y: snap((y - camY) * TILE) + 8 }
  const since = opened.includes(letter.toUpperCase()) ? sinceSeen(letter) : -Infinity
  needs.forEach((_, index) => {
    const angle = (index / needs.length) * 2 * Math.PI - Math.PI / 2
    const slot = { x: centre.x + Math.round(Math.cos(angle) * GEM_RING), y: centre.y + Math.round(Math.sin(angle) * GEM_RING) }
    const flight = clamp((since - index * GEM_STAGGER_MS) / GEM_FLIGHT_MS, 0, 1)
    if (!flight) return drawSocket(slot.x, slot.y)
    drawGem(GEM_COLORS[index], Math.round(from.x + (slot.x - from.x) * flight), Math.round(from.y + (slot.y - from.y) * flight))
  })
}

// While the pedestals wait, the gems already earned show at the top left.
function drawCarried({ map, read, opened }) {
  const [letter, { needs }] = altarOf(map)
  if (opened.includes(letter.toUpperCase()) || !needs.some((need) => read.includes(need))) return
  drawBox(4, 4, needs.length * 7 + 5, 11)
  needs.forEach((need, index) => (read.includes(need) ? drawGem(GEM_COLORS[index], 9 + index * 7, 9) : drawSocket(9 + index * 7, 9)))
}

function drawMap(state) {
  const { map, opened, player } = state
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
      if (isWet(map, mapX, mapY)) drawWater(map, mapX, mapY, left, top)
      tileCells(map, tile, mapX, mapY, opened).forEach((layer) => drawCell(layer, left, top))
      if (isDoor(map, tile) && inRiver(map, mapX, mapY) && opened.includes(tile)) drawBridge(map, tile, mapX, mapY, left, top)
      if (tile === Tile.CRACKED && mix(mapX, mapY, 1) % 2) drawPixels(CRACKS, left, top)
      if (tile === Tile.THORNS) drawPixels(THORNS, left, top)
      if (isLit(state, tile)) drawPixels(LIT, left, top)
      if (isNpc(map, tile) && !LANDMARKS[tile]) drawPixels(CHERUB, left, top)
      if (isDoor(map, tile) && !inRiver(map, mapX, mapY) && !opened.includes(tile)) drawPixels(FLAMING_SWORD, left, top)
    }
  }
  const playerLeft = snap((player.x - camX) * TILE)
  const playerTop = snap((player.y - camY) * TILE)
  drawPlayer(player, playerLeft, playerTop)
  drawAltar(state, camX, camY, { x: playerLeft + 8, y: playerTop + 6 })
}

// A small box at the right edge names the buttons for what the player can do now.
function drawHint(text, top) {
  const width = Math.ceil(ctx.measureText(text).width) + 12
  drawBox(236 - width, top, width, 14)
  ctx.fillText(text, 242 - width, top + 4)
}

const HINTS = {
  [PuzzleType.ORDER]: 'Z: escolher  X: sair  C: caderno',
  [PuzzleType.FIND]: 'Z: escolher  X: sair  C: caderno',
  [PuzzleType.TYPE]: 'Enter: gravar  Tab: caderno  Esc: sair',
}

function drawPrompt(state) {
  const tile = interactable(state)
  if (tile) drawHint(isReading(state.map, tile) ? 'Z: ler' : 'Z: examinar', 142)
}

const drawSlots = ({ slots, items }, { picked, typed }, top) =>
  slots.reduce((y, slot, index) => drawText(
    picked.includes(index) ? `✓ ${slot}: ${items[index]}` : index === picked.length ? `> ${slot}: ${typed}_` : `· ${slot}:`,
    10, y + 2, 220,
  ), top)

const stepLine = ({ label, answers }, picked) => `${label} Faltam ${answers.filter((answer) => !picked.includes(answer)).length}.`

function drawPuzzle(state) {
  const { puzzle } = state
  const definition = puzzleOf(state)
  drawBox(4, 4, 232, 152)
  const afterPrompt = drawText(definition.prompt, 10, 10, 220)
  if (definition.type === PuzzleType.TYPE) drawSlots(definition, puzzle, afterPrompt + 2)
  else drawChoices(definition, puzzle, afterPrompt)
  if (puzzle.wrong) drawText('Não é isso.', 10, 140, 220)
  drawHint(HINTS[definition.type], 140)
}

function drawChoices(definition, puzzle, afterPrompt) {
  const afterPicked = definition.type === PuzzleType.ORDER
    ? puzzle.picked.length ? drawText(`Montado: ${puzzle.picked.map((item) => definition.items[item]).join(' ')}`, 10, afterPrompt + 2, 220) : afterPrompt
    : drawText(stepLine(currentStep(definition, puzzle.picked), puzzle.picked), 10, afterPrompt + 2, 220)
  visibleItems(puzzle).reduce(
    (top, item, row) => drawText(`${row === puzzle.cursor ? '>' : ' '} ${definition.items[item]}`, 10, top + 2, 220),
    afterPicked + 2,
  )
}

const NOTEBOOK_ROWS = 5

function drawNotebook(state) {
  const { map, read, gems, notebook } = state
  const readings = readingsOf(map)
  drawBox(4, 4, 232, 152)
  const afterTitle = drawText('Caderno (C fecha)', 10, 10, 220)
  const afterShards = drawText(`Fragmentos: ${shardsOf(state)} de ${CHAPTERS[map].shards.length}`, 10, afterTitle + 2, 220)
  const afterGems = drawText(`Gemas: ${gems.length ? gems.join(', ') : 'nenhuma ainda'}`, 10, afterShards, 220)
  if (!read.length) return drawText('Caderno vazio.', 10, afterGems + 6, 220)
  const first = clamp(notebook.cursor - 2, 0, Math.max(0, read.length - NOTEBOOK_ROWS))
  const afterList = read.slice(first, first + NOTEBOOK_ROWS).reduce(
    (top, key, row) => drawText(`${first + row === notebook.cursor ? '>' : ' '} ${readings[key].title}`, 10, top, 220),
    afterGems + 6,
  )
  drawText(quote(readings[read[notebook.cursor]].ref), 10, afterList + 6, 220)
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
  if (state.mode === Mode.MAP || state.mode === Mode.DIALOGUE) drawCarried(state)
  if (state.mode === Mode.MAP) drawPrompt(state)
  if (state.mode === Mode.PUZZLE) drawPuzzle(state)
  if (state.mode === Mode.NOTEBOOK) drawNotebook(state)
  if (state.mode === Mode.DIALOGUE) {
    drawBox(4, 100, 232, 56)
    drawText(state.dialogue.lines[0], 10, 106, 220)
    drawHint('Z: continuar', 86)
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
  if (direction && state.mode === Mode.MAP) {
    facing = direction
    state = update(state, direction, elapsed / STEP_MS)
  }
  draw(state)
  requestAnimationFrame(frame)
}

addEventListener('keydown', (event) => {
  if (isTyping(state) && event.key.length === 1) {
    event.preventDefault()
    state = typeText(state, event.key)
    return
  }
  const key = KEYS[event.key]
  if (!key) return
  event.preventDefault()
  if (event.repeat && key !== Key.ERASE) return
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
