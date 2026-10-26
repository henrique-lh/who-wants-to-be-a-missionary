import assert from 'node:assert/strict'
import { CHAPTERS, MapId, VERSES } from './bible.js'
import { Key, Mode, currentStep, initialState, interactable, isDoor, isNpc, isReading, pagesOf, puzzleOf, rowsOf, typeText, update, visibleItems } from './game.js'

const map = MapId.EDEN
const rows = rowsOf(map)
const { puzzles, readings } = CHAPTERS[map]
const tiles = rows.join('')
assert(rows.every((row) => row.length === rows[0].length), 'map rows must have equal length')
for (const letter of Object.keys(puzzles)) {
  assert(tiles.includes(letter), `landmark ${letter} on the map`)
  assert(tiles.includes(letter.toUpperCase()), `door for ${letter}`)
}
assert.equal(new Set([...tiles].filter((tile) => isDoor(map, tile))).size, Object.keys(puzzles).length)
for (const key of Object.keys(readings)) assert(tiles.includes(key), `reading ${key} on the map`)
for (const { ref } of Object.values(readings)) assert(VERSES[ref], `${ref} in the verse file`)

const press = (state, ...keys) => keys.reduce((s, key) => update(s, key), state)
const finishDialogue = (state) => (state.mode === Mode.DIALOGUE ? finishDialogue(update(state, Key.CONFIRM)) : state)
const walkTo = (state, x) => press(state, ...Array(Math.max(0, x - state.player.x)).fill(Key.RIGHT))
const positionOf = (tile) => {
  const y = rows.findIndex((row) => row.includes(tile))
  return { x: rows[y].indexOf(tile), y }
}
// Every stone has open ground below it.
const besideStone = (state, key) => ({ ...state, player: { x: positionOf(key).x, y: positionOf(key).y + 1 } })
const lane = positionOf('@').y
const visitLandmark = (state, letter) => update(walkTo(state, positionOf(letter).x), Key.CONFIRM)

function pickAt(state, wanted) {
  const visible = visibleItems(state.puzzle)
  return press(state, ...Array(visible.indexOf(wanted(visible))).fill(Key.DOWN), Key.CONFIRM)
}
const correctPick = (state) => pickAt(state, (visible) => visible.find((item) => currentStep(puzzleOf(state), state.puzzle.picked).answers.includes(item)))
const wrongPick = (state) => pickAt(state, (visible) => visible.find((item) => !currentStep(puzzleOf(state), state.puzzle.picked).answers.includes(item)))
const typeAnswer = (state) =>
  update(typeText(state, puzzleOf(state).keywords[currentStep(puzzleOf(state), state.puzzle.picked).answers[0]][0]), Key.CONFIRM)
const settle = (state) =>
  state.mode === Mode.DIALOGUE ? settle(update(state, Key.CONFIRM))
  : state.mode === Mode.PUZZLE ? settle(puzzleOf(state).keywords ? typeAnswer(state) : correctPick(state))
  : state
// Step beside a stone, read it (filling its blank if it has one), and come back.
const readStone = (state, key) => ({ ...settle(update(besideStone(state, key), Key.CONFIRM)), player: state.player })

const start = finishDialogue(initialState())
assert.equal(start.map, map)
assert.equal(pagesOf(start), 0)
assert.deepEqual(start.bible, [])

// stones and landmarks are solid
const belowStone = besideStone(start, '1')
assert.deepEqual(update(belowStone, Key.UP).player, belowStone.player)

// movement is continuous: any direction responds at once, by the distance given
const nudged = update(update(start, Key.RIGHT, 0.2), Key.DOWN, 0.2)
assert.deepEqual(nudged.player, { x: start.player.x + 0.2, y: start.player.y + 0.2 })

// a closed river crossing blocks and points to the region's puzzle
const firstCrossing = positionOf('A').x
const bumped = update(walkTo(start, firstCrossing - 1), Key.RIGHT)
assert.equal(bumped.player.x, firstCrossing - 1)
assert.equal(bumped.mode, Mode.DIALOGUE)
assert.deepEqual(bumped.dialogue.lines, puzzles.a.closedLines)

