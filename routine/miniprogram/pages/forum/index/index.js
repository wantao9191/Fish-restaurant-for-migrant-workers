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
    },
    user: app.globalData.user,
    visible: false,
    params: {
      pageNo: 1,
      pageSize: 5
    },
    arrs: [],
    triggered: false,
    bottomLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    this.getDiscuss()
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
    // app.globalData.getData = {
    //   id: 'cbddf0af60f04eea1710662b450bfe9f',
    //   replayId: '28ee4e3e60f396b22b5a970b35e287bd'
    // }
    if (app.globalData.getData) {
      let {
        replayId,
        id
      } = app.globalData.getData
      if (replayId) {
        this.getReplay(replayId).then(res => {
          app.globalData.getData = false
          if (res) {
            let result = this.getResult(res)
            let index = this.data.arrs.findIndex(a => {
              return a.id === id
            })
            if (this.data.arrs[index].replayList) {
              this.data.arrs[index].replayList.unshift(result)
            } else {
              this.data.arrs[index].replayList = [result]
            }

            this.setData({
              arrs: this.data.arrs
            })
            this.setCovers([result])
          }
        })
      } else {
        console.log(id)
        this.getOneByDisscuss(id).then(res => {
          app.globalData.getData = false
          if (res) {
            console.log(res)
            let result = this.getResult(res)
            this.data.arrs.unshift(result)
            this.setData({
              arrs: this.data.arrs
            })
            this.setCovers([result])
          }
        })
        console.log(11234)
      }
    }
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
        if (res.result.data.status === 2) {
          wx.showToast({
            title: '该主题不存在，可能被删除或隐藏',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 1000);
          return
        }
        const fileList = res.result.data.delta.ops.filter(d => {
          return d.insert.image
        }).map(d => {
          return {
            fileID: d.insert.image,
          }
        })
        app.utils.getCloudFile({
          fileList,
        }, 'html').then((resp) => {
          let html = res.result.data.html
          resp.fileList.forEach(f => {
            html = html.replace(f.fileID, f.tempFileURL)
          })
          html = html.replace(/<img/g, '<img style="max-width:100%;"')
          res.result.data.timestmp = app.utils.formatTime(res.result.data.timestmp, 'yyyy-mm-dd hh:mm', true)
          this.setData({
            detail: {
              ...res.result.data,
              html
            }
          })
        })
      }
    })
  },
  // 获取评论
  getDiscuss() {
    let {
      pageNo,
      pageSize
    } = this.data.params
    wx.cloud.callFunction({
      name: 'discuss',
      data: {
        action: 'get',
        pageNo,
        pageSize,
        id: this.data.id
      }
    }).then(res => {
      if (res.result.code === 200) {
        let datas = res.result.data.datas
        datas = datas.map(a => {
          const result = this.getResult(a)
          result.replayList = result.replayList && result.replayList.map(r => {
            return this.getResult(r)
          })
          return result
        })
        let dataArrs = this.data.arrs.concat(datas)
        this.setData({
          arrs: dataArrs,
          isFinshed: dataArrs.length >= res.result.data.total,
          triggered: false,
          bottomLoading: false
        })
        this.setCovers(dataArrs)
      }
    })
  },
  async getReplay(id) {
    return await wx.cloud.callFunction({
      name: 'replay',
      data: {
        action: 'getone',
        id
      }
    }).then(res => {
      if (res.result.code === 200) {
        return res.result.data
      } else {
        return null
      }
    })
  },
  async getOneByDisscuss(id) {
    return await wx.cloud.callFunction({
      name: 'discuss',
      data: {
        action: 'getone',
        id
      }
    }).then(res => {
      if (res.result.code === 200) {
        return res.result.data
      } else {
        return null
      }
    })
  },
  // 对数据进行操作，转换为需要的
  getResult(data) {
    const covers = data.delta.ops.filter(d => {
      return d.insert.image
    }).map(d => {
      return {
        fileID: d.insert.image,
        alt: '../../assets/images/default-img.jpg',
        src: ''
      }
    })
    let userInfo = data.userInfo || data.user
    let result = {
      avatar: userInfo.headimg,
      name: userInfo.name,
      work: userInfo.work,
      timestmp: app.utils.formatTime(data.timestmp, 'yyyy-mm-dd', true),
      covers,
      id: data._id,
      html: data.html,
      replayList: data.replayList,
      uid: userInfo.id,
      replayInfo: data.replayInfo,
      replayNumber: data.replayNumber
    }
    return result
  },
  // 设置图片
  setCovers(arrs) {
    let fileList = []
    arrs.forEach(a => {
      if (a.covers) fileList.push(...a.covers)
      if (a.replayList) {
        a.replayList.forEach(r => {
          if (r.covers) fileList.push(...r.covers)
        })
      }
    })
    if (fileList.length) {
      // 全局获取云文件方法
      app.utils.getCloudFile({
        fileList
      }, 'html').then((res) => {
        if (res.fileList.length) {
          arrs.forEach(a => {
            res.fileList.forEach(f => {
              a.html = a.html.replace(f.fileID, f.tempFileURL)
              if (a.replayList) {
                a.replayList.forEach(r => {
                  r.html = r.html.replace(f.fileID, f.tempFileURL)
                  r.html = r.html.replace(/<img/g, '<img style="max-width:100%;"')
                })
              }
            })
            a.html = a.html.replace(/<img/g, '<img style="max-width:100%;"')
          })
        }

        this.setData({
          arrs: this.data.arrs
        })
      })
    }
  },
  // 初始化富文本编辑器
  onEditorReady() {
    wx.createSelectorQuery().select('#editor').context(res => {
      this.editorCtx = res.context
    }).exec()
  },
  // 删除
  del() {
    wx.showLoading({
      title: '删除中...',
    })
    wx.cloud.callFunction({
      name: 'forum',
      data: {
        action: 'del',
        id: this.data.id
      }
    }).then(res => {
      wx.hideLoading()
      this.toggleDialog()
      if (res.result.code === 200) {
        app.globalData.getData = true
        wx.nextTick(() => {
          wx.showToast({
            title: res.result.message,
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack()
          }, 500);
        })
      }


    })
  },
  // 删除确认
  toggleDialog() {
    this.setData({
      visible: !this.data.visible
    })
  },
  // 编辑
  edit() {
    wx.navigateTo({
      url: '../edit/index?id=' + this.data.detail._id,
    })
  },
  // 前往聊天
  gotoDiscuss(e) {
    console.log(e.currentTarget.dataset)
    const {
      id,
      userid,
      name
    } = e.currentTarget.dataset
    let url = `../discuss/index?id=${this.data.id}`
    if (id) url += `&disId=${id}`
    if (name) url += `&name=${name}`
    if (userid) url += `&userid=${userid}`
    wx.navigateTo({
      url,
    })
  },
  // 获取跟多聊天
  getMore(e) {
    wx.showLoading({
      title: 'loading...',
    })
    let {
      index
    } = e.target.dataset
    let item = this.data.arrs[index]
    if (item.isFinshed) return
    wx.cloud.callFunction({
      name: 'replay',
      data: {
        action: 'get',
        id: item.id,
        pageNo: item.replayList.length,
        pageSize: 5
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result.code === 200) {
        let datas = res.result.data.datas
        datas = datas.map(a => {
          const result = this.getResult(a)
          return result
        })
        let dataArrs = item.replayList.concat(datas)
        if (dataArrs.length >= item.replayNumber) {
          item.isFinshed = true
        }
        let key = `arrs[${index}].replayList`
        let key2 = `arrs[${index}].isFinshed`
        this.setData({
          [key]: dataArrs,
          [key2]: item.isFinshed
        })
        this.setCovers(dataArrs)
      }
    }).catch(() => {
      wx.hideLoading()
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
  onPullDownRefresh: function (e) {
    if (!this.data.triggered) {
      console.log(e)
      this.data.params.pageNo=1
      this.setData({
        arrs: []
      })
      this.getDiscuss()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {
    
    if (this.data.isFinshed || this.data.bottomLoading) return
    this.data.params.pageNo += 1
    this.getDiscuss()
    this.setData({
      bottomLoading: true
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})