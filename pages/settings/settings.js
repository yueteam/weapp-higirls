//settings.js
const util = require('../../utils/util.js');
const request = require('../../utils/request.js');

var app = getApp()
Page({
    data: {
        isSubmit: false,
        infoReady: false,
        userId: '',
        avatarUrl: '',
        nickName: '',
        gender: '',
        birthday: '',
        personality: '',
        business: '',
        company: '',
        profession: '',
        genderList: [{
            id: '1',
            text: '男'
        }, {
            id: '2',
            text: '女'
        }],
        businessList: ['IT互联网','学生','文化传媒','房地产建筑','金融类','消费品','汽车机械','教育培训','贸易物流','生物医疗','能源化工','工业制造','政府机构','服务业','其他']
    },
    onLoad: function () {
        wx.setNavigationBarTitle({
            title: '编辑个人资料'
        })
        if (app.globalData.userInfo) {           
            wx.showLoading({
                title: '加载中...',
                mask: true
            });
            request({ 
                method: 'GET', 
                url: util.getUrl('/finduser',[{id: app.globalData.userInfo._id}]) 
            }).then((resp) => {
                wx.hideLoading();
                let userInfo = resp.data;
                this.setData({
                    infoReady: true,
                    userId: userInfo._id,
                    avatarUrl: userInfo.avatarUrl,
                    photo1: userInfo.photo1 || '',
                    photo2: userInfo.photo2 || '',
                    photo3: userInfo.photo3 || '',
                    photo4: userInfo.photo4 || '',
                    nickName: userInfo.nickName,
                    gender: userInfo.gender || '0',
                    birthday: userInfo.birthday || '',
                    personality: userInfo.personality || '',
                    business: userInfo.business || '',
                    company: userInfo.company || '',
                    profession: userInfo.profession || ''
                })
            });               
        }
    },
    uploadPic(e) {
        let me = this;
        let index = e.target.dataset.index;
        let userId = this.data.userId;
        wx.chooseImage({
            count: 1,
            success: function(res) {
                var tempFilePaths = res.tempFilePaths;
                wx.uploadFile({
                  url: util.getUrl('/upload'),
                  filePath: tempFilePaths[0],
                  name: 'file',
                  header: { 
                    'Content-Type': 'multipart/form-data'
                  },
                  formData:{
                    'index': index,
                    'userId': userId
                  },
                  success: function(res){
                    let picUrl = res.data;
                    switch (index){
                        case 'avatarUrl':
                            me.setData({
                                avatarUrl: picUrl
                            });
                            app.globalData.userInfo.avatarUrl = picUrl;
                            wx.setStorageSync('userInfo', app.globalData.userInfo);
                            break;
                        case 'photo1':
                            me.setData({
                                photo1: picUrl
                            });
                            break;
                        case 'photo2':
                            me.setData({
                                photo2: picUrl
                            });
                            break;
                        case 'photo3':
                            me.setData({
                                photo3: picUrl
                            });
                            break;
                        case 'photo4':
                            me.setData({
                                photo4: picUrl
                            });
                            break;
                    }                   
                  }

                })
            }
        })
    },
    bindGenderChange(e) {
        this.setData({
            gender: e.detail.value === 0 ? '1' : '2'
        })
    },
    bindBirthdayChange(e) {
        this.setData({
            birthday: e.detail.value
        })
    },
    bindBusinessChange(e) {
        this.setData({
            business: this.data.businessList[e.detail.value]
        })
    },
    showToast(text) {
        wx.showToast({
            title: text,
            image: '../../images/warn.png',
            duration: 500
        });
    },
    trim(str) {  
        return str.replace(/^(\s|\u00A0)+/,'').replace(/(\s|\u00A0)+$/,'');  
    },
    submitForm(e) {       
        let nickName = this.trim(e.detail.value.nick),
            personality = this.trim(e.detail.value.personality),
            company = this.trim(e.detail.value.company),
            profession = this.trim(e.detail.value.profession),
            submitObj = {
                userId: app.globalData.userInfo._id,
                nickName: nickName,
                gender: this.data.gender,
                birthday: this.data.birthday,
                personality: personality,
                business: this.data.business,
                company: company,
                profession: profession
            };

        if(nickName === '') {
            this.showToast('请填写昵称');
            return false;
        }
        if(!this.data.gender) {
            this.showToast('请选择性别');
            return false;
        }
        if(!this.data.birthday) {
            this.showToast('请完善生日');
            return false;
        }

        this.setData({
            isSubmit: true
        });
        request({ 
            method: 'POST', 
            url: util.getUrl('/saveuserinfo'),
            data: submitObj,
            header: {
                'content-type': 'application/json'
            }
        }).then((resp) => {
            if (resp.code === 0) { 
                let userInfo = app.globalData.userInfo,
                    newUserInfo = Object.assign({}, userInfo, resp.data);

                app.globalData.userInfo = newUserInfo;
                wx.setStorageSync('userInfo', newUserInfo);       
                wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 1000,
                    complete: function() {
                        wx.reLaunch({
                            url: '../profile/profile'
                        })
                    }
                })
            }            
        });
    }
})
