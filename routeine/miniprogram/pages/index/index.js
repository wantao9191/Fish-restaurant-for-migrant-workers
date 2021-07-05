//index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    visible: false,
    info: {
      name: '',
      mobile: '',
      work: '',
      avatar: ''
    },
    avatar: '',
    userProfile: null,
    array: ['公家的', '私人的', '打你妹哦,劳资是资本家'],
  },

  onLoad: function () {
    const user = wx.getStorageSync('userInfo') || {}
    this.setData({
      info: {
        name: user.name,
        avatar: user.avatar,
      },
      visible:true
    })
    if (user.avatar) {
      if (user.avatar.indexOf('https://') < 0) {
        wx.cloud.getTempFileURL({
          fileList: [user.avatar]
        }).then(res => {
          this.setData({avatar:res.fileList[0].fileID})
          console.log(res)
        })
      } else {
        this.setData({
          avatar: user.avatar
        })
      }

    }

  },
  // 信息认证
  submit() {
    wx.cloud.callFunction({
      name: 'user',
      data: {
        ...this.data.info
      }
    }).then(res => {
      if (res.result.code == 200) {
        if (res.result.data) {
          wx.setStorageSync('userInfo', res.result.data)
          console.log('存入缓存')
          this.goPage()
        } else {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          })
        }
      }
      console.log(res)
    })
    console.log(this.data.info)
  },
  mobileInput(e) {
    this.setData({
      'info.mobile': e.detail.value
    })
  },
  nameInput(e) {
    this.setData({
      'info.name': e.detail.value
    })
  },
  bindPickerChange(e) {
    this.setData({
      'info.work': Number(e.detail.value)
    })
    console.log(e)
  },
  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res=> {
        wx.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0]
        // 上传图片
        const cloudPath = `avatar${filePath.match(/\.[^.]+?$/)[0]}`
        console.log(res, cloudPath)
        wx.cloud.uploadFile({
          cloudPath,
          filePath
        }).then(res => {
          wx.hideLoading()
          console.log(this)
          this.setData({
            avatar: filePath,
            'info.avatar': res.fileID
          })
          console.log(res, '1111111', this.data.avatar)
        }).catch(e => {
          wx.hideLoading()
          console.error('[上传文件] 失败：', e)
          wx.showToast({
            icon: 'none',
            title: '上传失败',
          })
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  onDialogClose() {
    this.setData({
      visible: false
    })
  },
  // 进入主页
  goPage() {
    this.onDialogClose()
    wx.navigateTo({
      url: '../home/index',
    })
  },
  // Fish restaurant for migrant workers
  getUser() {
    if (this.data.userProfile) {
      this.login(this.data.userProfile)
      return
    }
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.data.userProfile = res
        this.login(res)
      }
    })
  },
  // 登录
  login(model) {
    wx.cloud.callFunction({
      name: 'login',
      data: model
    }).then(res => {
      if (res.result.code === 200) {
        if (!res.result.data) {
          this.setData({
            visible: true,
            userInfo: model.userInfo,
            'info.name': model.userInfo.nickName,
            'info.avatar': model.userInfo.avatarUrl,
            avatar:model.userInfo.avatarUrl,
          })
        } else {
          wx.setStorageSync('userInfo', res.result.data)
        }
      }
    })
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
    }
  },

  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

})