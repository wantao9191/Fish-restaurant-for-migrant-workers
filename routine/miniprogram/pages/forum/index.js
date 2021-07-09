// miniprogram/pages/forum/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    inputFocusing: false,
    type: '',
    title: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.type = options.type || 'home'
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    const that = this
    this.setData({
      isIOS
    })
    this.updatePosition(0)
    let keyboardHeight = 0
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight)
            that.editorCtx.scrollIntoView()
          }
        })
      }, duration)

    })
  },
  onInput(e) {
    this.setData({
      title: e.detail.value
    })
  },
  onStatusChange(e) {
    const formats = e.detail
    this.setData({
      formats
    })
    console.log(e)
  },
  format(e) {
    let {
      name,
      value
    } = e.target.dataset
    if (!name) return
    this.editorCtx.format(name, value)
  },
  insertImage() {
    wx.chooseImage({
      count: 1,
      success: res => {
        const filePath = res.tempFilePaths[0]
        // 上传图片
        const cloudPath = `forum-${new Date().getTime()}${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          filePath,
          cloudPath
        }).then(result => {
          this.editorCtx.insertImage({
            src: res.tempFilePaths[0],
            data: {
              id: result.fileID
            },
            success: function () {
              console.log('insert image success')
            }
          })
        })

        console.log(res)
      }
    })
  },
  inputFocus() {
    this.setData({
      inputFocusing: true
    })
  },
  foucs() {
    this.setData({
      inputFocusing: false
    })
    this.updatePosition(500)
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 120
    const {
      windowHeight,
      platform
    } = wx.getSystemInfoSync()
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight
    this.setData({
      editorHeight,
      keyboardHeight
    })
  },
  submit() {
    this.editorCtx.getContents().then(res => {
      let {
        delta,
        html
      } = res
      delta.ops = delta.ops.map(d => {
        if (d.insert.image) {
          // html = html.replace(d.insert.image,src)
          const src = d.attributes['data-custom'].replace('id=', '')
          d.insert.image = src.replace('id=', '')
        }
        return d
      })
      wx.cloud.callFunction({
        name: 'forum',
        data: {
          action: 'add',
          type: this.data.type,
          delta,
          title: this.data.title
        }
      })
      console.log({
        delta
      })
    })
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