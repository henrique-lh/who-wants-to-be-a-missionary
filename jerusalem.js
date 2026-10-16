// One character per tile. See Tile in game.js. Lowercase = character, uppercase = door.
// Loops top to bottom: walking off the last row returns to the first, so rows 0 and 23 must join.
// Gates are full-height walls with one door, so nobody walks around them.
export const ROWS = [
  '#gTgTTggggggTgTggggggggg#ggggggggggg.gggggggggTg#gggggggggggsssRsssXssss#gHHHHHggggggggPPPsssssssssHHHH#',
  '#gggggggggggggggggTggggg#ggggggggggg.ggggTggTggg#ggTgggggggggsssssXsssss#gHHHHHggHHHHHgPPPsHHHHHHssHHHH#',
  '#ggggggggggggggggggggggg#gggg~~~gggg.gggTggggggg#ggggggggggggggsssssXsss#gHHHHHggHHHHHgPPPsHHHHHHssHHHH#',
  '#gggggg~~~~gggggggggTggg#ggg~~~~~ggg.gTTgggggggg#ggggggggggggggssssRssss#gMNDNMggNMDMNgPPPsMNMDMNssNMDM#',
  '#ggggg~~~~~~ggTggggggTgg#ggg~~~~~ggg.ggggggggggg#ggggggggggggggsRssssXss#..............PPP.............#',
  '#ggggg~~~~~~ggggTgTggggg#gggg~~~gggg.ggggggggggg#ggggTgggggggssXssssssss#ggTggvgggggwggPPPsssssssRwssss#',
  '#ggggg~~~~~~ggggTggggggg#ggggggggggg.ggggggggggg#ggggggTggTgssssssssssXs#gggggggggggggTPPPsssssXsssssss#',
  '#gggggg~~~~ggggggggggggg#ggggggggggg.ggggggggggg#ggggggggggsssssXssssXss#gggggggggTggggPPPwRssssssXssss#',
  '#gTggggggggggggggggTgggg#gggggggTggg.ggggggggggg#gTggggggsssssssssssssss#gggggggggHHHHHPPPsHHHHHsssssss#',
  '#ggggggggggggggTggggTggg#ggggggggggg.ggTggTggggg#ggggTgggsssRRssssXsssss#ggHHHHHggHHHHHPPPsHHHHHssHHHHH#',
  '#gggggggggggTgggTgTggggg#ggggggggggg.ggggggggggg#gggTggggsssssssssssssss#ggHHHHHggHHHHHPPPsHHHHHssHHHHH#',
  '#ggggggggggggggggvggggga#ggggggggggg.gggvggggggb#gggggggggssssssssvssssc#ggMNDNMggNMDMNPPPsMNDNMssNMDMN#',
  '#@......................A.......................B.......................C..............PPP............>#',
  '#gggggggggwggggggggggggg#gggggwggggg.ggggggvgggg#ggggggwggggggssssssssss#gggggggggTggTgPPPwsssXsssssXss#',
  '#ggggggggggggggggggggggg#ggggggTTggg.ggggTggTggg#ggggggggggggggsssssRsss#ggggTggggggvggPPPsXsswsssssvss#',
  '#gggggggggggggggggggggTg#gggggggTggg.gTgggggggTg#ggggggggggggggsssssssss#gggggggvggggggPPPssXssssssssss#',
  '#ggggggggggggg~~~~ggggTg#gggggggggTg.ggggggggggg#ggggggggggTgggssXsssXss#gggggggggHHHHgPPPssssssssHHHHH#',
  '#gggggTgggTgg~~~~~~ggggg#ggggTgggggg.gggg~~~gggg#ggggggggggTgsssssssXsRs#gHHHHHHggHHHHgPPPssHHHHHsHHHHH#',
  '#ggggTggggggg~~~~~~ggTgg#gggggggggTg.ggg~~~~~ggg#gggggTgggggssssssRRssss#gHHHHHHggHHHHgPPPssHHHHHsHHHHH#',
  '#gTggTggggggg~~~~~~gggTg#ggggggTgggg.ggg~~~~~ggg#ggTTggggggsssssRssXssss#gMNMDMNggNMDMgPPPssMNDNMsNMDMN#',
  '#gggggTggggggg~~~~gggggg#gggggggggTg.gggg~~~gggg#ggggggggsssssssssssXsss#..............PPP.............#',
  '#ggggTTggggggggggggggggg#gggggTggggg.ggggggggggg#ggggggggsssssssRsssssss#ggggggggggggggPPPssssswsssssss#',
  '#ggggTgggggggggggggggggg#ggggggggggg.ggggggggggg#gTggTgggsssssssssssssss#ggggggggggvgggPPPssXsssXssssss#',
  '#gTTgggggggggggggggggggg#gggTggggggg.gggggTggggg#gggggTgggsssssXssssssss#ggggggggggggggPPPsssssssXssssX#',
]
