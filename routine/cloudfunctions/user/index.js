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
  const data = {
    ...event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    timestap: new Date().getTime(),
    forums: 0
  }
  return await db.collection('user').where({
    openid: wxContext.OPENID
  }).get().then(user => {
    console.log(user)
    if (!user.data.length) {
      return db.collection('user').add({
        data
      }).then(res => {
        return {
          data,
          code: 200,
          message: '登记成功'
        }
      })
    } else {
      return {
        code: 200,
        data: user.data[0],
        message: '查询成功'
      }
    }
  })

}