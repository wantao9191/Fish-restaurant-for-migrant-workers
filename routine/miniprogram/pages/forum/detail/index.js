// miniprogram/pages/forum/detail/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    params: {
      pageNo: 1,
      pageSize: 5
    },
    arrs: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.getData()
  },
  getData() {
    wx.cloud.callFunction({
      name: 'forum',
      data: {
        action: 'getList',
        ...this.data.params
      }
    }).then(res => {
      if (res.result.code === 200) {
        const arrs = res.result.data.map(a => {
          const covers = a.delta.ops.filter(d => {
            return d.insert.image
          }).map(d => {
            return {
              fileID: d.insert.image,
              alt: '../../assets/images/default-img.jpg',
              src: ''
            }
          })
          let result = {
            avatar: a.userInfo.headimg,
            title: a.title,
            name: a.userInfo.name,
            timestmp: app.utils.formatTime(a.timestmp, 'yyyy-mm-dd', true),
            thumbsNum: a.thumbsNum,
            discussNum: a.discussNum,
            covers,
            id: a._id
          }
          return result
        })
        this.setData({
          arrs
        })
        this.setCovers(arrs)
      }
      console.log(res)
    })
  },
  // 设置图片
  setCovers(arrs) {
    console.log(arrs)
    let covers = arrs.filter(a=>{
      return a.covers.length
    })
    let fileList = [] 
    covers.forEach(a=>{
      fileList.push(...a.covers)
    })
    if (fileList.length) {
      wx.cloud.getTempFileURL({
        fileList
      }).then(res => {
        this.data.arrs.forEach(a => {
          if (a.covers.length) {
            a.covers = a.covers.map(c => {
              let item = res.fileList.find(f => {
                return f.fileID === c.fileID
              })
              if (item) c.src = item.tempFileURL
              return c
            })
          }
        })
        this.setData({
          arrs: this.data.arrs
        })
      })
    }
  },
  checkDetail(e){
    wx.navigateTo({
      url: '../detail/index?id='+e.detail,
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