// components/image-button/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    openType: {
      type: String
    }
  },

  /**
   * 组件开启插槽选项
   */
  options: {
    multipleSlots: true
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
    onGetUserInfo:function(event){
      //将用户个人信息从组件中抛出到外部
      this.triggerEvent('getuserinfo',event.detail,{})
    }
  }
})