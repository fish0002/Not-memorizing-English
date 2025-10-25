const { WORD_LEVELS, wordsByLevel } = require('../../data/words.js');

let audioContext = null; // 声明全局音频实例变量

Page({
  data: {
    currentWord: null,
    progress: {
      current: 0,
      total: 50,
      percent: 0
    },
    wordHistory: [], // 用于存储浏览过的单词历史
    currentIndex: 0,  // 当前单词在历史中的索引
    unknownWords: [], // 存储不认识的单词
    isReviewMode: false, // 是否处于复习模式
    reviewIndex: 0, // 复习模式下当前单词索引
    isSpellingMode: false, // 是否处于拼写检验模式
    spellingInput: '', // 用户输入的拼写
    spellingWords: [], // 待检验的单词列表
    spellingIndex: 0, // 当前检验的单词索引
    spellingResult: '', // 拼写结果提示
    spellingCorrect: 0, // 拼写正确数量
    spellingTotal: 0, // 拼写总数量
    currentLevel: WORD_LEVELS.CET4, // 当前学习级别
    levelList: Object.values(WORD_LEVELS), // 级别列表
    levelIndex: 0, // 当前选中的级别索引
    showTranslation: false, // 是否显示翻译
    showExamples: false, // 是否显示例句
    showAnalysis: false, // 是否显示词根分析
  },

  onLoad: function () {
    // 加载用户设置
    const settings = wx.getStorageSync('userSettings') || {
      level: WORD_LEVELS.CET4,
      dailyTarget: 50
    }

    // 设置当前级别索引
    const levelIndex = this.data.levelList.indexOf(settings.level)

    this.setData({
      currentLevel: settings.level,
      levelIndex: levelIndex,
      'progress.total': settings.dailyTarget
    })

    // 加载今日进度
    this.loadTodayProgress()
    // 加载第一个单词
    this.loadNextWord()

    // 初始化音频实例
    audioContext = wx.createInnerAudioContext()
  },

  onUnload: function () {
    // 页面卸载时销毁音频实例
    if (audioContext) {
      audioContext.destroy()
      audioContext = null
    }
  },

  // 加载今日进度
  loadTodayProgress: function () {
    const today = new Date().toDateString()
    const progress = wx.getStorageSync('todayProgress') || {
      date: today,
      learned: 0,
      total: this.data.progress.total
    }

    if (progress.date !== today) {
      // 新的一天，重置进度
      progress.date = today
      progress.learned = 0
    }

    this.setData({
      'progress.current': progress.learned,
      'progress.percent': (progress.learned / progress.total * 100).toFixed(1)
    })
  },

  // 加载下一个单词
  loadNextWord: function () {
    if (this.data.isReviewMode) {
      this.loadNextReviewWord()
      return
    }

    // 从当前级别的单词中随机获取一个未学习的单词
    const levelWords = wordsByLevel[this.data.currentLevel] || []
    const learnedWords = this.data.wordHistory.map(w => w.word)
    const unlearnedWords = levelWords.filter(w => !learnedWords.includes(w.word))

    // 如果还有未学习的单词，随机选择一个
    if (unlearnedWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * unlearnedWords.length)
      const newWord = unlearnedWords[randomIndex]

      // 将新单词添加到历史记录中
      const wordHistory = this.data.wordHistory
      wordHistory.push(newWord)

      this.setData({
        currentWord: newWord,
        wordHistory: wordHistory,
        currentIndex: wordHistory.length - 1,
        showTranslation: false,
        showExamples: false,
        showAnalysis: false
      })
    } else if (this.data.wordHistory.length > 0) {
      // 如果没有新单词了，但还有历史记录，显示最后一个单词
      const lastWord = this.data.wordHistory[this.data.wordHistory.length - 1]
      this.setData({
        currentWord: lastWord,
        currentIndex: this.data.wordHistory.length - 1
      })
    }
  },

  // 切换到下一个级别
  switchToNextLevel: function () {
    const levels = Object.values(WORD_LEVELS)
    const currentIndex = levels.indexOf(this.data.currentLevel)
    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1]
      this.setData({
        currentLevel: nextLevel,
        wordHistory: []
      })
      // 保存设置
      const settings = wx.getStorageSync('userSettings') || {}
      settings.level = nextLevel
      wx.setStorageSync('userSettings', settings)
      // 加载新级别的单词
      this.loadNextWord()
    }
  },

  // 显示翻译
  showTranslation: function () {
    this.setData({ showTranslation: true })
  },

  // 显示例句
  showExamples: function () {
    this.setData({ showExamples: true })
  },

  // 显示词根分析
  showAnalysis: function () {
    this.setData({ showAnalysis: true })
  },

  // 处理认识按钮点击
  handleKnown: function () {
    const { currentWord, isReviewMode, unknownWords, reviewIndex } = this.data
    if (!currentWord) return

    // 更新单词状态
    const learningStats = wx.getStorageSync('learningStats') || {
      totalWords: 0,
      streak: 0,
      totalDays: 0,
      todayMinutes: 0,
      level: 1,
      experience: 0,
      nextLevel: 100
    }

    learningStats.totalWords += 1
    wx.setStorageSync('learningStats', learningStats)

    if (isReviewMode) {
      // 从复习列表中移除当前单词
      const newUnknownWords = unknownWords.filter(word => word.word !== currentWord.word)
      this.setData({ unknownWords: newUnknownWords })
      wx.setStorageSync('unknownWords', newUnknownWords)

      // 如果还有单词需要复习，继续复习
      if (newUnknownWords.length > 0) {
        this.loadNextReviewWord()
      } else {
        // 如果没有单词需要复习了，提示用户并退出复习模式
        wx.showModal({
          title: '复习完成',
          content: '已完成所有生词的复习，是否退出复习模式？',
          success: (res) => {
            if (res.confirm) {
              this.setData({
                isReviewMode: false,
                reviewIndex: 0
              })
              this.loadNextWord()
            }
          }
        })
      }
      return
    }

    // 添加到已掌握单词列表
    const masteredWords = wx.getStorageSync('masteredWords') || []
    if (!masteredWords.includes(currentWord.word)) {
      masteredWords.push(currentWord.word)
      wx.setStorageSync('masteredWords', masteredWords)
    }

    // 更新今日学习记录
    const today = new Date().toDateString()
    const todayLearned = wx.getStorageSync('todayLearned') || {
      date: today,
      words: [],
      correct: 0,
      total: 0
    }

    if (todayLearned.date !== today) {
      todayLearned.date = today
      todayLearned.words = []
      todayLearned.correct = 0
      todayLearned.total = 0
    }

    if (!todayLearned.words.includes(currentWord.word)) {
      todayLearned.words.push(currentWord.word)
      todayLearned.correct += 1
      todayLearned.total += 1
    }

    wx.setStorageSync('todayLearned', todayLearned)

    // 更新进度并加载下一个单词
    this.updateProgress()
    this.loadNextWord()
  },

  // 处理不认识按钮点击
  handleUnknown: function () {
    const { currentWord } = this.data
    if (!currentWord) return

    // 更新单词状态
    const learningStats = wx.getStorageSync('learningStats') || {
      totalWords: 0,
      streak: 0,
      totalDays: 0,
      todayMinutes: 0,
      level: 1,
      experience: 0,
      nextLevel: 100
    }

    learningStats.totalWords += 1
    wx.setStorageSync('learningStats', learningStats)

    // 添加到待复习单词列表
    const unknownWords = this.data.unknownWords || []
    if (!unknownWords.some(word => word.word === currentWord.word)) {
      unknownWords.push(currentWord)
      this.setData({ unknownWords })
      wx.setStorageSync('unknownWords', unknownWords)
    }

    // 更新今日学习记录
    const today = new Date().toDateString()
    const todayLearned = wx.getStorageSync('todayLearned') || {
      date: today,
      words: [],
      correct: 0,
      total: 0
    }

    if (todayLearned.date !== today) {
      todayLearned.date = today
      todayLearned.words = []
      todayLearned.correct = 0
      todayLearned.total = 0
    }

    if (!todayLearned.words.includes(currentWord.word)) {
      todayLearned.words.push(currentWord.word)
      todayLearned.total += 1
    }

    wx.setStorageSync('todayLearned', todayLearned)

    // 显示单词释义
    this.setData({
      showTranslation: true,
      showExamples: true,
      showAnalysis: true
    })

    // 更新进度并加载下一个单词
    this.updateProgress()
    setTimeout(() => {
      this.loadNextWord()
    }, 2000) // 给用户2秒时间查看释义
  },

  // 切换复习模式
  toggleReviewMode: function () {
    const unknownWords = wx.getStorageSync('unknownWords') || []

    if (this.data.isReviewMode) {
      // 退出复习模式
      this.setData({
        isReviewMode: false,
        reviewIndex: 0
      }, () => {
        this.loadNextWord()
      })
      return
    }

    if (unknownWords.length === 0) {
      wx.showToast({
        title: '暂无生词需要复习',
        icon: 'none'
      })
      return
    }

    // 进入复习模式
    this.setData({
      isReviewMode: true,
      unknownWords: unknownWords,
      reviewIndex: 0
    }, () => {
      this.loadNextReviewWord()
    })
  },

  // 加载下一个复习单词
  loadNextReviewWord: function () {
    const { reviewIndex, unknownWords } = this.data
    if (reviewIndex >= unknownWords.length) {
      // 所有单词都复习完了
      wx.showModal({
        title: '复习完成',
        content: '已完成所有生词的复习，是否退出复习模式？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              isReviewMode: false,
              reviewIndex: 0
            })
            this.loadNextWord()
          } else {
            // 重新开始复习
            this.setData({
              reviewIndex: 0
            }, () => {
              this.loadNextReviewWord()
            })
          }
        }
      })
      return
    }

    // 加载下一个待复习的单词
    this.setData({
      currentWord: unknownWords[reviewIndex],
      showTranslation: false,
      showExamples: false,
      showAnalysis: false
    })
  },

  // 点击"上一个"按钮
  handlePrevWord: function () {
    if (this.data.isReviewMode) {
      const { reviewIndex } = this.data
      if (reviewIndex > 1) {
        this.setData({
          reviewIndex: reviewIndex - 1,
          currentWord: this.data.unknownWords[reviewIndex - 2]
        })
      } else {
        wx.showToast({
          title: '已经是第一个生词了',
          icon: 'none'
        })
      }
      return
    }

    const { currentIndex, wordHistory } = this.data
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      this.setData({
        currentWord: wordHistory[prevIndex],
        currentIndex: prevIndex
      })
    } else {
      wx.showToast({
        title: '已经是第一个单词了',
        icon: 'none'
      })
    }
  },

  // 点击"下一个"按钮
  handleNextWord: function () {
    if (this.data.isReviewMode) {
      this.loadNextReviewWord()
      return
    }

    const { currentIndex, wordHistory } = this.data
    if (currentIndex < wordHistory.length - 1) {
      // 如果有下一个历史单词，显示历史单词
      const nextIndex = currentIndex + 1
      this.setData({
        currentWord: wordHistory[nextIndex],
        currentIndex: nextIndex
      })
    } else {
      // 检查是否所有单词都学习完了
      const levelWords = wordsByLevel[this.data.currentLevel] || []
      const learnedWords = this.data.wordHistory.map(w => w.word)
      const unlearnedWords = levelWords.filter(w => !learnedWords.includes(w.word))

      if (unlearnedWords.length === 0) {
        // 如果当前级别的所有单词都学习完了，提示切换级别
        wx.showModal({
          title: '提示',
          content: '当前级别的单词已经学习完毕，是否切换到下一个级别？',
          success: (res) => {
            if (res.confirm) {
              this.switchToNextLevel()
            }
          }
        })
      } else {
        // 如果还有未学习的单词，加载新单词
        this.loadNextWord()
      }
    }
  },

  // 更新学习进度
  updateProgress: function () {
    const today = new Date().toDateString()
    const todayLearned = wx.getStorageSync('todayLearned') || {
      date: today,
      words: [],
      correct: 0,
      total: 0
    }

    if (todayLearned.date !== today) {
      todayLearned.date = today
      todayLearned.words = []
      todayLearned.correct = 0
      todayLearned.total = 0
      wx.setStorageSync('todayLearned', todayLearned)
    }

    // 设置进度为今天点击认识按钮的次数
    this.setData({
      'progress.current': todayLearned.correct,
      'progress.percent': (todayLearned.correct / this.data.progress.total * 100).toFixed(1)
    })
  },

  // 开始拼写检验
  startSpellingCheck: function () {
    // 从最近学习的10个单词中随机选择5个进行检验
    const recentWords = this.data.wordHistory.slice(-10)
    const spellingWords = this.shuffleArray(recentWords).slice(0, 5)

    this.setData({
      isSpellingMode: true,
      spellingWords,
      spellingIndex: 0,
      spellingInput: '',
      spellingResult: '',
      spellingCorrect: 0,
      spellingTotal: spellingWords.length
    })
  },

  // 打乱数组顺序
  shuffleArray: function (array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  },

  // 处理拼写输入
  handleSpellingInput: function (e) {
    this.setData({
      spellingInput: e.detail.value
    })
  },

  // 检查拼写
  checkSpelling: function () {
    const { spellingInput, spellingWords, spellingIndex, spellingCorrect } = this.data
    const currentWord = spellingWords[spellingIndex]
    const isCorrect = spellingInput.toLowerCase().trim() === currentWord.word.toLowerCase()

    // 更新拼写结果
    this.setData({
      spellingResult: isCorrect ? '正确！' : `错误！正确拼写是：${currentWord.word}`,
      spellingCorrect: isCorrect ? spellingCorrect + 1 : spellingCorrect
    })

    // 延迟后进入下一个单词
    setTimeout(() => {
      if (spellingIndex < spellingWords.length - 1) {
        this.setData({
          spellingIndex: spellingIndex + 1,
          spellingInput: '',
          spellingResult: ''
        })
      } else {
        // 拼写检验完成
        this.finishSpellingCheck()
      }
    }, 2000)
  },

  // 完成拼写检验
  finishSpellingCheck: function () {
    const { spellingCorrect, spellingTotal } = this.data
    const score = Math.round(spellingCorrect / spellingTotal * 100)

    wx.showModal({
      title: '拼写检验完成',
      content: `本次得分：${score}分\n正确：${spellingCorrect}个\n总计：${spellingTotal}个`,
      showCancel: false,
      success: () => {
        this.setData({
          isSpellingMode: false,
          spellingInput: '',
          spellingResult: ''
        })
        this.loadNextWord() // 继续学习新单词
      }
    })
  },

  // 播放单词发音
  playPronunciation: function () {
    const { currentWord } = this.data
    if (!currentWord) return

    // 如果正在播放，先停止
    if (audioContext) {
      audioContext.stop()
      audioContext.destroy()
    }

    // 创建新的音频实例
    audioContext = wx.createInnerAudioContext()

    // 构建音频URL（使用美式发音）
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${currentWord.word}&type=1`

    audioContext.src = audioUrl

    // 监听播放错误
    audioContext.onError((res) => {
      console.error('音频播放错误:', res)
      wx.showToast({
        title: '发音播放失败',
        icon: 'none'
      })
    })

    // 监听播放开始
    audioContext.onPlay(() => {
      wx.showToast({
        title: '正在播放发音',
        icon: 'none',
        duration: 1000
      })
    })

    // 开始播放
    audioContext.play()
  },

  // 处理级别选择变化
  handleLevelChange: function (e) {
    const index = e.detail.value
    const newLevel = this.data.levelList[index]

    // 如果选择了不同的级别
    if (newLevel !== this.data.currentLevel) {
      wx.showModal({
        title: '切换级别',
        content: '切换级别将清空当前学习记录，确定要切换吗？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              currentLevel: newLevel,
              levelIndex: index,
              wordHistory: []
            })

            // 保存设置
            const settings = wx.getStorageSync('userSettings') || {}
            settings.level = newLevel
            wx.setStorageSync('userSettings', settings)

            // 重新加载单词
            this.loadNextWord()
          } else {
            // 取消选择，恢复原来的索引
            this.setData({
              levelIndex: this.data.levelList.indexOf(this.data.currentLevel)
            })
          }
        }
      })
    }
  },
}) 