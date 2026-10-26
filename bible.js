// DRAFT: verse texts were written from memory (Almeida Revista e Corrigida style) and are NOT verified.
// Check every entry against a public domain Almeida edition before relying on it.
export const PuzzleType = Object.freeze({ ORDER: 'order', FIND: 'find', TYPE: 'type' })
export const MapId = Object.freeze({ EDEN: 'eden' })

export const VERSES = {
  'Gênesis 1:3': 'E disse Deus: Haja luz. E houve luz.',
  'Gênesis 1:7': 'E fez Deus a expansão e fez separação entre as águas que estavam debaixo da expansão e as águas que estavam sobre a expansão. E assim foi.',
  'Gênesis 1:9': 'E disse Deus: Ajuntem-se as águas debaixo dos céus num lugar; e apareça a porção seca. E assim foi.',
  'Gênesis 1:16': 'E fez Deus os dois grandes luminares: o luminar maior para governar o dia, e o luminar menor para governar a noite; e fez as estrelas.',
  'Gênesis 1:21': 'E Deus criou as grandes baleias, e todo réptil de alma vivente que as águas abundantemente produziram conforme as suas espécies, e toda ave de asas conforme a sua espécie. E viu Deus que era bom.',
  'Gênesis 1:27': 'E criou Deus o homem à sua imagem; à imagem de Deus o criou; macho e fêmea os criou.',
  'Gênesis 1:31': 'E viu Deus tudo quanto tinha feito, e eis que era muito bom. E foi a tarde e a manhã: o dia sexto.',
  'Gênesis 2:2': 'E, havendo Deus acabado no dia sétimo a sua obra, que tinha feito, descansou no sétimo dia de toda a sua obra, que tinha feito.',
  'Gênesis 2:8': 'E plantou o SENHOR Deus um jardim no Éden, da banda do Oriente, e pôs ali o homem que tinha formado.',
  'Gênesis 2:16-17': 'E ordenou o SENHOR Deus ao homem, dizendo: De toda árvore do jardim comerás livremente, mas da árvore da ciência do bem e do mal, dela não comerás; porque, no dia em que dela comeres, certamente morrerás.',
  'Gênesis 2:23': 'E disse Adão: Esta é agora osso dos meus ossos e carne da minha carne; esta será chamada varoa, porquanto do varão foi tomada.',
  'Gênesis 3:7': 'Então, foram abertos os olhos de ambos, e conheceram que estavam nus; e coseram folhas de figueira, e fizeram para si aventais.',
  'Gênesis 3:14': 'Então, o SENHOR Deus disse à serpente: Porquanto fizeste isso, maldita serás mais que toda besta e mais que todos os animais do campo; sobre o teu ventre andarás e pó comerás todos os dias da tua vida.',
  'Gênesis 3:15': 'E porei inimizade entre ti e a mulher e entre a tua semente e a sua semente; esta te ferirá a cabeça, e tu lhe ferirás o calcanhar.',
  'Gênesis 3:16': 'E à mulher disse: Multiplicarei grandemente a tua dor e a tua conceição; com dor terás filhos; e o teu desejo será para o teu marido, e ele te dominará.',
  'Gênesis 3:19': 'No suor do teu rosto comerás o teu pão, até que te tornes à terra; porque dela foste tomado, porquanto és pó e em pó te tornarás.',
  'Gênesis 3:21': 'E fez o SENHOR Deus a Adão e a sua mulher túnicas de peles e os vestiu.',
  'Gênesis 3:23': 'O SENHOR Deus, pois, o lançou fora do jardim do Éden, para lavrar a terra, de que fora tomado.',
  'Gênesis 3:24': 'E, havendo lançado fora o homem, pôs querubins ao oriente do jardim do Éden e uma espada inflamada que andava ao redor, para guardar o caminho da árvore da vida.',
}

export const quote = (ref) => `${ref}: "${VERSES[ref]}"`

export const DONE_LINES = ['Não há mais nada aqui.']
export const END_LINES = ['Continua...', 'Gema recuperada: Gênesis.', 'Próximo mapa: ainda não construído.']

const FOUND_SHARD = 'Você encontrou um fragmento de uma gema maior. Uma ponte se ergueu sobre o rio.'
const DEEP_RIVER = 'O rio é fundo demais para atravessar aqui.'
// Doors of the region puzzles. Each one opens with a shard of the Genesis gem, and the gate needs all of them.
const SHARDS = ['A', 'B', 'C', 'D']

