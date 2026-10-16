// One character per tile. See Tile in game.js. Lowercase = character, uppercase = door.
// Loops top to bottom: walking off the last row returns to the first, so rows 0 and 23 must join.
// Gates are full-height walls with one door, so nobody walks around them.
export const ROWS = [
  '#gTgTTggggggTgTggggggggg#ggggggggggg.gggggggggTg#ggggggggggsssssssssssss#ssssXs#',
  '#gggggggggggggggggTggggg#ggggggggggg.ggggTggTggg#ggggggggggRsssRssssssss#ssssss#',
  '#ggggggggggggggggggggggg#gggg~~~gggg.gggTggggggg#ggggggTgggsssssXsssssss#ssssss#',
  '#gggggg~~~~gggggggggTggg#ggg~~~~~ggg.gTTgggggggg#gggggsssssssssgggssssss#ssssss#',
  '#ggggg~~~~~~ggTggggggTgg#ggg~~~~~ggg.ggggggggggg#gggggssXssssssgggssssss#ssssss#',
  '#ggggg~~~~~~ggggTgTggggg#gggg~~~gggg.ggggggggggg#gggggsssssssssgggssssss#ssRsss#',
  '#ggggg~~~~~~ggggTggggggg#ggggggggggg.ggggggggggg#gggTgggggggssssssssssss#ssssss#',
  '#gggggg~~~~ggggggggggggg#ggggggggggg.ggggggggggg#gggTgggggggsssssXssssss#sssXss#',
  '#gTggggggggggggggggTgggg#gggggggTggg.ggggggggggg#gggggggggggsssssssXssss#ssssss#',
  '#ggggggggggggggTggggTggg#ggggggggggg.ggTggTggggg#gggggsssggssssgTgRssXss#sXssss#',
  '#gggggggggggTgggTgTggggg#ggggggggggg.ggggggggggg#gggggssRTgRsssgggssssss#ssssss#',
  '#gggggggggggggggggggggga#ggggggggggg.ggggggggggb#gggggsssggssssgggsssssc#ssssss#',
  '#@......................A.......................B.......................C.....>#',
  '#ggggggggggggggggggggggg#ggggggggggg.ggggggggggg#ggggggggsssggggggggssss#ssssss#',
  '#ggggggggggggggggggggggg#ggggggTTggg.ggggTggTggg#ggggggggsssggggggggssss#ssssss#',
  '#gggggggggggggggggggggTg#gggggggTggg.gTgggggggTg#ggggggsssssgggsssggssss#ssssss#',
  '#ggggggggggggg~~~~ggggTg#gggggggggTg.ggggggggggg#ggggggXXsRsgggsssggssss#ssssss#',
  '#gggggTgggTgg~~~~~~ggggg#ggggTgggggg.gggg~~~gggg#ggggggsssssgggsssggssss#ssssss#',
  '#ggggTggggggg~~~~~~ggTgg#gggggggggTg.ggg~~~~~ggg#gggggssssssgggsssgggsss#ssssss#',
  '#gTggTggggggg~~~~~~gggTg#ggggggTgggg.ggg~~~~~ggg#gTgggssssssgggsssgggsss#ssssss#',
  '#gggggTggggggg~~~~gggggg#gggggggggTg.gggg~~~gggg#gggggssssssgggssXgggsss#ssXsss#',
  '#ggggTTggggggggggggggggg#gggggTggggg.ggggggggggg#gsggggggRssssssssgggsss#ssssss#',
  '#ggggTgggggggggggggggggg#ggggggggggg.ggggggggggg#gsggggggsssssssssgggRXs#ssssss#',
  '#gTTgggggggggggggggggggg#gggTggggggg.gggggTggggg#gsggggggsssssssssgggXss#ssssss#',
]
