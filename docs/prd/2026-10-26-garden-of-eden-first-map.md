# PRD: Garden of Eden, the first map of the Bible reconstruction story

**Date:** 2026-10-26
**Status:** Draft
**Supersedes:** the missionary route in `2026-10-15-who-wants-to-be-a-missionary.md`. Its engine, look and Scripture rules still apply.

## Problem

The game was built around a missionary following the route in Atos 1:8. The author now wants a puzzle game that tells the Bible story in order, one map per major event. The current build opens in Jerusalém (Atos 2), has no frame story tying the maps together, and its puzzles only test facts from a passage: nothing on the map has to be explored or understood to solve them. The first map needs to be redesigned around the Garden of Eden, with a frame story that explains why the player walks through these events.

## Background

- **Current build.** Two maps, Jerusalém and Judeia, wide horizontal strips cut by stone gates. Townspeople give puzzles. Two puzzle types: *order* (sequence events) and *choice* (pick the right answer). Wrong answers show a hint with the reference; no game over. All Bible text lives in one verification file (`bible.js`), still marked unverified and written from memory.
- **Reusable art.** Grass, water with banks and depth, trees, rocks, paths. A garden needs more variety: flowers, bushes, fruit trees, fallen leaves, stepping stones.
- **Rules that stay.** Game text in Portuguese, addressed to the player as "você". Scripture is the only source of truth. Every verse is quoted word for word with its reference. No puzzle depends on a claim outside the passage. Evangelical focus.
- **Why now.** The engine and art exist, and the content is small. Changing direction now costs two maps of puzzle text.

## Decisions

- Jerusalém and Judeia are removed from the game. Acts sits near the end of a chronological journey and does not fit the new story today. Git history keeps them.
- The working title "Who Wants to Be a Missionary" stays for now.
- The protagonist has no name yet. The game speaks to the player as "você".

## Concept

### Frame story

In a country where the faith is banned, Bibles are burned and believers meet in hiding, you are a young Christian. An old believer leaves you a Bible with nothing inside: the cover and binding survived, every page was torn out and lost. You set out to rebuild it, page by page, so the word can be passed on again.

Each map is one event from Scripture. You arrive **after the event happened**. The place still holds its traces, and you read them to understand what took place. When you understand it, the matching pages come back and are bound into the Bible. Between maps, a short scene in your hiding place shows the Bible getting thicker.

### Map 1: the Garden of Eden

The garden is empty because the man and the woman have already been sent out (Gênesis 3:23-24). This gives three things:
- It fits "understand past events": fig leaves on the ground, the trees in the middle, thorns spreading. All clues.
- Adam, Eve and God are never drawn as sprites. God's words appear only as quoted Scripture.
- The exit is the east, guarded by cherubim and a flaming sword (Gênesis 3:24). Adam and Eve left that way, and the engine already flows west to east.

**Layout.** Gênesis 2:10-14: one river leaves Eden and splits into four heads (Pisom, Giom, Hidequel, Eufrates). The four branches cut the garden into four regions crossed in order. A crossing (stepping stones or a fallen log) appears when the previous region's page is recovered. This replaces the stone gates with something that belongs in a garden.

```
 W                                                                                                      E
 [1 Os Dias] ~Pisom~ [2 O Homem e a Mulher] ~Giom~ [3 O Meio do Jardim] ~Hidequel~ [4 Espinhos e Cardos] ~Eufrates~ [Portão Leste]
  Gn 1:1-2:3          Gn 1:26-2:25                   Gn 3:1-7                       Gn 3:8-24                         querubins
```

**Look.** A huge, ordinary garden, not a faithful reconstruction: varied trees (fig, fruit trees, large shade trees), streams and ponds, rocks, flowers, tall grass, bushes, fallen leaves. Animals wander as silent ambient life.

**Puzzle sources.** Nobody lives in the garden, so landmarks give puzzles: inscribed stones, the two trees, the river, the gate. No townspeople.

### Knowledge loop

