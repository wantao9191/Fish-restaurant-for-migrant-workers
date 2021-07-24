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
const replay = {
  async add(event, openid) {
    const {
      id,
      delta,
      html,
      replayId,
      replayInfo
    } = event
    return await this.getUser(openid).then(user => {
      const userInfo = user.data[0]
      const {
        name,
        nickName,
        avatar,
        headimg,
        _id
      } = userInfo
      db.collection('user')
      return db.collection('replay').add({
        data: {
          forum_id: id,
          delta,
          html,
          openid,
          replayId,
          timestmp: new Date().getTime(),
          user: {
            name,
            nickName,
            avatar,
            headimg,
            id: _id
          },
          uid: user._id,
          replayInfo
        }
      }).then(res => {
        db.collection('disscuss').where({
          _id: replayId
        }).update({
          data: {
            replayNumber: _.inc(1)
          }
        })
        db.collection('user').where({
          openid
        }).update({
          data: {
            replays: _.inc(1)
          }
        })
        return {
          code: 200,
          data: {
            id: res._id
          },
          message: '评论成功'
        }
      })
    })
  },
  async get(event, openid) {
    const {
      pageSize,
      pageNo,
      id,
      sortByTime,
      uid
    } = event
    let rules = {
      replayId: _.eq(id)
    }
    if (uid) {
      rules = {
        openid: uid
      }
    }
    let sortType = sortByTime || -1
    const totalResult = await db.collection('replay').where(rules).count()
    let dataResult = await db.collection('replay').aggregate().match(rules).sort({
      timestmp: sortType
    })
    dataResult = dataResult.skip(pageNo).limit(pageSize)
    dataResult = dataResult.lookup({
      from: 'user',
      let: {
        user_openid: '$openid'
      },
      pipeline: $.pipeline().match(_.expr($.eq(['$openid', '$$user_openid']))).project({
        name: 1,
        nickName: 1,
        openid: 1,
        headimg: 1,
        avatar: 1,
        work: 1
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
  },
  async getone(event, openid) {
    const {
      id
    } = event
    return await db.collection('replay').aggregate().match({
      _id: _.eq(id)
    }).lookup({
      from: 'user',
      let: {
        user_openid: '$openid'
      },
      pipeline: $.pipeline().match(_.expr($.eq(['$openid', '$$user_openid']))).project({
        name: 1,
        nickName: 1,
        openid: 1,
        headimg: 1,
        avatar: 1,
        work: 1
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
        messages: '查询成功',
        data: res.list[0]
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
  const action = replay[event.action]
  return action ? await replay[event.action](event, openid, appid, unionid) : {
    code: 201,
    message: '该方法未定义'
  }
}