// pages/nation/nation.js
// const canvasId = 'my-canvas'
// const mul = 1
const mul = 4
const canvasId = 'myCanvas'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 判断用户是否授权
    authorized: false,
    avatar: '',
    // avatar: "http://7d9oi4.com1.z0.glb.clouddn.com/avatar.png",
    // 当前的icon图标
    currentIcon: '',
    // 当前的位置
    currentPositon: 3,
    iconList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getIconList()
    this.userAuthorized()
  },

  getIconList() {
    let that = this
    wx.promisify('request')({ url: 'https://linlishe-1259653897.cos.ap-guangzhou.myqcloud.com/icon.json' }).then(res => {
      console.log("iconList", res.data)
      that.setData({
        iconList: res.data
      })
    })
  },

  /**
   * 用户是否已经授权
   */
  userAuthorized() {
    let that = this
    wx.promisify('getSetting')().then(setRes => {
      if (setRes.authSetting['scope.userInfo']) {
        wx.promisify('getUserInfo')().then(infoRes => {
          // 处理头像
          let avatar = infoRes.userInfo.avatarUrl
          let stringArray = avatar.split('/')
          stringArray.pop()
          stringArray.push('0')
          avatar = stringArray.join('/');
          console.log({ avatar })
          that.setData({
            avatar: avatar,
            authorized: true
          })
        })
      } else {
        that.setData({
          authorized: false
        })

      }
    })
  },


  onGetUserInfo() {
    this.userAuthorized()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  chooseIcon(event) {
    if (!this.data.authorized) {
      return wx.showToast({ title: '请点击获取微信头像', icon: 'none' })
      return false
    }
    let icon = event.currentTarget.dataset.image
    console.log({ icon })
    this.setData({
      currentIcon: icon,
      currentPositon: 3
    })
  },

  choosePosition(event) {
    let that = this
    if (!that.data.authorized) {
      return wx.showToast({ title: '请点击获取微信头像', icon: 'none' })
      return false
    }
    if (!that.data.currentIcon) {
      wx.showToast({ title: '请先选择图标', icon: 'none' })
      return false
    }
    let position = event.currentTarget.dataset.position
    that.setData({ currentPositon: position })
  },

  saveImage() {
    let that = this
    if (!that.data.authorized) {
      return wx.showToast({ title: '请点击获取微信头像', icon: 'none' })
      return false
    }
    let currentIcon = that.data.currentIcon
    if (!currentIcon) {
      wx.showToast({ title: '请先选择图标', icon: 'none' })
      return false
    }

    wx.showLoading({ title: '正在制作...' })

    that.canvasDrawImage((image) => {
      wx.promisify('saveImageToPhotosAlbum')({
        filePath: image
      }).then(() => {
        wx.showToast({ title: '保存成功' })
      })
    })

    setTimeout(() => {
      wx.hideLoading()
    }, 2000)
    console.log('开始画图')
  },


  canvasDrawImage(callback) {
    let that = this
    // 获取两个数据
    let icon = that.data.currentIcon, avatar = that.data.avatar, position = that.data.currentPositon

    // 下载图标，获取头像信息
    wx.promisify('downloadFile')({
      url: icon
    }).then(iconRes => {
      wx.promisify('getImageInfo')({
        src: avatar
      }).then(avatarRes => {
        let tempAvatar = avatarRes.path
        let tempIcon = iconRes.tempFilePath
        that.__picture(tempIcon, tempAvatar, position, (image) => {
          return callback(image)
        })
      })
    })
  },

  __picture(tempIcon, tempAvatar, position, callback) {
    const screenWidth = wx.getSystemInfoSync().screenWidth
    // 其中 * 4 是我们canvas画大图
    const multiple = parseFloat(screenWidth / 750) * mul
    const ctx = wx.createCanvasContext(canvasId, this)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, 300 * multiple, 300 * multiple)
    ctx.save() //保存之前状态，便于画完圆继续使用
    roundedRect(ctx, 10 * multiple, 10 * multiple, 280 * multiple, 280 * multiple, 30 * multiple)
    ctx.clip()
    ctx.drawImage(tempAvatar, 10 * multiple, 10 * multiple, 280 * multiple, 280 * multiple)
    ctx.restore()
    // 一下300就是300rpx
    let iconSize = 110
    let dx = 0, dy = 0, dw = iconSize, dh = iconSize
    switch (parseInt(position)) {
      case 0:
        dx = 0, dy = 0
        break;
      case 1:
        dx = 190, dy = 0
        break;
      case 2:
        dx = 0, dy = 190
        break;
      case 3:
        dx = 190, dy = 190
        break;
    }
    ctx.drawImage(tempIcon, dx * multiple, dy * multiple, dw * multiple, dh * multiple)

    ctx.draw(false, () => {
      // 保存图片
      wx.promisify('canvasToTempFilePath')({
        canvasId: canvasId,
        x: 0, y: 0, width: 300 * multiple, height: 300 * multiple,
        destWidth: 600 * multiple, destHeight: 600 * multiple
      }).then(info => {
        console.log({ info })
        return callback(info.tempFilePath)
      })
    })
  },


})

/**
 * 画四边圆角
 */
const roundedRect = (ctx, x, y, width, height, radius) => {
  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
  ctx.stroke();
}