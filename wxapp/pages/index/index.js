// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    currentWord: {
      word: 'Hello',
      phonetic: '/həˈləʊ/',
      meaning: 'n. 招呼，问候； int. 喂，你好'
    },
    progress: 0,
    dailyTarget: 50,
    completedCount: 0,
    remainingCount: 50,
    reviewCount: 12,
    totalWords: 328,
    streak: 7,
    masteredWords: 246,
    accuracy: 92,
    currentDate: '',
    showTip: true,
    tipText: '坚持学习，每天进步！',
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onLoad() {
    this.setData({
      currentDate: this.formatDate(new Date())
    })
    this.loadUserData()
    this.loadNextWord()
  },
  onShow() {
    this.loadUserData()
  },
  // 加载用户数据
  loadUserData() {
    // TODO: 从本地存储或服务器获取数据
    const settings = wx.getStorageSync('settings') || { dailyTarget: 50 }
    const stats = wx.getStorageSync('learningStats') || {
      totalWords: 0,
      streak: 0,
      masteredWords: 0,
      accuracy: 0
    }

    // 计算今日进度
    const completed = wx.getStorageSync('todayCompleted') || 0
    const progress = Math.min(100, (completed / settings.dailyTarget * 100).toFixed(1))

    this.setData({
      dailyTarget: settings.dailyTarget,
      completedCount: completed,
      remainingCount: Math.max(0, settings.dailyTarget - completed),
      progress: progress,
      totalWords: stats.totalWords,
      streak: stats.streak,
      masteredWords: stats.masteredWords,
      accuracy: stats.accuracy
    })
  },
  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  },
  // 页面跳转函数
  goToStudy() {
    wx.navigateTo({
      url: '/pages/study/study'
    })
  },
  goToReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    })
  },
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },
  goToTest() {
    wx.navigateTo({
      url: '/pages/test/test'
    })
  },
  // 关闭提示
  closeTip() {
    this.setData({
      showTip: false
    })
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
  },
  // 跳转到用户页面
  goToUser: function () {
    wx.navigateTo({
      url: '/pages/user/user'
    })
  }
})
