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
    clicked: false
  },
  onLoad: function () {
    const user = wx.getStorageSync('userInfo') || {}
    if (user.avatar) {
      if (user.avatar.indexOf('https://') < 0) {
        wx.cloud.getTempFileURL({
          fileList: [user.avatar]
        }).then(res => {
          this.setData({
            avatar: res.fileList[0].fileID
          })
          console.log(res)
        })
      } else {
        this.setData({
          avatar: user.avatar
        })
      }

    }

  },
  onShow() {
    this.data.userProfile = app.globalData.userProfile
    this.setData({
      userInfo: this.data.userProfile.userInfo,
      'info.name': this.data.userProfile.userInfo.nickName,
      'info.avatar': this.data.userProfile.userInfo.avatarUrl,
      avatar: this.data.userProfile.userInfo.avatarUrl
    })
  },
  // 信息认证
  submit() {
    if (this.data.clicked) return
    this.data.clicked = true
    let {
      nickName,
      avatarUrl
    } = this.data.userProfile.userInfo
    wx.cloud.callFunction({
      name: 'user',
      data: {
        ...this.data.info,
        nickName,
        headimg: avatarUrl

      }
    }).then(res => {
      this.data.clicked = false
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
    })
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
      success: res => {
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
    wx.redirectTo({
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
            avatar: model.userInfo.avatarUrl
          })
        } else {
          wx.setStorageSync('userInfo', res.result.data)
          wx.reLaunch({
            url: '../home/index',
          })
        }
      }
    })
  },
})