// miniprogram/pages/home/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arrs: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let user = wx.getStorageSync('userInfo') || {}
    this.getHot()
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
  getHot() {
    wx.cloud.callFunction({
      name: 'forum',
      data: {
        action: 'getHotList'
      }
    }).then(res => {
      console.log(res)
      if (res.result.code === 200) {
        let fileList = []
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
          fileList.push(...covers)
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
      }

    })
  },
  // 大厅帖子详情
  checkDetail(e){
    wx.navigateTo({
      url: '../forum/detail/index?id='+e.detail,
    })
  },
  addForum(e) {
    const {
      type
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../forum/edit/index?type=' + type,
    })
  },
  // 进入大厅
  intoView(){
    wx.navigateTo({
      url: '../forum/detail/index',
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