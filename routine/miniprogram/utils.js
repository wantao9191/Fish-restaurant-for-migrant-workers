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

    const y = date.getFullYear()
    const m = date.getMonth() + 1
    const d = date.getDate()
    return `${y}-${m}-${d}`
  }
}
export default utils