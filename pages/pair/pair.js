//pair.js
const util = require('../../utils/util.js');
const request = require('../../utils/request.js');

var app = getApp()
Page({
    data: {
    	hasData: false,
        pairInfo: {}
    },
    onLoad: function (option) {   
    	let id = option.id;    
        wx.showLoading({
            title: '加载中...'
        });  

        request({ 
            method: 'GET', 
            url: util.getUrl('/getpair',[{id:id}]) 
        }).then((resp) => {  
            if(resp.code === 0) {
                me.setData({
                    pairInfo: resp.data
                });
            }                         
        });            
        
    }
})
