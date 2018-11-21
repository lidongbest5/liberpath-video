const openIdUrl = require('./config').openIdUrl;
const userRegisterUrl = require('./config').userRegisterUrl;

App({
  onLaunch: function () {
    const self = this;

    wx.getStorage({
      key: "session",
      success: (data) => {
        this.globalData.session = data.data;
      },
      fail: () => {
        this.getUserId();
      }
    });

    wx.getStorage({
      key: "userInfo",
      success: (data) => {
        this.globalData.userInfo = data.data;
      },
      fail: () => {}
    });
  },
  getUserId() {
    const self = this;

    wx.login({
      success(data) {
        wx.request({
          url: openIdUrl,
          method: "POST",
          data: {
            code: data.code,
            appName: "liblux"
          },
          success(res) {
            self.globalData.session = res.data.data;
            wx.setStorage({
              key: "session",
              data: res.data.data,
              success: () => {
                self.checkUserInfo();
              },
              fail: () => {}
            })
          },
          fail(res) {
            
          }
        })
      },
      fail(err) {
        
      }
    })
  },
  checkUserInfo() {
    const self = this;

    wx.getStorage({
      key: "userInfo",
      success: (data) => {

      },
      fail: () => {
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              wx.getUserInfo({
                success: res => {
                  const userInfo = res.userInfo;
                  wx.request({
                    url: userRegisterUrl,
                    method: "POST",
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                      userID: self.globalData.session.userid,
                      userName: userInfo.nickName,
                      userLocation: userInfo.city,
                      userBio: "",
                      userProfile: userInfo.avatarUrl
                    },
                    success(res) {
                      wx.setStorage({
                        key: "userInfo",
                        data: userInfo,
                        success: () => {},
                        fail: () => {}
                      })
                      self.globalData.userInfo = userInfo

                      if (self.userInfoReadyCallback) {
                        self.userInfoReadyCallback(userInfo)
                      }
                    },
                    fail(res) {
                      
                    }
                  })
                }
              })
            }
          }
        })
      }
    });
  },
  globalData: {
    userInfo: null,
    session: null
  }
})