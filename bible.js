// DRAFT: verse texts were written from memory (Almeida style) and are NOT verified.
// Check every entry against the chosen translation before relying on it. Translation: to confirm.
export const PuzzleType = Object.freeze({ ORDER: 'order', CHOICE: 'choice' })
export const MapId = Object.freeze({ JERUSALEM: 'jerusalem', JUDEA: 'judea' })

export const VERSES = {
  'Marcos 16:15': 'E disse-lhes: Ide por todo o mundo, pregai o evangelho a toda criatura.',
  'Atos 1:8': 'mas recebereis a virtude do Espírito Santo, que há de vir sobre vós; e ser-me-eis testemunhas tanto em Jerusalém como em toda a Judeia e Samaria, e até aos confins da terra.',
  'Atos 2:38': 'E disse-lhes Pedro: Arrependei-vos, e cada um de vós seja batizado em nome de Jesus Cristo, para perdão dos pecados; e recebereis o dom do Espírito Santo.',
  'Atos 4:12': 'E em nenhum outro há salvação, porque também debaixo do céu nenhum outro nome há, dado entre os homens, pelo qual devamos ser salvos.',
  'Atos 8:4': 'Mas os que andavam dispersos iam por toda a parte, anunciando a palavra.',
  'Atos 9:42': 'E isto foi notório por toda a Jope, e muitos creram no Senhor.',
  'Atos 10:43': 'A este dão testemunho todos os profetas, de que todos os que nele creem receberão a remissão dos pecados pelo seu nome.',
}

const quote = (ref) => `${ref}: "${VERSES[ref]}"`

export const DOOR_LINES = ['A porta está fechada. Fale com quem está por perto.']
export const DONE_LINES = ['Siga em frente.']
export const END_LINES = ['Continua...', 'Próximo mapa: Samaria (ainda não construído).']

// Puzzles by character letter. ORDER: items are listed in the correct order and shuffled on screen.
// CHOICE: `answer` is the index of the correct item. Event labels are paraphrases, not quotes.
export const CHAPTERS = {
  [MapId.JERUSALEM]: {
    introLines: [
      'Você recebeu uma missão. Siga a estrada até Jerusalém.',
      quote('Marcos 16:15'),
      quote('Atos 1:8'),
      'Setas: andar. Z: falar e confirmar. X: voltar.',
    ],
    exitLines: ['Jerusalém ficou para trás. Próximo destino: Judeia.'],
    puzzles: {
      a: {
        type: PuzzleType.ORDER,
        ref: 'Atos 2:1-41',
        prompt: 'Coloque os fatos de Pentecostes na ordem.',
        introLines: ['Uma mulher viu o dia de Pentecostes e quer contar tudo na ordem certa. Ajude-a.'],
        items: [
          'Veio do céu um som, como de um vento impetuoso.',
          'Línguas como de fogo pousaram sobre cada um.',
          'Todos ficaram cheios do Espírito Santo e passaram a falar outras línguas.',
          'Pedro se levantou e falou à multidão.',
          'Cerca de três mil pessoas foram acrescentadas.',
        ],
        solvedLines: ['Assim aconteceu o dia de Pentecostes (Atos 2:1-41). A porta se abriu.'],
      },
      b: {
        type: PuzzleType.ORDER,
        ref: 'Atos 2:38',
        prompt: 'Monte a resposta de Pedro.',
        introLines: ['Um homem na multidão quer saber o que fazer. Monte a resposta de Pedro em Atos 2:38.'],
        items: [
          'Arrependei-vos,',
          'e cada um de vós seja batizado em nome de Jesus Cristo,',
          'para perdão dos pecados;',
          'e recebereis o dom do Espírito Santo.',
        ],
        solvedLines: [quote('Atos 2:38'), 'A porta se abriu.'],
      },
      c: {
        type: PuzzleType.CHOICE,
        ref: 'Atos 4:12',
        prompt: 'O que Pedro respondeu?',
        introLines: ['Alguém pergunta se existe outro nome pelo qual possamos ser salvos. Escolha a resposta de Atos 4:12.'],
        items: [
          VERSES['Atos 4:12'],
          'Há muitos nomes, e cada pessoa pode escolher o seu caminho.',
          'Basta ser sincero e bom. O nome não importa.',
        ],
        answer: 0,
        solvedLines: [quote('Atos 4:12'), 'A porta se abriu.'],
      },
    },
  },
  [MapId.JUDEA]: {
    introLines: ['Judeia. Os discípulos foram espalhados, e a palavra foi com eles.'],
    exitLines: ['Judeia ficou para trás. Próximo destino: Samaria.'],
    puzzles: {
      a: {
        type: PuzzleType.ORDER,
        ref: 'Atos 7:58-8:4',
        prompt: 'Coloque os fatos na ordem.',
        introLines: ['Um homem fugiu de Jerusalém e quer lembrar o que aconteceu. Ajude-o a contar na ordem certa.'],
        items: [
          'Estêvão foi apedrejado, e Saulo consentia na sua morte.',
          'Levantou-se grande perseguição contra a igreja em Jerusalém.',
          'Todos, menos os apóstolos, foram dispersos pelas terras da Judeia e de Samaria.',
          'Os que andavam dispersos iam por toda a parte anunciando a palavra.',
        ],
        solvedLines: [quote('Atos 8:4'), 'A porta se abriu.'],
      },
      b: {
        type: PuzzleType.CHOICE,
        ref: 'Atos 9:42',
        prompt: 'O que aconteceu depois?',
        introLines: ['Uma mulher de Jope conta que Pedro levantou Tabita, uma discípula. Escolha o que aconteceu depois, segundo Atos 9:42.'],
        items: [
          VERSES['Atos 9:42'],
          'Os moradores de Jope mandaram Pedro embora da cidade.',
          'Ninguém em Jope ficou sabendo do que aconteceu.',
        ],
        answer: 0,
        solvedLines: [quote('Atos 9:42'), 'A porta se abriu.'],
      },
      c: {
        type: PuzzleType.ORDER,
        ref: 'Atos 10:43',
        prompt: 'Monte o testemunho de Pedro.',
        introLines: ['Em Cesareia, um centurião chamado Cornélio quer ouvir Pedro. Monte as palavras dele em Atos 10:43.'],
        items: [
          'A este dão testemunho todos os profetas,',
          'de que todos os que nele creem',
          'receberão a remissão dos pecados',
          'pelo seu nome.',
        ],
        solvedLines: [quote('Atos 10:43'), 'A porta se abriu.'],
      },
    },
  },
}
