Page({
  data: {
    currentWord: {
      word: 'Hello',
      phonetic: '/həˈləʊ/',
      meaning: 'n. 招呼，问候； int. 喂，你好'
    },
    progress: {
      current: 10,
      total: 50,
      percent: 20
    }
  },

  onLoad: function () {
    // 页面加载时执行
    this.loadNextWord()
  },

  // 加载下一个单词
  loadNextWord: function () {
    // TODO: 从单词库中获取下一个单词
  },

  // 点击"认识"按钮
  handleKnown: function () {
    // TODO: 处理认识单词的逻辑
    this.loadNextWord()
  },

  // 点击"不认识"按钮
  handleUnknown: function () {
    // TODO: 处理不认识单词的逻辑
    this.loadNextWord()
  },

  // 更新学习进度
  updateProgress: function () {
    // TODO: 更新学习进度
  }
}) 