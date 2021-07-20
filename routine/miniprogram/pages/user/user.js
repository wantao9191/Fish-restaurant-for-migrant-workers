// miniprogram/pages/user/user.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    workText: {
      1: '给公家打工',
      2: '给私人打工',
      3: '可恶的资本家'
    },
    active: 1,
    forumParams: {
      pageNo: 1,
      pageSize: 10
    },
    typeText: {
      home: '大厅'
    },
    forums: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id = options.id || app.globalData.user._id
    this.getUserForum()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getUser()
  },
  getUser() {
    wx.cloud.callFunction({
      name: 'user',
      action: '',
      id: this.data.id
    }).then(res => {
      if (res.result.code === 200) {
        this.setData({
          userInfo: res.result.data
        })
      }
    })
  },
  toggleTab(e) {
    this.setData({
      active: e.target.dataset.type
    })
  },
  getUserForum() {
    wx.cloud.callFunction({
      name: 'forum',
      data: {
        action: 'getUserForum',
        ...this.data.forumParams,
        opendid: this.data.id
      }
    }).then(res => {
      if (res.result.code === 200) {
        let forums = res.result.data.datas.map(d => {
          d.timestmp = app.utils.formatTime(d.timestmp, 'yyyy-mm-dd', true)
          return d
        })
        this.setData({
          forums
        })
      }

      console.log(res)
    })
  },
  // 查看主题
  gotoForum(e) {
    wx.navigateTo({
      url: '../forum/index/index?id=' + e.currentTarget.dataset.id,
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})