// A day stone asks what happened on its day, with a hint and no passage named. The right word lights the stone,
// gives the player that day's gem and puts the verse in the notebook.
const dayStone = (day, ref, hint, answer, keywords) => ({
  title: `Pedra do ${day} dia`,
  ref,
  puzzle: {
    type: PuzzleType.TYPE,
    prompt: `${hint} O que Deus fez neste dia?`,
    slots: ['Resposta'],
    items: [answer],
    keywords: [keywords],
    solvedLines: ['A pedra se acendeu e deixou uma gema na sua mão.', quote(ref)],
  },
})

// Landmarks give puzzles, keyed by their lowercase letter; the uppercase letter is the door they open.
// Readings are stones the player reads into the notebook. A puzzle only starts once its `needs` are
// read (reading keys) or opened (door letters). A landmark without a puzzle type opens its door when visited with its needs met. ORDER items are listed in the correct order and shuffled
// on screen. FIND steps list the items to pick, step by step, in any order within a step. TYPE items are filled in order by
// typing one of the item's keywords (lowercase, no accents); the slot shows the item once it is right.
// Event labels are paraphrases, not quotes.
export const CHAPTERS = {
  [MapId.EDEN]: {
    introLines: [
      'Num país onde a fé é proibida, as Bíblias são queimadas e os cristãos se reúnem escondidos.',
      'Um irmão idoso deixou com você a capa de uma Bíblia. As folhas foram queimadas. Na capa restaram engastes vazios, à espera de gemas.',
      'Cada gema guarda uma parte da história. Juntas, elas lembram a palavra inteira.',
      'A primeira parte começa num jardim.',
      quote('Gênesis 2:8'),
      'Setas: andar. Z: ler e confirmar. X: voltar. C: caderno.',
    ],
    exitLines: ['Você deixou o jardim pelo oriente.'],
    shards: SHARDS,
    readings: {
      1: dayStone('primeiro', 'Gênesis 1:3', 'Primeiro dia. Trevas cobriam o abismo, até a primeira palavra.', 'Luz', ['luz']),
      2: dayStone('segundo', 'Gênesis 1:7', 'Segundo dia. Águas em cima, águas embaixo.', 'Céus', [
        'ceus', 'ceu', 'firmamento', 'expansao',
      ]),
      3: dayStone('terceiro', 'Gênesis 1:9', 'Terceiro dia. As águas se ajuntaram num só lugar.', 'Terra', [
        'terra', 'seca', 'mares', 'mar', 'plantas', 'erva', 'ervas', 'arvores',
      ]),
      4: dayStone('quarto', 'Gênesis 1:16', 'Quarto dia. Sinais para as estações, os dias e os anos.', 'Luminares', [
        'luminares', 'luminar', 'sol', 'lua', 'estrelas', 'estrela',
      ]),
      5: dayStone('quinto', 'Gênesis 1:21', 'Quinto dia. Uns nadam, outros voam.', 'Peixes e aves', [
        'peixes', 'peixe', 'aves', 'ave', 'passaros', 'passaro', 'baleias',
      ]),
      6: dayStone('sexto', 'Gênesis 1:27', 'Sexto dia. Feito do pó, à imagem de quem o fez.', 'Homem', [
        'homem', 'humano', 'humanidade', 'adao', 'mulher', 'animais',
      ]),
      7: dayStone('sétimo', 'Gênesis 2:2', 'Sétimo dia. A obra estava acabada.', 'Descanso', [
        'descansou', 'descanso', 'repousou', 'repouso', 'cessou', 'nada',
      ]),
      O: { title: 'A ordem de Deus', ref: 'Gênesis 2:16-17' },
      S: { title: 'O que foi dito à serpente', ref: 'Gênesis 3:14' },
      M: { title: 'O que foi dito à mulher', ref: 'Gênesis 3:16' },
      H: { title: 'O que foi dito ao homem', ref: 'Gênesis 3:19' },
    },
    puzzles: {
      a: {
        needs: ['1', '2', '3', '4', '5', '6', '7'],
        missingLines: (count) => [
          'Sete pedestais formam um círculo. Na base, uma inscrição: "No princípio..."',
          `Cada pedestal espera a gema de um dia. Ainda faltam ${count}.`,
        ],
        closedLines: [DEEP_RIVER],
        solvedLines: ['As sete gemas encontraram seus lugares.', quote('Gênesis 1:31'), FOUND_SHARD],
      },
      b: {
        type: PuzzleType.ORDER,
        needs: [],
        closedLines: [DEEP_RIVER],
        prompt: 'Ponha o relato de Gênesis 2 na ordem.',
        introLines: ['Uma pedra grande conta como o homem e a mulher foram feitos, mas as frases estão fora de ordem.'],
        items: [
          'Deus formou o homem do pó da terra.',
          'Soprou em seus narizes o fôlego da vida.',
          'Pôs o homem no jardim do Éden.',
          'O homem deu nome aos animais.',
          'Fez cair um sono pesado sobre o homem.',
          'Da costela, formou a mulher.',
        ],
        solvedLines: [quote('Gênesis 2:23'), FOUND_SHARD],
      },
      c: {
        type: PuzzleType.FIND,
        needs: ['O'],
        missingLines: () => ['Junto à árvore, falas estão gravadas no chão, mas você não tem com o que compará-las.'],
        closedLines: [DEEP_RIVER],
        prompt: 'Deus disse: "De toda árvore do jardim comerás livremente, mas da árvore da ciência do bem e do mal, dela não comerás; porque, no dia em que dela comeres, certamente morrerás."',
        introLines: ['No meio do jardim estão as árvores. Junto a elas, as falas da serpente e da mulher estão gravadas no chão.'],
        items: [
          'Serpente: "Não comereis de toda árvore do jardim?"',
          'Mulher: "Do fruto das árvores do jardim comeremos"',
          'Mulher: "Não comereis dele"',
          'Mulher: "nem nele tocareis"',
          'Serpente: "Certamente não morrereis."',
          'Serpente: "no dia em que dele comerdes"',
        ],
        steps: [{ label: 'Marque cada trecho que mudou.', answers: [0, 1, 3, 4] }],
        solvedLines: ['Você encontrou cada mudança.', quote('Gênesis 3:7'), FOUND_SHARD],
      },
      d: {
        type: PuzzleType.FIND,
        needs: ['S', 'M', 'H'],
        missingLines: (count) => ['Uma pedra rachada pergunta o que foi dito a cada um.', `Você ainda não conhece ${count} das respostas.`],
        closedLines: [DEEP_RIVER],
        prompt: 'Separe as sentenças de Gênesis 3:14-19.',
        introLines: ['Uma pedra rachada pergunta: o que foi dito a cada um?'],
        items: [
          'Andará sobre o ventre.',
          'Comerá pó todos os dias da vida.',
          'Terá dor ao dar à luz filhos.',
          'O desejo será para o marido.',
          'Comerá o pão no suor do rosto.',
          'Tornará ao pó.',
        ],
        steps: [
          { label: 'O que foi dito à serpente?', answers: [0, 1] },
          { label: 'O que foi dito à mulher?', answers: [2, 3] },
          { label: 'O que foi dito ao homem?', answers: [4, 5] },
        ],
        solvedLines: [quote('Gênesis 3:23'), FOUND_SHARD],
      },
      e: {
        type: PuzzleType.ORDER,
        needs: SHARDS,
        missingLines: () => ['Os querubins guardam o caminho.'],
        closedLines: ['Uma espada inflamada guarda a passagem.'],
        prompt: 'Cada fragmento tem uma frase gravada. Encaixe-os na ordem do relato.',
        introLines: [quote('Gênesis 3:24')],
        items: [
          '"No princípio, criou Deus os céus e a terra..."',
          '"E formou o SENHOR Deus o homem do pó da terra..."',
          '"Ora, a serpente era mais astuta que todas as alimárias do campo..."',
          '"E ouviram a voz do SENHOR Deus, que passeava no jardim..."',
        ],
        gem: 'Gênesis',
        solvedLines: [
          'Os quatro fragmentos se uniram na gema do Gênesis. Ela brilha num engaste da capa.',
          quote('Gênesis 3:21'),
          quote('Gênesis 3:15'),
          'O caminho para o oriente está aberto.',
        ],
      },
    },
  },
}
