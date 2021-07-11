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
    arrs: [],
    isFinshed: false, //是否请求完成
    transY: 0,
    top: 0,
    loading: false,
    loadText: '松开刷新'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
        action: 'getList',
        ...this.data.params
      }
    }).then(res => {
      if (this.moving) {
        this.moving = false
        this.setData({
          loadText: '加载成功',
          loading: false,
        })
        setTimeout(() => {
          this.setData({
            transY: 0,
            loadText: '松开刷新'
          })
        }, 1000);
      }
      if (res.result.code === 200) {
        const arrs = res.result.data.datas.map(a => {
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
        let dataArrs = this.data.arrs.concat(arrs)
        this.setData({
          arrs: dataArrs,
          isFinshed: dataArrs.length >= res.result.data.total
        })
        this.setCovers(arrs)
      }
    })
  },
  // 设置图片
  setCovers(arrs) {
    let covers = arrs.filter(a => {
      return a.covers.length
    })
    let fileList = []
    covers.forEach(a => {
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
  // 跳转详情
  checkDetail(e) {
    wx.navigateTo({
      url: '../index/index?id=' + e.detail,
    })
  },
  touchstart(e) {
    if (this.data.top === 0 && this.data.transY === 0) {
      this.moving = true
      const touches = e.touches[0]
      this.moveStart = touches.pageY
    }

  },
  touchmove(e) {
    if (this.moving) {
      const touches = e.touches[0]
      this.setData({
        transY: (touches.pageY - this.moveStart) / 5
      })
    }
  },
  touchend(e) {
    if (this.moving) {
      this.setData({
        loading: true
      })
      this.data.params.pageNo = 1
      this.data.arrs = []
      this.getData()
    }
  },
  // 滚动到顶部
  scrolltoupper() {
    setTimeout(() => {
      this.data.top = 0
    }, 500);

  },
  // 滚动到底部
  scrolltolower() {
    console.log(!this.data.isFinshed, '--------')
    if (!this.data.isFinshed) {
      this.data.params.pageNo += 1
      this.getData()
    }
  },
  scroll(e) {
    this.data.top = e.detail.scrollTop
    this.moving = false
    console.log('scroll')
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