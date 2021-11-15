const utils = {
  formatTime(time, type = 'yyyy-mm-dd', toFixed) {
    const date = new Date()
    const oneDay = 24 * 60 * 60 * 1000
    const timeDelay = date.getTime() - time
    if (toFixed) {
      if (timeDelay < oneDay) {
        if (timeDelay / 1000 < 60) {
          return Math.floor(timeDelay / 1000) + '秒前'
        } else if (timeDelay / 60 / 1000 < 60) {
          return Math.floor(timeDelay / 60 / 1000) + '分钟前'
        } else if (timeDelay / 60 / 60 / 1000 < 24) {
          return Math.floor(timeDelay / 60 / 60 / 1000) + '小时前'
        }
      }
    }

    const y = new Date(time).getFullYear()
    const m = new Date(time).getMonth() + 1
    const d = new Date(time).getDate()
    return `${y}-${m}-${d}`
  },
  async getCloudFile({
    arrs,
    fileList
  }, type = 'arrs') {
    return await wx.cloud.getTempFileURL({
      fileList
    }).then(res => {
      if (type == 'html') return res
      arrs.forEach(a => {
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

    })
  },
  getQueryString(url, name) {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const r = url.match(reg);
    if (r != null) {
      return unescape(r[2]);
    }
    return null;
  },
  checkLogin(app, done) {
    return new Promise((resolve, rejcet) => {
      if (wx.getStorageSync('userInfo')) {
        resolve()
      } else {
        wx.getUserProfile({
          desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
          success: (res) => {
            app.globalData.userProfile = res
            wx.cloud.callFunction({
              name: 'login',
              data: res
            }).then(resp => {
              if (resp.result.code === 200) {
                if (!resp.result.data) {
                  app.globalData.user = {
                    visible: true,
                    userInfo: res.userInfo,
                    'info.name': res.userInfo.nickName,
                    'info.avatar': res.userInfo.avatarUrl,
                    avatar: res.userInfo.avatarUrl
                  }
                  done && done()
                } else {
                  wx.setStorageSync('userInfo', resp.result.data)
                  resolve()
                }
              }
            })
          }
        })
      }
    })
  }
}
export default utils