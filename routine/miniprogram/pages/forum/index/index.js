// miniprogram/pages/forum/index/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    detail: {},
    workText: {
      1: '给公家打工',
      2: '给私人打工',
      3: '可恶的资本家'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (!options.id) {
      wx.showToast({
        title: '未找到帖子',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 2000);
      return
    }
    this.data.id = options.id
    this.getData()
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

  },
  // 获取数据
  getData() {
    wx.cloud.callFunction({
      name: 'forum',
      data: {
        action: 'getOne',
        id: this.data.id
      }
    }).then(res => {
      if (res.result.code === 200) {
        const fileList = res.result.data.delta.ops.filter(d => {
          return d.insert.image
        }).map(d => {
          return {
            fileID: d.insert.image,
          }
        })
        app.utils.getCloudFile({
          arrs: res.result.data.delta.ops,
          fileList,
        }, 'html').then((resp) => {
          res.result.data.delta.ops.map(o => {
            if (o.insert.image) {
              let item = resp.fileList.find(f => {
                return f.fileID === o.insert.image
              })
              if (item) o.insert.image = item.tempFileURL
            }
            return o
          })
          console.log(res.result.data)
          res.result.data.timestmp = app.utils.formatTime(res.result.data.timestmp,'yyyy-mm-dd hh:mm',true)
          this.setData({
            detail: res.result.data
          })
          this.editorCtx.setContents({
            delta: res.result.data.delta
          })
        })
      }
      console.log(res)
    })
  },
  // 初始化富文本编辑器
  onEditorReady() {
    wx.createSelectorQuery().select('#editor').context(res => {
      this.editorCtx = res.context
    }).exec()
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