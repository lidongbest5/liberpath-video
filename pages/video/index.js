const app = getApp()

Page({
  data: {
    videoStatus: 1,
    videoReply: false
  },
  onLoad: function () {
    
  },
  onVideoStart: function () {
    this.setData({
      videoStatus: 1
    });
  },
  onVideoEnd: function () {
    this.setData({
      videoStatus: 0
    });
  },
  onToggleReply: function () {
    const tmp = !this.data.videoReply;
    this.setData({
      videoReply: tmp
    });
  },
  onShowShare: function() {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})