1. **Caderno (notebook).** Reading an inscribed stone or finding a trace (fig leaves, a stone carved with a day) adds an entry with its reference. The notebook opens at any time, including inside a puzzle. Region puzzles need entries found elsewhere on the map.
2. **Folhas rasgadas (torn pages).** Solving a region's main puzzle gives one torn page. Four in total. The main puzzle at the east gate needs all four.

### Puzzles

| # | Region | Puzzle | Type | Needs | Passage |
|---|---|---|---|---|---|
| 1 | Os Dias | **The seven stones.** Seven stones, each carved with one day's work, lie scattered across the region. Find them and set them on seven pedestals in order. The catch: light on day 1, sun on day 4. | Collect, then order | The 7 day stones | Gn 1:1-2:3 |
| 1b | Os Dias | **Gather the waters.** Push rocks to dam a stream so "the dry land appears" and opens a path. | Block pushing | Notebook: Gn 1:9 | Gn 1:9-10 |
| 2 | O Homem e a Mulher | **The account of chapter 2.** Order it: formed from dust, breath of life, placed in the garden to tend and keep it, the command, animals named, no suitable helper, deep sleep, the rib, "osso dos meus ossos". | Order | Gives the command stone (Gn 2:16-17), the key for region 3 | Gn 2:7-23 |
| 2b | O Homem e a Mulher | **Why that name?** The verse gives the reason: "varoa, porquanto do varão foi tomada" (2:23), "Eva, porquanto era a mãe de todos os viventes" (3:20). | Find the answer in the passage | Notebook | Gn 2:23, 3:20 |
| 3 | O Meio do Jardim | **What did God say?** Three texts side by side: the command (2:16-17), the serpent's question and claim (3:1, 3:4-5), the woman's answer (3:2-3). Mark every word dropped, added or changed ("livremente" vanishes, "nem nele tocareis" is added, "certamente morrerás" becomes "certamente não morrereis"). Only textual differences, never motives. | Find the changes | The command from region 2 | Gn 2:16-17, 3:1-5 |
| 3b | O Meio do Jardim | **Three looks.** Order 3:6-7: good for food, pleasant to the eyes, desirable to make wise, took, ate, gave to her husband, eyes opened, fig leaves. | Order | Fig leaves found near the trees | Gn 3:6-7 |
| 4 | Espinhos e Cardos | **The sentences.** Assign each consequence to who received it: the serpent (belly, dust, enmity), the woman (pain, desire, rule), the man and the ground (cursed ground, thorns and thistles, sweat, return to dust). | Matching | Inscriptions across the thorny ground | Gn 3:14-19 |
| 4b | Espinhos e Cardos | **"Onde estás?"** Who blamed whom: the man blames the woman, the woman blames the serpent. | Order or choice | Notebook | Gn 3:8-13 |
| **Main** | Portão Leste | **Rebuild the account.** The four torn pages are pieces of one sheet. Fit them together; edges only line up in the right order (creation, humankind, fall, consequences). Done right, the whole of Gênesis 1-3 reads through. | Fitting pieces | The 4 torn pages | Gn 1-3 |

**Closing scene.** Gênesis 1-3 return to the Bible. Before you leave, two verses that point to grace are quoted: God makes coats of skins (3:21), and the woman's seed will bruise the serpent's head (3:15). The game makes no claim about what 3:15 means. It stays an open promise for later maps. Then "Continua...".

**Accuracy.** Scripture says "fruto". The fruit is never drawn as an apple.

## Requirements

### Must Have

