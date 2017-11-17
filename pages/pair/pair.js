//pair.js
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
        
    }
})
