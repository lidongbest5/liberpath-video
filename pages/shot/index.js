const app = getApp()
const getUserVideoUrl = require('../..//config').getUserVideoUrl;
const uploadVideoUrl = require('../..//config').uploadVideoUrl;
const saveInteractiveVideo = require('../..//config').saveInteractiveVideo;

let curCondition = null;
let link1 = null;
let link2 = null;
let index = 1;

Page({
  data: {
    step: 0,
    videos: [],
    hasNext: false,
    showCondition: false,
    selectVideo: null,
    selectModalVideo: null,
    selectVideoUrl: null,
    inputValue1: '',
    inputValue2: '',
    videoModal: false,
    playCondition: {},
    saveCondition: [],
    preVideo: "",
    videoStatus: 0,
    preCondition1: "",
    preCondition2: "",
    preAdd: false

  },
  onLoad: function () {
    const self = this;

    wx.request({
      url: getUserVideoUrl,
      method: "POST",
      data: {
        userID: app.globalData.session.userid,
        start_pos: 0,
        end_pos: 100
      },
      success(res) {
        if (res.data.result_code === -1) {
          wx.showToast({
            title: 'server error',
            icon: 'error',
            duration: 2000
          })
        } else {
          self.setData({
            videos: res.data.data
          })
        }
      },
      fail(res) {
        
      }
    })
  },
  onSelectVideo: function(e) {
    const id = e.currentTarget.dataset.id;
    const d = this.data.videos.filter(item => item.videoID === id)[0];
    const url = d.videoUrl;
    this.setData({
      selectVideo: id,
      selectVideoUrl: url
    });
  },
  onSelectModalVideo: function(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectModalVideo: id
    });
  },
  onChangeStep: function(e) {
    this.setData({
      step: parseInt(e.currentTarget.dataset.step, 10)
    });
  },
  onAddVideo: function() {
    const self =this;

    wx.chooseVideo({
      sourceType: ['album','camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        wx.showLoading({title: "视频上传中"});
        wx.uploadFile({
          url: uploadVideoUrl,
          method: 'POST',
          filePath: res.tempFilePath,
          name: 'video',
          header: {
            'content-type': 'multipart/form-data'
          },
          formData: {
            userID: app.globalData.session.userid,
          },
          success (res){
            const tmp = self.data.videos;
            tmp.push(JSON.parse(res.data).data);
            self.setData({
              videos: tmp
            })
            wx.hideLoading();
          }
        })
      }
    })
  },
  onAddCondition: function() {
    this.setData({
      showCondition: true
    })
  },
  onNext: function() {
    const playCondition = this.data.playCondition;
    const saveCondition = this.data.saveCondition;
    const id = this.data.selectVideo;
    const d = this.data.videos.filter(item => item.videoID === this.data.selectVideo)[0];
    const that = this;
    if (!playCondition.ROOT) {
      playCondition.ROOT = {};
      playCondition.ROOT.videoUrl = d.videoUrl;
      playCondition.ROOT.videoID = d.videoID;
      playCondition.ROOT.videoCoverUrl = d.videoCoverUrl;
      playCondition.ROOT.children = {};

      playCondition.ROOT.children[this.data.inputValue1] = id+'-1';
      playCondition.ROOT.children[this.data.inputValue2] = id+'-2';
    } else {
      Object.keys(playCondition).forEach(function(key) {
        if (playCondition[key].videoID === id) {
          playCondition[key].children[that.data.inputValue1] = id+'-1';
          playCondition[key].children[that.data.inputValue2] = id+'-2';
        }
    });
    }

    const d1 = this.data.videos.filter(item => item.videoID === link1)[0];
    const d2 = this.data.videos.filter(item => item.videoID === link2)[0];
    playCondition[id+'-1'] = {
      videoCoverUrl: d1.videoCoverUrl,
      videoUrl: d1.videoUrl,
      videoID: d1.videoID,
      children: {}
    }

    playCondition[id+'-2'] = {
      videoCoverUrl: d2.videoCoverUrl,
      videoUrl: d2.videoUrl,
      videoID: d2.videoID,
      children: {}
    }

    saveCondition.push({
      number: index,
      video: d,
      children: [this.data.inputValue1, this.data.inputValue2]
    });

    saveCondition.push({
      number: index + 'A',
      video: d1,
      children: {}
    });

    saveCondition.push({
      number: index + 'B',
      video: d2,
      children: {}
    });
    index++;
    this.setData({
      playCondition,
      saveCondition,
      preVideo: saveCondition[0].video.videoUrl,
      step: 3
    });
  },
  onAddlink: function(e) {
    curCondition = e.currentTarget.dataset.condition;
    this.setData({
      videoModal: true
    })
  },
  bindKeyInput1: function(e) {
    this.setData({
      inputValue1: e.detail.value
    })
  },
  bindKeyInput2: function(e) {
    this.setData({
      inputValue2: e.detail.value
    })
  },
  onSaveCondition: function() {
    if (parseInt(curCondition) === 1) {
      link1 = this.data.selectModalVideo;
    } else {
      link2 = this.data.selectModalVideo;
    }
    this.setData({
      videoModal: false
    });

    if (link1 && link2 && this.data.inputValue1.length && this.data.inputValue2.length) {
      this.setData({
        hasNext: true
      });
    }
  },
  onBack: function() {
    curCondition = null;
    link1 = null;
    link2 = null;
    index = 1;
    this.setData({
      step: 1,
      hasNext: false,
      showCondition: false,
      selectVideo: null,
      selectModalVideo: null,
      selectVideoUrl: null,
      inputValue1: '',
      inputValue2: '',
      videoModal: false,
      playCondition: {},
      saveCondition: null,
      preVideo: "",
      videoStatus: 0,
      preCondition1: "",
      preCondition2: "",
      preAdd: false
    });
  },
  onVideoStart: function () {
    this.setData({
      videoStatus: 1
    });
  },
  onVideoEnd: function () {
    const d = [].concat(this.data.saveCondition);
    d.reverse();
    const tmp = d.filter(item => item.video.videoUrl === this.data.preVideo)[0];
    if (tmp.children.length) {
      this.setData({
        videoStatus: 0,
        preCondition1: tmp.children[0],
        preCondition2: tmp.children[1]
      });
    }
  },
  onSelectCondition: function(e) {
    const condition = e.currentTarget.dataset.condition;
    const d = [].concat(this.data.saveCondition);
    d.reverse();
    const tmp = d.filter(item => item.video.videoUrl === this.data.preVideo)[0];
    const id = tmp.number + condition;
    this.setData({
      preVideo: this.data.saveCondition.filter(item => item.number === id)[0].video.videoUrl
    });
    const videoContext = wx.createVideoContext('myVideo');
    videoContext.play();
  },
  onSelectPreVideo: function(e) {
    const id = e.currentTarget.dataset.id;
    const tmp = this.data.saveCondition.filter(item => item.video.videoID === id)[0];
    if (!tmp.children.length) {
      this.setData({
        selectPreVideo: id,
        preAdd: true
      });
    } else {
      this.setData({
        selectPreVideo: id,
        preAdd: false
      });
    }
  },
  onAddPreVideo: function() {
    const that = this;
    const d = this.data.videos.filter(item => item.videoID === that.data.selectPreVideo)[0];
    const url = d.videoUrl;

    curCondition = null;
    link1 = null;
    link2 = null;
    this.setData({
      selectVideo: this.data.selectPreVideo,
      selectVideoUrl: url,
      step: 2,
      hasNext: false,
      showCondition: false,
      selectModalVideo: null,
      inputValue1: '',
      inputValue2: '',
      videoModal: false,
      preVideo: "",
      videoStatus: 0,
      preCondition1: "",
      preCondition2: "",
      preAdd: false
    });
  },
  onSub: function() {
    const that = this;
    wx.showLoading({title: "保存视频中"});
    wx.request({
      url: saveInteractiveVideo,
      method: "POST",
      data: {
        userID: app.globalData.session.userid,
        playCondition: JSON.stringify(this.data.playCondition),
      },
      success(res) {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000,
          complete: function() {
            that.onBack();
          }
        })
      },
      fail(res) {
        
      }
    })
  }
})
