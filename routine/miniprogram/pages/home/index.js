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
    // let arrs = [user, user, user].map(u => {
    //   u.timestap = app.utils.formatTime(u.timestap, 'yyyy-mm-dd', true)
    //   u.title = '每一次的跌倒后重新站起来，都会让人变得愈发热爱生活，一半是回忆，一半是继续。'
    //   u.covers = ['https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fcdn.duitang.com%2Fuploads%2Fitem%2F201410%2F04%2F20141004172507_J8Mty.jpeg&refer=http%3A%2F%2Fcdn.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1628262976&t=7efb1b2d4dfb28663f19912e2f8d16d1', 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fcdn.duitang.com%2Fuploads%2Fitem%2F201206%2F16%2F20120616174342_ycsye.thumb.700_0.jpeg&refer=http%3A%2F%2Fcdn.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1628263000&t=2465d53ba91d9deca0ee4976d23f7393', 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fcar0.autoimg.cn%2Fupload%2Fspec%2F3151%2Fu_3151566028936.jpg&refer=http%3A%2F%2Fcar0.autoimg.cn&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1628263030&t=227ca3c635cd99190a958afaecc1f18e']
    //   u.discussNum = 100
    //   u.thumbsNum = 500
    //   return u
    // })
    // this.setData({
    //   arrs
    // })
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
      url: '../forum/detail/detail?id='+e.detail,
    })
    console.log(e)
  },
  addForum(e) {
    const {
      type
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: '../forum/index?type=' + type,
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