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
    title: '',
    visible: false,
    place: {
      home: '大厅'
    },
    id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type || 'home',
      id: options.id || ''
    })
    if (options.id) {
      this.getData()
    }
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
  // 获取编辑数据
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
          let html = res.result.data.html
          resp.fileList.forEach(f=>{
            html = html.replace(f.fileID,f.tempFileURL)
          })
          this.setData({
            title: res.result.data.title
          })
          this.editorCtx.setContents({
            html
          })
        })
      }
      console.log(res)
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
  // 插入图片
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
              id: result.fileID,
              filePath
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
  // 计算高度
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
  // 打开询问弹窗
  toggleVisible() {
    this.setData({
      visible: !this.data.visible
    })
  },
  // 发帖
  submit(e) {
    if (!this.data.title) {
      wx.showToast({
        title: '标题必填',
        icon: 'none'
      })
      this.toggleVisible()
      return
    }
    this.editorCtx.getContents().then(res => {
      let {
        delta,
        html
      } = res
      let hasImage = false
      delta.ops = delta.ops.map(d => {
        if (d.insert.image) {
          hasImage = true
          const src = app.utils.getQueryString(d.attributes['data-custom'], 'id')
          const filePath = app.utils.getQueryString(d.attributes['data-custom'], 'filePath')
          html = html.replace(filePath,src)
          d.insert.image = src
        }
        return d
      })
      if (!/\S/.test(res.text) && !hasImage) {
        wx.showToast({
          title: '帖子内容不能为空',
          icon: 'none'
        })
        return
      }
      this.toggleVisible()
      wx.showLoading({
        title: this.data.id ? '正在保存...' : '正在发帖...',
      })
      wx.cloud.callFunction({
        name: 'forum',
        data: {
          action: this.data.id ? 'update' : 'add',
          type: this.data.type,
          delta,
          html,
          title: this.data.title,
          status: Number(e.target.dataset.status)
        }
      }).then(res => {
        if (res.result.code === 200) {
          if (res.result.data) {
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
        }
        wx.hideLoading()
        console.log(res)
      }).catch(() => {
        wx.hideLoading()
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