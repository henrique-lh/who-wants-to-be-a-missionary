import assert from 'node:assert/strict'
import { CHAPTERS, MapId, PuzzleType, VERSES } from './bible.js'
import { Key, Mode, Tile, expectedIndex, initialState, isDoor, isNpc, loops, puzzleOf, rowsOf, tileAt, update, visibleItems } from './game.js'

const MAP_ORDER = [MapId.JERUSALEM, MapId.JUDEA]

for (const map of MAP_ORDER) {
  const rows = rowsOf(map)
  const puzzles = CHAPTERS[map].puzzles
  const tiles = rows.join('')
  assert(rows.every((row) => row.length === rows[0].length), `${map}: map rows must have equal length`)
  for (const npc of [...tiles].filter((tile) => isNpc(map, tile))) {
    assert(tiles.includes(npc.toUpperCase()), `${map}: door for ${npc}`)
  }
  assert.equal([...tiles].filter((tile) => isDoor(map, tile)).length, Object.keys(puzzles).length)
  for (const { type, ref, items } of Object.values(puzzles)) {
    if (type === PuzzleType.ORDER && VERSES[ref]) assert(VERSES[ref].includes(items.join(' ')), `${ref} chunks match verse`)
  }
}

// the first map loops top to bottom through open ground, the others are closed
const height = rowsOf(MapId.JERUSALEM).length
assert.equal(loops(MapId.JERUSALEM), true)
assert.equal(loops(MapId.JUDEA), false)
assert.equal(tileAt(MapId.JERUSALEM, 36, -1), tileAt(MapId.JERUSALEM, 36, height - 1))
assert.notEqual(tileAt(MapId.JERUSALEM, 36, 0), Tile.WALL)
assert.notEqual(tileAt(MapId.JERUSALEM, 36, height - 1), Tile.WALL)
assert.equal(tileAt(MapId.JUDEA, 2, -1), Tile.WALL)

const press = (state, ...keys) => keys.reduce((s, key) => update(s, key), state)
const finishDialogue = (state) => (state.mode === Mode.DIALOGUE ? finishDialogue(update(state, Key.CONFIRM)) : state)
const walkTo = (state, x) => press(state, ...Array(Math.max(0, x - state.player.x)).fill(Key.RIGHT))

function pickAt(state, wanted) {
  const visible = visibleItems(state.puzzle)
  return press(state, ...Array(visible.indexOf(wanted(visible))).fill(Key.DOWN), Key.CONFIRM)
}
const correctPick = (state) => pickAt(state, () => expectedIndex(puzzleOf(state), state.puzzle.picked))
const wrongPick = (state) =>
  pickAt(state, (visible) => visible.find((item) => item !== expectedIndex(puzzleOf(state), state.puzzle.picked)))
const settle = (state) =>
  state.mode === Mode.DIALOGUE ? settle(update(state, Key.CONFIRM))
  : state.mode === Mode.PUZZLE ? settle(correctPick(state))
  : state

// walking off the last row of the looping map continues on the first
const seam = { ...finishDialogue(initialState()), player: { x: 36, y: height - 1 } }
assert.equal(update(seam, Key.DOWN).player.y, height)

// city houses are solid
const street = { ...finishDialogue(initialState()), player: { x: 75, y: 12 } }
assert.deepEqual(update(street, Key.UP).player, street.player)

// closed door blocks and explains
let state = finishDialogue(initialState())
const firstDoorX = rowsOf(MapId.JERUSALEM).find((row) => row.includes('@')).search(/[A-Z]/)
state = walkTo(state, firstDoorX - 1)
const bumped = update(state, Key.RIGHT)
assert.equal(bumped.player.x, firstDoorX - 1)
assert.equal(bumped.mode, Mode.DIALOGUE)

// movement is continuous: any direction responds at once, by the distance given
const free = finishDialogue(initialState())
const nudged = update(update(free, Key.RIGHT, 0.2), Key.DOWN, 0.2)
assert.deepEqual(nudged.player, { x: free.player.x + 0.2, y: free.player.y + 0.2 })
assert.equal(update(state, Key.RIGHT, 0.3).mode, Mode.DIALOGUE, 'closed door blocks a partial step too')

// wrong answer keeps progress and flags a hint
let puzzleState = finishDialogue(update(finishDialogue(bumped), Key.CONFIRM))
assert.equal(puzzleState.mode, Mode.PUZZLE)
puzzleState = wrongPick(puzzleState)
assert.equal(puzzleState.mode, Mode.PUZZLE)
assert.equal(puzzleState.puzzle.wrong, true)
assert.equal(puzzleState.puzzle.picked.length, 0)

// full run: solve every puzzle of every map, cross each exit
state = finishDialogue(initialState())
for (const [index, map] of MAP_ORDER.entries()) {
  assert.equal(state.map, map)
  assert.equal(state.opened.length, 0)
  const rows = rowsOf(map)
  for (const letter of Object.keys(CHAPTERS[map].puzzles)) {
    state = settle(update(walkTo(state, rows.find((row) => row.includes(letter)).indexOf(letter)), Key.CONFIRM))
    assert.equal(state.mode, Mode.MAP)
  }
  assert.equal(state.opened.length, 3)
  state = settle(walkTo(state, rows[0].length - 2))
  assert.equal(state.mode, index === MAP_ORDER.length - 1 ? Mode.END : Mode.MAP)
}
console.log('ok')
