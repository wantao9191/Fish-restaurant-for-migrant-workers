// components/talk-item/index.js
Component({
  /**
   * 组件的属性列表
   */
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    arrs: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClick(e) {
      let id = e.currentTarget.dataset.id
      this.triggerEvent('itemClick', id)
    },
    previewCover(e) {
      const {
        index
      } = e.target.dataset
      const urls = this.properties.arrs[index].covers.filter(a => {
        return a.src
      }).map(a => {
        return a.src
      })
      wx.previewImage({
        urls
      })
    }
  }
})