- **New frame story.** A short prologue: persecution, the empty Bible, the mission to rebuild it. Its text names no real country or event.
- **Eden is map 1.** The game starts in the garden. Jerusalém and Judeia are deleted from the game.
- **Garden map.** Four regions split by the river's four branches, plus the east gate. Varied trees, water, streams, rocks, flowers, bushes, fallen leaves.
- **Landmarks give puzzles.** Stones, trees, river, gate. Adam, Eve and God are never drawn.
- **Notebook.** Entries collected by reading or finding things. Opens at any time, including inside a puzzle. Each entry shows its reference.
- **Torn pages.** Each region gives one page when its main puzzle is solved; the next crossing appears then.
- **Puzzles 1, 2, 3, 4 and Main** from the table, including two new types: *find the changes* (3) and *fitting pieces* (Main).
- **At least one cross-region dependency.** Puzzle 3 cannot be solved without the command found in region 2.
- **Bible screen.** Shows rebuilt pages by book and chapter. After Eden it shows Gênesis 1-3.
- **All rules from the original PRD hold.** Verses word for word with reference, one verification file, hint with the passage on a wrong answer, no game over.

### Should Have

- Puzzles 1b (block pushing), 2b, 3b, 4b.
- **Visible consequence.** After puzzle 3, thorns spread into region 4 and the garden loses some colour.
- **River side puzzle (Gn 2:10-14).** Match each river to its land. In Havilá, collect gold, bdélio and pedra sardônica (2:11-12).
- **The serpent as a text presence** in region 3, speaking only its words from Gn 3:1 and 3:4-5.
- A hiding-place scene between maps showing the Bible growing.

### Out of Scope

- **Jerusalém and Judeia.** Removed. Their art (water, trees, rocks) is reused.
- **Choosing the next maps.** Map 2 (likely Noé or Babel) gets its own PRD.
- **Persecution and evangelism gameplay** (stealth, hiding, spreading the word). Persecution lives in the story text only.
- **Hebrew wordplay the passage does not explain** (adam / adamá). It breaks the "Scripture is the only source" rule.
- Save, sound, publishing, as before.

## Constraints

- **Translation.** "varoa / varão" and names like "Hidequel" only hold in the Almeida Revista e Corrigida family. The edition must be public domain, as the original PRD requires. Modern revisions may not be free to embed.
- **Depiction.** God is never a character; Adam and Eve are not drawn. God speaks only through quoted verses.
- **Interpretation.** Puzzles ask what the text *says* (order, differences, who received what), never why someone acted.
- **Art.** New garden tiles come from free-license packs (Kenney is CC0), checked per pack, 16x16 to match the current tiles.
- **Engine.** Tile grid, west to east, as today. Notebook, torn pages, Bible screen and the two new puzzle types are new. Block pushing is the most expensive, hence Should Have.

## Acceptance Criteria

### Prologue and start
- Given a new game, when it starts, then a prologue shows the persecution and the empty Bible, and you start at the west end of the garden.
- Given the prologue ends, then the Bible screen is empty with zero pages.
- Given any game text, then it addresses the player as "você".

### Exploration and notebook
- Given I stand next to an inscribed stone and press confirm, then I read its text with the reference and a new notebook entry appears.
- Given I am inside a puzzle, when I open the notebook, then I read every collected entry without losing puzzle progress.
- Given I have not found all seven day stones, when I use the pedestals, then I am told how many are missing and the puzzle does not start.

### Regions and crossings
- Given a region's main puzzle is unsolved, when I walk into the river, then I cannot cross and I see a hint pointing to the region's puzzle.
- Given I solve a region's main puzzle, then I receive a torn page and the crossing to the next region appears and stays.

### Puzzle "What did God say?"
- Given I have not read the command (Gn 2:16-17), when I open the puzzle, then I am told to look for the command in region 2.
- Given I mark a word that did not change, then I see a hint with the reference and can try again.
- Given I mark every change, then I receive the region 3 page.

### Main puzzle and ending
- Given I have fewer than four pages, when I reach the east gate, then the cherubim block the way and the game says how many pages are missing.
- Given I fit the four pages in the wrong order, then the edges do not line up and I can keep trying.
- Given I fit them correctly, then the Bible screen shows Gênesis 1-3, the closing scene quotes 3:21 and 3:15, and the game ends with "Continua..." without crashing.

### Accuracy
- Given any verse on screen, then it matches the verification file word for word and shows its reference.
- Given the fruit of the tree, then it is not drawn as an apple.
