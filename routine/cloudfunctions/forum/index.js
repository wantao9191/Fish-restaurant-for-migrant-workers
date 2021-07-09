// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database({
  throwOnNotFound: false
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID,
    appid = wxContext.APPID,
    unionid = wxContext.UNIONID
  const {
    type,
    action,
    delta,
    title
  } = event
  if (action === 'add') {
    return await db.collection('forum').add({
      data: {
        type,
        title,
        openid,
        appid,
        unionid,
        delta,
        timestmp: new Date().getTime(),
        discussNum: 0,
        thumbsNum: 0
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
  }
}