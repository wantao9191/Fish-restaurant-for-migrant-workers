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
      console.log(res)
      return {
        code: 200,
        message: '发布成功',
        data: {
          id: res._id
        }
      }
    })
  },
  async getOne(event) {
    const {} = event
    return await db.collection('forum')
  },
  async getHotList(event) {
    const {} = event

    return await db.collection('forum').aggregate().sort({
      timestmp: -1,
      thumbsNum: -1,
      discussNum: -1
    }).project({
      appid: 0
    }).limit(3).lookup({
      from: 'user',
      // localField: 'openid',
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
      user: 0
    }).end().then(res => {
      return {
        code: 200,
        data: res.list,
        message: '查询成功'
      }
    })
  }
}
// 云函数入口函数
exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  console.log(wxContext)
  const openid = wxContext.OPENID,
    appid = wxContext.APPID,
    unionid = wxContext.UNIONID
  return await forum[event.action](event, openid, appid, unionid)

}