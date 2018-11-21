const app = getApp()
const getUserInteractiveVideo = require('../..//config').getUserInteractiveVideo;

Page({
  data: {
    tab: 1,
    userInfo: {},
    hasUserInfo: false,
    data: []
  },
  onLoad: function () {
    wx.showLoading();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
      this.getUserData();
    } else {
      app.userInfoReadyCallback = data => {
        this.setData({
          userInfo: data,
          hasUserInfo: true
        });
        this.getUserData();
      }
    }

  },
  getUserData: function() {
    const that = this;
    wx.request({
      url: getUserInteractiveVideo,
      method: "POST",
      data: {
        userID:  app.globalData.session.userid,
        start_pos: 0,
        end_pos: 10
      },
      success(res) {
        if (res.data.result_code === -1) {
          wx.showToast({
            title: 'server error',
            icon: 'error',
            duration: 2000
          })
        } else {
          const data = res.data.data;
          data.forEach(item => {
            item.playCondition = JSON.parse(item.playCondition);
            item.playCondition.ROOT.childrenList = Object.keys(item.playCondition.ROOT.children);
          });
          that.setData({
            data
          })
        }
        wx.hideLoading();
      },
      fail(res) {
        
      }
    })
  },
  onChangeTab: function(e) {
    this.setData({
      tab: parseInt(e.target.dataset.tab, 10)
    })
  }
})
