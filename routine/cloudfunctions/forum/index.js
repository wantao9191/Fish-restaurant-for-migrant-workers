// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database({
  throwOnNotFound: false
})
const _ = db.command
const $ = db.command.aggregate
const forum = {
  // 新增帖子
  async add(event, openid) {
    const {
      type,
      delta,
      html,
      title,
      status
    } = event
    return await db.collection('forum').add({
      data: {
        type,
        title,
        openid,
        delta,
        timestmp: new Date().getTime(),
        discussNum: 0,
        thumbsNum: 0,
        status,
        html
      }
    }).then(res => {
      db.collection('user').where({
        openid
      }).update({
        data: {
          forums: _.inc(1)
        }
      })
      return {
        code: 200,
        message: '发布成功',
        data: {
          id: res._id
        }
      }
    })
  },
  async update(event, openid){},
  // 删除帖子
  async del(event, openid) {
    return await db.collection('forum').doc(event.id).get().then(res => {
      if (openid === res.data.openid) {
        return Promise.resolve(db.collection('forum').where({
          _id: event.id
        }).update({
          data: {
            status: 2
          }
        }).then(state => {
          return {
            code: 200,
            message: '删除成功！'
          }
        }))
      }
    })
  },
  // 获取帖子详情
  async getOne(event) {
    const {
      id
    } = event
    return await db.collection('forum').doc(id).get().then(res => {
      if (res.data) {
        const openid = res.data.openid
        delete res.data.openid
        delete res.data.appid
        return this.getUser(openid).then(user => {
          const userInfo = user.data[0]
          const {
            openid,
            appid,
            mobile,
            ...refer
          } = userInfo
          return {
            code: 200,
            message: '查询成功',
            data: {
              ...res.data,
              user: refer
            }
          }
        })
      }
    })
  },
  // 获取热门帖子
  async getHotList(event) {
    const {} = event
    return await db.collection('forum').aggregate().match({
      status: 1
    }).sort({
      timestmp: -1,
      thumbsNum: -1,
      discussNum: -1
    }).limit(3).lookup({
      from: 'user',
      let: {
        user_openid: '$openid'
      },
      pipeline: $.pipeline().match(_.expr($.eq(['$openid', '$$user_openid']))).project({
        name: 1,
        nickName: 1,
        openid: 1,
        headimg: 1,
        avatar: 1
      }).done(),
      as: 'user',
    }).replaceRoot({
      newRoot: $.mergeObjects([{
        userInfo: $.arrayElemAt(['$user', 0])
      }, '$$ROOT'])
    }).project({
      user: 0,
      appid: 0
    }).end().then(res => {
      return {
        code: 200,
        data: res.list,
        message: '查询成功'
      }
    })
  },
  // 获取帖子列表
  async getList(event) {
    const {
      pageSize,
      pageNo
    } = event
    const totalResult = await db.collection('forum').where({
      status: _.eq(1)
    }).count()
    const dataResult = await db.collection('forum').aggregate().match({
        status: _.eq(1)
      }).sort({
        timestmp: -1
      }).skip(pageNo - 1).limit(pageSize)
      .lookup({
        from: 'user',
        let: {
          user_openid: '$openid'
        },
        pipeline: $.pipeline().match(_.expr($.eq(['$openid', '$$user_openid']))).project({
          name: 1,
          nickName: 1,
          openid: 1,
          headimg: 1,
          avatar: 1
        }).done(),
        as: 'user',
      }).replaceRoot({
        newRoot: $.mergeObjects([{
          userInfo: $.arrayElemAt(['$user', 0])
        }, '$$ROOT'])
      }).project({
        user: 0,
        appid: 0
      }).end()
    return await Promise.all([totalResult, dataResult]).then(([tr, dr]) => {
      console.log(tr, dr)
      return {
        code: 200,
        data: {
          datas: dr.list,
          total: tr.total,
          pageNo,
          pageSize
        },
        message: '查询成功'
      }
    })
    // then(res => {
    //   console.log(res)

    // })
  },
  async getUserForum(event, oid) {
    const {
      pageNo,
      pageSize,
      openid
    } = event
    const totalResult = await db.collection('forum').where({
      status: _.eq(openid || oid)
    }).count()
    const dataResult = await db.collection('forum').where({
      openid: _.eq(openid || oid)
    }).skip(pageNo - 1).limit(pageSize).get()
    return await Promise.all([totalResult, dataResult]).then(([tr, dr]) => {
      return {
        code: 200,
        message: '查询成功',
        data: {
          datas: dr.data,
          pageNo,
          pageSize,
          total: tr.total,
        }
      }
    })
  },
  // 获取用户
  async getUser(openid) {
    return await db.collection('user').where({
      openid
    }).get()
  },
}
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID,
    appid = wxContext.APPID,
    unionid = wxContext.UNIONID
  const action = forum[event.action]
  return action ? await forum[event.action](event, openid, appid, unionid) : {
    code: 201,
    message: '该方法未定义'
  }

}