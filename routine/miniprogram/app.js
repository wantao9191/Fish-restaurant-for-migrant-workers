//app.js
import utils from './utils.js'
App({
  onLaunch: function () {
    this.globalData = {
      ENV: 'PROD'   //当前环境  DEV:线上    PROD:测试
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'cloud1-3gz5hyuc97e476c8',
        traceUser: true,
      })
    }
    wx.showLoading({
      title: '正在进入酒馆...',
    })
    let user = wx.getStorageSync('userInfo')
    if (user) {
      this.globalData.user = user
      wx.cloud.callFunction({
        name: 'login',
        data: user
      }).then(res => {
        wx.hideLoading()
        if (res.result.code === 200) {
          if (res.result.data) {
            this.globalData.logined = true
            this.globalData.user = res.result.data
            wx.setStorageSync('userInfo', res.result.data)
          }
        }
      })
    } else {
      wx.hideLoading()
    }
  },
  utils
})