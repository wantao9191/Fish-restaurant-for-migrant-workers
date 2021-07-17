// miniprogram/pages/forum/index.js
const app = getApp()
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
    visible: false,
    place: {
      home: '大厅'
    },
    id: '',
    user: app.globalData.user,
    editorContent: {},
    ENV:app.globalData.ENV
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id || '',
      disId: options.disId,
      userid:options.userid,
      name:options.name
    })
    const platform = wx.getSystemInfoSync().platform
    const isIOS = platform === 'ios'
    const that = this
    this.setData({
      isIOS
    })
    this.updatePosition(0)
    let keyboardHeight = 0
    // 键盘弹出收起事件
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
  // 插入图片
  insertImage() {
    wx.chooseImage({
      count: 1,
      success: res => {
        const filePath = res.tempFilePaths[0]
        // 上传图片
        const cloudPath = `discuss/${this.data.user._id}-${new Date().getTime()}${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          filePath,
          cloudPath
        }).then(result => {
          this.editorCtx.insertImage({
            src: res.tempFilePaths[0],
            data: {
              id: result.fileID,
              filePath
            },
            success: function () {
              console.log('insert image success')
            }
          })
        })
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
  cancel(){
    this.editorCtx.blur()
  },
  // 计算高度
  updatePosition(keyboardHeight) {
    const toolbarHeight = 40
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
  // 打开询问弹窗
  toggleVisible() {
    this.setData({
      visible: !this.data.visible
    })
  },
  beforeSubmit() {
    this.editorCtx.getContents().then(res => {
      let hasImage = false
      let {
        delta,
        html
      } = res
      delta.ops = delta.ops.map(d => {
        if (d.insert.image) {
          hasImage = true
          const src = app.utils.getQueryString(d.attributes['data-custom'], 'id')
          const filePath = app.utils.getQueryString(d.attributes['data-custom'], 'filePath')
          html = html.replace(filePath, src)
          d.insert.image = src
        }
        return d
      })
      if (!/\S/.test(res.text) && !hasImage) {
        wx.showToast({
          title: '评论内容不能为空',
          icon: 'none'
        })
        return
      }
      this.data.editorContent = {
        delta,
        html
      }
      this.toggleVisible()
    })
  },
  // 发帖
  submit() {
    let {
      delta,
      html
    } = this.data.editorContent
    wx.showLoading({
      title: '发送评论中...',
    })
    const name = this.data.disId ? 'replay' :'discuss'
    let replayInfo 
    if(this.options.userid){
      replayInfo = {userid:this.options.userid,name:this.options.name}
    }
    wx.cloud.callFunction({
      name,
      data: {
        action: 'add',
        delta,
        html,
        id: this.data.id,
        replayId: this.data.disId,
        replayInfo
      }
    }).then(res => {
      if (res.result.code === 200) {
        wx.showToast({
          title: res.result.message,
          icon: 'none',
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1000);

      } else {
        wx.showToast({
          title: res.result.message,
        })
      }
      this.toggleVisible()
      wx.hideLoading()
      console.log(res)
    }).catch(() => {
      wx.hideLoading()
    })

  },
  // 回复
  submitReplay(){},
  confirm(){
    if(this.data.disId) {
      this.submitReplay()
    }else{
      this.submit()
    }
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