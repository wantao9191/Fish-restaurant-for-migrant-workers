// libs/dialog/index.js
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String
    },
    visible: {
      type: Boolean,
      value: false
    },
    flowClick: {
      type: Boolean,
      value: false
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
    flowClick() {
      if (this.properties.flowClick) this.triggerEvent('close')

    }
  }
})