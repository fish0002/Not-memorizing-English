Page({
  data: {
    time: '20:00',
    days: [
      { name: '日', selected: true },
      { name: '一', selected: true },
      { name: '二', selected: true },
      { name: '三', selected: true },
      { name: '四', selected: true },
      { name: '五', selected: true },
      { name: '六', selected: true }
    ]
  },

  onLoad: function (options) {
    // 获取已保存的设置
    const settings = wx.getStorageSync('reminderSettings') || {
      time: '20:00',
      days: this.data.days
    }
    this.setData(settings)
  },

  onTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },

  toggleDay: function (e) {
    const index = e.currentTarget.dataset.index
    const days = this.data.days
    days[index].selected = !days[index].selected
    this.setData({ days })
  },

  saveReminder: function () {
    // 检查是否至少选择了一天
    if (!this.data.days.some(day => day.selected)) {
      wx.showToast({
        title: '请至少选择一天',
        icon: 'none'
      })
      return
    }

    // 保存设置
    const settings = {
      time: this.data.time,
      days: this.data.days
    }
    wx.setStorageSync('reminderSettings', settings)

    // 设置提醒
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    prevPage.setReminderTime(this.data.time)

    // 返回上一页
    wx.navigateBack()
  },

  cancelReminder: function () {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    prevPage.setData({
      'settings.reminderEnabled': false
    })
    wx.showToast({
      title: '已取消提醒',
      icon: 'success'
    })
    wx.navigateBack()
  }
}) 