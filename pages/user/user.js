//user.js
const util = require('../../utils/util.js');
const request = require('../../utils/request.js');

var app = getApp()
Page({
    data: {
        userInfo: {}
    },
    onLoad: function (option) {        
        wx.showLoading({
            title: '加载中...'
        });
        request({ 
            method: 'GET', 
            url: util.getUrl('/finduser',[{id: option.id}]) 
        }).then((resp) => {
            wx.hideLoading();
            let userInfo = resp.data,
                avatars = [];
            if(userInfo.avatarUrl) {
                avatars.push(userInfo.avatarUrl);
            }
            if(userInfo.photo1) {
                avatars.push(userInfo.photo1);
            }
            if(userInfo.photo2) {
                avatars.push(userInfo.photo2);
            }
            if(userInfo.photo3) {
                avatars.push(userInfo.photo3);
            }
            if(userInfo.photo4) {
                avatars.push(userInfo.photo4);
            }
            userInfo.avatars = avatars;
            this.setData({
                userInfo: userInfo
            });

            wx.setNavigationBarTitle({
                title: userInfo.nickName
            }); 
        });               
        
    }
})
