Page({
  data: {
    activeTab: 0, // 当前选中的标签页（0: 已掌握, 1: 待复习）
    stats: {
      totalWords: 0,
      todayWords: 0,
      accuracy: '0%',
      streak: 0
    },
    dateList: [], // 日期列表
    wordsByDate: {}, // 按日期分组的单词
    masteredWords: [], // 已掌握的单词
    reviewWords: [], // 待复习的单词
  },

  onLoad: function () {
    this.loadStats()
    this.loadHistoryWords()
  },

  // 加载统计数据
  loadStats: function () {
    // 从本地存储获取学习统计数据
    const learningStats = wx.getStorageSync('learningStats') || {
      totalWords: 0,
      streak: 0
    }

    // 获取今日学习的单词
    const today = new Date().toDateString()
    const todayLearned = wx.getStorageSync('todayLearned') || {
      date: today,
      words: [],
      correct: 0,
      total: 0
    }

    // 如果是新的一天，重置今日数据
    if (todayLearned.date !== today) {
      todayLearned.date = today
      todayLearned.words = []
      todayLearned.correct = 0
      todayLearned.total = 0
      wx.setStorageSync('todayLearned', todayLearned)
    }

    // 计算正确率
    const accuracy = todayLearned.total > 0
      ? Math.round((todayLearned.correct / todayLearned.total) * 100)
      : 0

    this.setData({
      stats: {
        totalWords: learningStats.totalWords || 0,
        todayWords: todayLearned.words.length,
        accuracy: accuracy + '%',
        streak: learningStats.streak || 0
      }
    })
  },

  // 加载历史单词
  loadHistoryWords: function () {
    // 从本地存储获取单词学习记录
    const wordRecords = wx.getStorageSync('wordRecords') || {}
    const masteredWords = []
    const reviewWords = []

    // 获取当前学习级别的所有单词
    const settings = wx.getStorageSync('userSettings') || {}
    const currentLevel = settings.level || 'CET4'
    const { wordsByLevel } = require('../../data/words.js')
    const levelWords = wordsByLevel[currentLevel] || []

    // 整理单词列表
    levelWords.forEach(word => {
      const record = wordRecords[word.word] || {
        mastered: false,
        reviewCount: 0,
        lastReview: null,
        note: ''
      }

      const wordData = {
        ...word,
        ...record
      }

      if (record.mastered) {
        masteredWords.push(wordData)
      } else if (record.reviewCount > 0) {
        reviewWords.push(wordData)
      }
    })

    // 按日期分组
    const wordsByDate = {}
    const dateList = []
    const today = new Date().toDateString()

    // 处理今天的单词
    const todayLearned = wx.getStorageSync('todayLearned') || {
      date: today,
      words: []
    }
    if (todayLearned.words.length > 0) {
      wordsByDate[today] = todayLearned.words.map(word => {
        const record = wordRecords[word] || {}
        return {
          word: word,
          mastered: record.mastered || false,
          reviewCount: record.reviewCount || 0,
          lastReview: today,
          note: record.note || ''
        }
      })
      dateList.push(today)
    }

    // 处理历史记录
    Object.keys(wordRecords)
      .filter(word => wordRecords[word].lastReview && wordRecords[word].lastReview !== today)
      .forEach(word => {
        const record = wordRecords[word]
        const date = record.lastReview
        if (!wordsByDate[date]) {
          wordsByDate[date] = []
          dateList.push(date)
        }
        wordsByDate[date].push({
          word: word,
          mastered: record.mastered,
          reviewCount: record.reviewCount,
          lastReview: date,
          note: record.note || ''
        })
      })

    // 排序日期列表
    dateList.sort().reverse()

    this.setData({
      dateList,
      wordsByDate,
      masteredWords,
      reviewWords
    })
  },

  // 切换标签页
  handleTabChange: function (e) {
    const activeTab = parseInt(e.currentTarget.dataset.tab)
    this.setData({ activeTab })
  },

  // 添加或编辑笔记
  handleEditNote: function (e) {
    const { date, index } = e.currentTarget.dataset
    const word = this.data.wordsByDate[date][index]

    wx.showModal({
      title: '添加笔记',
      content: '请输入笔记内容',
      editable: true,
      placeholderText: '输入记忆技巧或其他笔记',
      value: word.note,
      success: (res) => {
        if (res.confirm) {
          const note = res.content
          const wordsByDate = this.data.wordsByDate
          wordsByDate[date][index].note = note
          this.setData({ wordsByDate })
          // 更新分类列表
          this.updateWordLists()
        }
      }
    })
  },

  // 切换掌握状态
  handleToggleMastered: function (e) {
    const { date, index } = e.currentTarget.dataset
    const wordsByDate = this.data.wordsByDate
    const word = wordsByDate[date][index]
    word.mastered = !word.mastered

    // 更新列表
    this.setData({ wordsByDate }, () => {
      this.updateWordLists()
    })
  },

  // 更新单词分类列表
  updateWordLists: function () {
    const masteredWords = []
    const reviewWords = []

    this.data.dateList.forEach(date => {
      this.data.wordsByDate[date].forEach(word => {
        if (word.mastered) {
          masteredWords.push(word)
        } else {
          reviewWords.push(word)
        }
      })
    })

    this.setData({
      masteredWords,
      reviewWords
    })
  },

  // 快速加入复习列表
  handleAddToReview: function (e) {
    const word = e.currentTarget.dataset.word
    // TODO: 将单词添加到复习列表
    wx.showToast({
      title: '已加入复习列表',
      icon: 'success'
    })
  },

  // 播放单词发音
  handlePlaySound: function (e) {
    const word = e.currentTarget.dataset.word
    // TODO: 播放单词发音
    wx.showToast({
      title: '播放发音',
      icon: 'none'
    })
  }
}) 