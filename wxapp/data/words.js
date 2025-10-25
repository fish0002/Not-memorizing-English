// 单词数据库配置
const WORD_LEVELS = {
  CET4: 'CET4',
  CET6: 'CET6',
  GRADUATE: '考研',
  IELTS: '雅思',
  TOEFL: '托福'
};

// 词性枚举
const PART_OF_SPEECH = {
  n: '名词',
  v: '动词',
  adj: '形容词',
  adv: '副词',
  prep: '介词',
  conj: '连词',
  pron: '代词',
  art: '冠词',
  num: '数词',
  int: '感叹词'
};

// CET4 词库示例
const CET4_WORDS = [
  {
    word: 'abandon',
    level: WORD_LEVELS.CET4,
    phonetic: '/əˈbændən/',
    translations: [
      {
        pos: 'v',
        meaning: '放弃，抛弃；离弃',
        examples: [
          {
            en: 'He would never abandon his friends.',
            zh: '他永远不会抛弃他的朋友。'
          }
        ]
      }
    ],
    synonyms: ['desert', 'forsake', 'give up'],
    antonyms: ['keep', 'maintain', 'retain'],
    roots: {
      prefix: 'a-',
      root: 'ban',
      explanation: 'a-(加强语气) + ban(禁止) → 完全禁止 → 放弃'
    },
    mnemonics: '联想记忆：a+ban(禁止)+don(做) → 禁止再做 → 放弃',
    usageNote: '常用搭配：abandon hope/ship/plan'
  },
  {
    word: 'ability',
    level: WORD_LEVELS.CET4,
    phonetic: '/əˈbɪləti/',
    translations: [
      {
        pos: 'n',
        meaning: '能力，才能；能耐',
        examples: [
          {
            en: 'He has the ability to solve complex problems.',
            zh: '他有解决复杂问题的能力。'
          }
        ]
      }
    ],
    synonyms: ['capability', 'capacity', 'skill'],
    antonyms: ['inability', 'incapability', 'weakness'],
    roots: {
      root: 'abil',
      suffix: '-ity',
      explanation: 'abil(能够) + ity(名词后缀) → 能力'
    },
    mnemonics: '词根记忆：able的名词形式，表示"有能力的"状态',
    usageNote: '常用搭配：have/possess the ability to do sth'
  }
];

// CET6 词库示例
const CET6_WORDS = [
  {
    word: 'abundant',
    level: WORD_LEVELS.CET6,
    phonetic: '/əˈbʌndənt/',
    translations: [
      {
        pos: 'adj',
        meaning: '丰富的，充裕的；大量的',
        examples: [
          {
            en: 'The region has abundant natural resources.',
            zh: '该地区自然资源丰富。'
          }
        ]
      }
    ],
    synonyms: ['plentiful', 'copious', 'ample'],
    antonyms: ['scarce', 'insufficient', 'sparse'],
    roots: {
      prefix: 'ab-',
      root: 'und',
      suffix: '-ant',
      explanation: 'ab-(离开) + und(波浪) + ant(形容词后缀) → 像波浪一样溢出 → 丰富的'
    },
    mnemonics: '词根记忆：und(波浪)，像波浪一样涌出，表示丰富',
    usageNote: '常用搭配：abundant in/with sth'
  }
];

// 考研词库示例
const GRADUATE_WORDS = [
  {
    word: 'pragmatic',
    level: WORD_LEVELS.GRADUATE,
    phonetic: '/præɡˈmætɪk/',
    translations: [
      {
        pos: 'adj',
        meaning: '实用的，实际的；务实的',
        examples: [
          {
            en: 'We need a pragmatic approach to solve this problem.',
            zh: '我们需要一个务实的方法来解决这个问题。'
          }
        ]
      }
    ],
    synonyms: ['practical', 'realistic', 'functional'],
    antonyms: ['idealistic', 'impractical', 'theoretical'],
    roots: {
      root: 'pragma',
      suffix: '-tic',
      explanation: 'pragma(行动) + tic(形容词后缀) → 注重行动的 → 务实的'
    },
    mnemonics: '联想记忆：pragma(实践) → 强调实践的重要性 → 务实的',
    usageNote: '常用搭配：pragmatic approach/solution/view'
  }
];

// 导出所有单词数据
const allWords = [
  ...CET4_WORDS,
  ...CET6_WORDS,
  ...GRADUATE_WORDS
];

// 按级别分类的单词
const wordsByLevel = {
  [WORD_LEVELS.CET4]: CET4_WORDS,
  [WORD_LEVELS.CET6]: CET6_WORDS,
  [WORD_LEVELS.GRADUATE]: GRADUATE_WORDS
};

module.exports = {
  WORD_LEVELS,
  PART_OF_SPEECH,
  allWords,
  wordsByLevel
}; 