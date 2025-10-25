Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    isLoggedIn: false,
    learningStats: {
      totalDays: 0,        // 总学习天数
      streak: 0,            // 连续学习天数
      totalWords: 328,      // 总单词量
      masteredWords: 246,   // 已掌握单词
      todayMinutes: 18,     // 今日学习时长
      level: 8,             // 用户等级
      experience: 850,      // 当前经验值
      nextLevel: 1000       // 下一级所需经验值
    },
    lastStudyDate: '', // 最后学习日期
    settings: {
      dailyGoal: 50,        // 每日目标单词数
      pronunciation: 'us',   // 发音设置：us(美音)/uk(英音)
      reminderTime: '20:00', // 学习提醒时间
      autoPlay: true,       // 自动播放单词发音
      reminderMode: '每天', // 提醒模式
      reminderEnabled: true // 提醒状态
    },
    dailyTarget: 50  // 默认每日目标
  },

  onLoad: function () {
    // 加载用户设置
    const settings = wx.getStorageSync('userSettings') || {
      dailyGoal: 50,
      pronunciation: 'us',
      reminderTime: '20:00',
      autoPlay: true
    }

    this.setData({
      settings: settings
    })

    this.checkLoginStatus()
    this.loadUserStats()

    //检查并更新学习天数
    this.initLearningStats();
    this.checkAndUpdateStudyDays();
  },


  onShow: function () {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus()
    // 恢复提醒设置
    const reminderSettings = wx.getStorageSync('reminderSettings')
    if (reminderSettings) {
      this.setData({
        'settings.reminderTime': reminderSettings.time,
        'settings.reminderEnabled': true
      })
    }
    //检查并更新学习天数
    this.checkAndUpdateStudyDays();
  },
  //初始化学习统计数据
  initLearningStats: function () {
    let learningStats = wx.getStorageSync('learningStats');
    if (!learningStats) {
      learningStats = {
        totalDays: 0,
        streak: 0,
        totalWords: 0,
        masteredWords: 0,
        todayMinutes: 0,
        level: 1,
        experience: 0,
        nextLevel: 100
      };
      wx.setStorageSync('learningStats', learningStats);
    }

    this.setData({
      learningStats
    });
  },
  //检查并更新学习天数

  checkAndUpdateStudyDays: function () {
    //获取当前日期
    const currentDate = this.getCurrentDate();
    //获取最后学习日期
    const lastStudyDate = wx.getStorageSync('lastStudyDate') || '';
    //如果当前日期与最后学习日期不同，则更新学习天数
    if (currentDate !== lastStudyDate) {
      //更新总学习天数
      let learningStats = this.data.learningStats;
      learningStats.totalDays += 1;
      //如果不是连续学习，则重置连续学习天数
      if (lastStudyDate && this.isConsecutiveDays(lastStudyDate, currentDate)) {
        learningStats.streak += 1;
      } else {
        learningStats.streak = 1;
      }
      //更新数据
      this.setData({
        learningStats: learningStats,
        lastStudyDate: currentDate,
      });
      //保存学习统计数据和最后学习日期
      wx.setStorageSync('learningStats', learningStats);
      wx.setStorageSync('lastStudyDate', currentDate);

    }
  },
  //获取当前日期
  getCurrentDate: function () {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  },
  //检查是否是连续学习

  isConsecutiveDays: function (lastDate, currentDate) {
    //将日期字符串转换为日期对象
    const lastDay = new Date(lastDate);
    const currentDay = new Date(currentDate);
    //检查日期是否连续
    return (currentDay - lastDay) / (1000 * 60 * 60 * 24) === 1;
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const userInfo = wx.getStorageSync('userInfo')
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false

    if (userInfo && isLoggedIn) {
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo
      })
    }
  },

  // 加载用户统计数据
  loadUserStats: function () {
    // 从本地存储获取学习统计数据
    const learningStats = wx.getStorageSync('learningStats') || {
      totalWords: 0,      // 总词汇量
      streak: 0,          // 连续打卡天数
      totalDays: 0,       // 总学习天数
      todayMinutes: 0,    // 今日学习时长
      level: 1,           // 用户等级
      experience: 0,      // 当前经验值
      nextLevel: 100      // 下一级所需经验值
    }

    // 获取今日学习时长
    const today = new Date().toDateString()
    const todayStudy = wx.getStorageSync('todayStudy') || { date: today, minutes: 0 }


    // 如果是新的一天，重置今日学习时长
    if (todayStudy.date !== today) {
      todayStudy.date = today
      todayStudy.minutes = 0
      wx.setStorageSync('todayStudy', todayStudy)
    }

    // 更新统计数据
    learningStats.todayMinutes = todayStudy.minutes

    this.setData({
      learningStats: learningStats
    })
  },

  // 处理用户登录
  handleLogin: function (e) {
    if (this.data.isLoggedIn) return

    if (e.detail.userInfo) {
      const userInfo = e.detail.userInfo
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            // 调用后端接口，发送code和用户信息
            this.loginWithServer(loginRes.code, userInfo)
          } else {
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '微信登录失败',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '您已拒绝授权',
        icon: 'none'
      })
    }
  },

  // 与服务器通信进行登录
  loginWithServer: function (code, userInfo) {
    // TODO: 替换为实际的服务器接口地址
    const apiUrl = 'https://your-api-domain.com/api/login'

    wx.showLoading({
      title: '登录中...'
    })

    // 这里是模拟服务器通信，实际使用时替换为wx.request
    setTimeout(() => {
      wx.hideLoading()

      // 模拟登录成功
      const loginData = {
        token: 'mock-token-' + new Date().getTime(),
        userInfo: userInfo
      }

      // 保存登录信息
      this.setData({
        userInfo: userInfo,
        isLoggedIn: true
      })

      wx.setStorageSync('token', loginData.token)
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('isLoggedIn', true)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    }, 1000)

    // 实际的服务器通信代码应该如下：
    /*
    wx.request({
      url: apiUrl,
      method: 'POST',
      data: {
        code: code,
        userInfo: userInfo
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.success) {
          const loginData = res.data.data
          this.setData({
            userInfo: userInfo,
            isLoggedIn: true
          })
          wx.setStorageSync('token', loginData.token)
          wx.setStorageSync('userInfo', userInfo)
          wx.setStorageSync('isLoggedIn', true)
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '服务器连接失败',
          icon: 'none'
        })
      }
    })
    */
  },

  // 处理用户注销
  handleLogout: function () {
    wx.showModal({
      title: '确认退出',
      content: '是否确认退出登录？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          this.setData({
            isLoggedIn: false,
            userInfo: {
              nickName: '',
              avatarUrl: ''
            }
          })
          // 清除存储的信息
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('isLoggedIn')

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  // 修改每日目标并保存目标到本地存储 
  handleSetDailyGoal: function () {
    wx.showModal({
      title: '设置每日目标',
      content: '请输入每日目标单词数量',
      editable: true,
      placeholderText: '请输入数字',
      success: (res) => {
        if (res.confirm) {
          const dailyGoal = parseInt(res.content)
          if (isNaN(dailyGoal) || dailyGoal < 1) {
            wx.showToast({
              title: '请输入有效数字',
              icon: 'none'
            })
            return
          }

          // 更新本地数据
          this.setData({
            'settings.dailyGoal': dailyGoal
          })

          // 保存到本地存储
          const settings = wx.getStorageSync('userSettings') || {}
          settings.dailyGoal = dailyGoal
          wx.setStorageSync('userSettings', settings)

          wx.showToast({
            title: '目标已保存',
            icon: 'success'
          })
        }
      }
    })
  },

  // 设置提醒时间
  handleSetReminder: function () {
    wx.showModal({
      title: '学习提醒',
      content: '每天 ' + this.data.settings.reminderTime + ' 提醒我学习',
      confirmText: '修改时间',
      cancelText: '关闭提醒',
      success: (res) => {
        if (res.confirm) {
          // 打开时间选择器
          wx.showActionSheet({
            itemList: ['设置提醒时间', '每天提醒', '工作日提醒', '周末提醒'],
            success: (res) => {
              if (res.tapIndex === 0) {
                wx.navigateTo({
                  url: '/pages/reminder/reminder'
                })
              } else {
                // 设置不同的提醒模式
                const modes = ['每天', '工作日', '周末']
                this.setData({
                  'settings.reminderMode': modes[res.tapIndex - 1]
                })
                wx.showToast({
                  title: modes[res.tapIndex - 1] + '提醒',
                  icon: 'success'
                })
              }
            }
          })
        } else if (res.cancel) {
          // 关闭提醒
          this.setData({
            'settings.reminderEnabled': false
          })
          wx.showToast({
            title: '已关闭提醒',
            icon: 'success'
          })
        }
      }
    })
  },

  // 设置提醒时间
  setReminderTime: function (time) {
    this.setData({
      'settings.reminderTime': time,
      'settings.reminderEnabled': true
    })

    // 设置提醒
    const reminderTime = new Date()
    const [hours, minutes] = time.split(':')
    reminderTime.setHours(parseInt(hours))
    reminderTime.setMinutes(parseInt(minutes))

    wx.requestSubscribeMessage({
      tmplIds: ['your-template-id'], // 需要替换为实际的模板ID
      success: (res) => {
        if (res['your-template-id'] === 'accept') {
          wx.showToast({
            title: '提醒设置成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '提醒设置失败',
            icon: 'none'
          })
        }
      }
    })
  },

  // 切换发音设置
  handleTogglePronunciation: function () {
    const newValue = this.data.settings.pronunciation === 'us' ? 'uk' : 'us'
    this.setData({
      'settings.pronunciation': newValue
    })
    wx.showToast({
      title: newValue === 'us' ? '已切换为美音' : '已切换为英音',
      icon: 'success'
    })
  },

  // 切换自动播放
  handleToggleAutoPlay: function () {
    this.setData({
      'settings.autoPlay': !this.data.settings.autoPlay
    })
  },

  // 查看学习数据详情
  handleViewStats: function () {
    // TODO: 跳转到详细统计页面
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 关于我们
  handleAboutUs: function () {
    wx.showModal({
      title: '关于音标单词宝',
      content: '音标单词宝是一款帮助用户通过音标学习英语单词的小程序。\n\n版本：1.0.0\n开发者：XXX\n联系方式：xxx@example.com',
      showCancel: false
    })
  },

  // 处理选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    wx.showLoading({
      title: '头像上传中...'
    })

    // 模拟上传头像
    setTimeout(() => {
      this.setData({
        'userInfo.avatarUrl': avatarUrl
      })
      // 保存到本地存储
      const userInfo = this.data.userInfo
      wx.setStorageSync('userInfo', userInfo)

      wx.hideLoading()
      this.checkLoginComplete()
    }, 500)
  },

  // 处理获取昵称
  onGetNickname(e) {
    const nickName = e.detail.value
    if (nickName) {
      this.setData({
        'userInfo.nickName': nickName
      })
      // 保存到本地存储
      const userInfo = this.data.userInfo
      wx.setStorageSync('userInfo', userInfo)

      this.checkLoginComplete()
    }
  },

  // 检查是否已完成登录信息填写
  checkLoginComplete() {
    if (this.data.userInfo.avatarUrl && this.data.userInfo.nickName) {
      wx.showLoading({
        title: '登录中...'
      })

      // 模拟登录过程
      setTimeout(() => {
        // 保存登录信息
        this.setData({
          isLoggedIn: true
        })

        wx.setStorageSync('userInfo', this.data.userInfo)
        wx.setStorageSync('isLoggedIn', true)

        wx.hideLoading()
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
      }, 1000)
    }
  },

  // 设置每日目标
  setDailyTarget: function (e) {
    const target = parseInt(e.detail.value)
    if (target > 0) {
      // 更新本地数据
      this.setData({
        dailyTarget: target
      })

      // 保存到本地存储
      const settings = wx.getStorageSync('userSettings') || {}
      settings.dailyTarget = target
      wx.setStorageSync('userSettings', settings)

      // 显示保存成功提示
      wx.showToast({
        title: '目标已保存',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '请输入有效数字',
        icon: 'none'
      })
    }
  },

  // 输入框失去焦点时保存
  handleTargetBlur: function (e) {
    this.setDailyTarget(e)
  },

  // 输入框回车时保存
  handleTargetConfirm: function (e) {
    this.setDailyTarget(e)
  }
}) 