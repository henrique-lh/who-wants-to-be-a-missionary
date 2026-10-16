// One character per tile. See Tile in game.js. Lowercase = character, uppercase = door.
// Loops top to bottom: walking off the last row returns to the first, so rows 0 and 23 must join.
// Gates are full-height walls with one door, so nobody walks around them.
export const ROWS = [
  '#gTgTTggggggTgTggggggggg#ggggggggggg.gggggggggTg#ggggggggggsssssssssssss#sssssssssssgggPPPgggsssggggggg#',
  '#gggggggggggggggggTggggg#ggggggggggg.ggggTggTggg#ggggggggggRsssRssssssss#ssHHHHHssHHHHHPPPsHHHHHssHHHHH#',
  '#ggggggggggggggggggggggg#gggg~~~gggg.gggTggggggg#ggggggTgggsssssXsssssss#ssHHHHHssHHHHHPPPsHHHHHssHHHHH#',
  '#gggggg~~~~gggggggggTggg#ggg~~~~~ggg.gTTgggggggg#gggggsssssssssgggssssss#ssNMDMNssMNDNMPPPsNMDMNssMNDNM#',
  '#ggggg~~~~~~ggTggggggTgg#ggg~~~~~ggg.ggggggggggg#gggggssXssssssgggssssss#..............PPP.............#',
  '#ggggg~~~~~~ggggTgTggggg#gggg~~~gggg.ggggggggggg#gggggsssssssssgggssssss#ssssssssssssssPPPssssssssssssg#',
  '#ggggg~~~~~~ggggTggggggg#ggggggggggg.ggggggggggg#gggTgggggggssssssssssss#ssgggsssgggsssPPPXsXsssXssssss#',
  '#gggggg~~~~ggggggggggggg#ggggggggggg.ggggggggggg#gggTgggggggsssssXssssss#ssgggsssgggsXsPPPssssssssssXss#',
  '#gTggggggggggggggggTgggg#gggggggTggg.ggggggggggg#gggggggggggsssssssXssss#ssgggsssgggsssPPPsssssssssssss#',
  '#ggggggggggggggTggggTggg#ggggggggggg.ggTggTggggg#gggggsssggssssgTgRssXss#ssHHHHHssHHHHHPPPsHHHHHssHHHHH#',
  '#gggggggggggTgggTgTggggg#ggggggggggg.ggggggggggg#gggggssRTgRsssgggssssss#ssHHHHHssHHHHHPPPsHHHHHssHHHHH#',
  '#gggggggggggggggggggggga#ggggggggggg.ggggggggggb#gggggsssggssssgggsssssc#ssNMDMNssMNDNMPPPsNMDMNssMNDNM#',
  '#@......................A.......................B.......................C..............PPP............>#',
  '#ggggggggggggggggggggggg#ggggggggggg.ggggggggggg#ggggggggsssggggggggssss#ssssssssXsssssPPPsssssXsssssss#',
  '#ggggggggggggggggggggggg#ggggggTTggg.ggggTggTggg#ggggggggsssggggggggssss#ssssssssssssssPPPsssssssssssss#',
  '#gggggggggggggggggggggTg#gggggggTggg.gTgggggggTg#ggggggsssssgggsssggssss#ggssssssgggsssPPPTggXsssssssss#',
  '#ggggggggggggg~~~~ggggTg#gggggggggTg.ggggggggggg#ggggggXXsRsgggsssggssss#gTssssssgggsssPPPgggssssssssXs#',
  '#gggggTgggTgg~~~~~~ggggg#ggggTgggggg.gggg~~~gggg#ggggggsssssgggsssggssss#ssHHHHHssHHHHHPPPsHHHHHssHHHHH#',
  '#ggggTggggggg~~~~~~ggTgg#gggggggggTg.ggg~~~~~ggg#gggggssssssgggsssgggsss#ssHHHHHssHHHHHPPPsHHHHHssHHHHH#',
  '#gTggTggggggg~~~~~~gggTg#ggggggTgggg.ggg~~~~~ggg#gTgggssssssgggsssgggsss#ssNMDMNssMNDNMPPPsNMDMNssMNDNM#',
  '#gggggTggggggg~~~~gggggg#gggggggggTg.gggg~~~gggg#gggggssssssgggssXgggsss#..............PPP.............#',
  '#ggggTTggggggggggggggggg#gggggTggggg.ggggggggggg#gsggggggRssssssssgggsss#ggssssssggggggPPPsssXsssssssss#',
  '#ggggTgggggggggggggggggg#ggggggggggg.ggggggggggg#gsggggggsssssssssgggRXs#ggsXssssgTggggPPPsssssssssssss#',
  '#gTTgggggggggggggggggggg#gggTggggggg.gggggTggggg#gsggggggsssssssssgggXss#ggssssssggggggPPPssssssXssssss#',
]
