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
const disscuss = {
  async add(event, openid) {
    const {
      id,
      delta,
      html,
    } = event
    return await db.collection('disscuss').add({
      data: {
        forum_id: id,
        delta,
        html,
        openid,
        timestmp: new Date().getTime()
      }
    }).then(res => {
      return {
        code: 200,
        message: '评论成功'
      }
    })
  },
  async get(event, openid) {
    const {
      pageSize,
      pageNo,
      id
    } = event
    const totalResult = await db.collection('disscuss').where({
      forum_id: _.eq(id)
    }).count()
    const dataResult = await db.collection('disscuss').aggregate().match({
      forum_id: _.eq(id)
      }).sort({
        timestmp: 1
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
          avatar: 1,
          work:1
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
  }
}
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID,
    appid = wxContext.APPID,
    unionid = wxContext.UNIONID
  const action = disscuss[event.action]
  return action ? await disscuss[event.action](event, openid, appid, unionid) : {
    code: 201,
    message: '该方法未定义'
  }
}