// the pedestals wait for all seven day stones and say how many are missing
const early = visitLandmark(readStone(start, '1'), 'a')
assert.equal(early.mode, Mode.DIALOGUE)
assert.deepEqual(early.dialogue.lines, puzzles.a.missingLines(6))
assert.equal(finishDialogue(early).mode, Mode.MAP)

// the bottom prompt knows what the player stands next to
assert.equal(interactable(belowStone), '1')
assert.equal(interactable(start), undefined)

// reading a stone adds it to the notebook once
const twice = readStone(readStone(start, '1'), '1')
assert.deepEqual(twice.read, ['1'])

// the tree puzzle needs God's command from the region before
const command = { ...start, opened: ['A', 'B'], player: { x: positionOf('c').x - 3, y: lane } }
assert.deepEqual(visitLandmark(command, 'c').dialogue.lines, puzzles.c.missingLines(1))

// a day stone hides its verse behind a blank to fill from the Bible: a wrong word keeps the text to fix,
// accents and case do not matter, and only the right word reads the stone into the notebook
const blank = update(belowStone, Key.CONFIRM)
assert.equal(blank.mode, Mode.PUZZLE)
assert.match(puzzleOf(blank).prompt, /Gênesis 1:3-5/)
const missed = update(typeText(blank, 'trevas'), Key.CONFIRM)
assert.equal(missed.puzzle.wrong, true)
assert.deepEqual(missed.read, [])
assert.equal(update(missed, Key.ERASE).puzzle.typed, 'treva')
const filled = update(typeText(blank, 'A LUZ'), Key.CONFIRM)
assert.equal(filled.mode, Mode.DIALOGUE)
assert.deepEqual(finishDialogue(filled).read, ['1'])
assert.equal(update(typeText(update(besideStone(start, '2'), Key.CONFIRM), 'Céus'), Key.CONFIRM).mode, Mode.DIALOGUE)
assert.equal(typeText(start, 'x'), start)

// the seventh filled day stone lights the pedestals and opens the first crossing
const sixDays = ['1', '2', '3', '4', '5', '6'].reduce(readStone, start)
assert.deepEqual(sixDays.opened, [])
assert.deepEqual(visitLandmark(sixDays, 'a').dialogue.lines, puzzles.a.missingLines(1))
const days = readStone(sixDays, '7')
assert.deepEqual(days.opened, ['A'])

// wrong answer keeps progress and flags a hint
let puzzle = finishDialogue(visitLandmark({ ...days, player: { x: positionOf('b').x, y: lane } }, 'b'))
assert.equal(puzzle.mode, Mode.PUZZLE)
puzzle = correctPick(puzzle)
puzzle = wrongPick(puzzle)
assert.equal(puzzle.mode, Mode.PUZZLE)
assert.equal(puzzle.puzzle.wrong, true)
assert.equal(puzzle.puzzle.picked.length, 1)

// the notebook opens inside a puzzle and closes back to it without losing progress
const reading = update(puzzle, Key.NOTEBOOK)
assert.equal(reading.mode, Mode.NOTEBOOK)
assert.equal(update(reading, Key.DOWN).notebook.cursor, 1)
const back = update(update(reading, Key.DOWN), Key.NOTEBOOK)
assert.equal(back.mode, Mode.PUZZLE)
assert.deepEqual(back.puzzle, puzzle.puzzle)

// full run: read every stone, solve every puzzle along the path, leave through the gate
let state = Object.keys(readings).reduce(readStone, start)
for (const [index, letter] of Object.keys(puzzles).entries()) {
  state = settle(visitLandmark(state, letter))
  assert.equal(state.mode, Mode.MAP)
  assert.equal(state.opened.length, index + 1)
}
assert.equal(pagesOf(state), CHAPTERS[map].pages.length)
assert.deepEqual(state.bible, ['Gênesis 1', 'Gênesis 2', 'Gênesis 3'])
state = settle(walkTo(state, rows[lane].indexOf('>')))
assert.equal(state.mode, Mode.END)
assert(!isNpc(map, '>') && !isReading(map, '>'))
console.log('ok')
