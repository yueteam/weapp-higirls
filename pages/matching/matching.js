const util = require('../../utils/util.js');
const request = require('../../utils/request.js');
var app = getApp()

Page({
    data: {
        status: 'matching',
        hasDate: false,
        dateInfo: {},
        matchEnd: false,
        matchList: [],
        matchIndex: 0,
        preIndex: 0,
        rotateOut: false,
        rotateCls: '',
        succeedList: []
    },
    onLoad: function () {
        wx.setNavigationBarTitle({
            title: '匹配'
        });

        request({ 
            method: 'GET', 
            url: util.getUrl('/getdate',[{userId:app.globalData.userInfo._id}]) 
        }).then((resp) => {
            if(resp.code === 0) {           
                this.setData({
                    hasDate: true,
                    dateInfo: resp.data
                });
                this.requestMatch();
            } else if(resp.code === 2) {  
                this.setData({
                    status: 'succeed',
                    succeedList: resp.data
                });
            } else {
                this.setData({
                    status: 'nodate'
                });
            }              
        });
    },
    requestTime: 0,
    requestMatch() {
        let me = this; 
        let params = {
            id: this.data.dateInfo._id,
            gender: this.data.dateInfo.gender,
            filmId: this.data.dateInfo.filmId,
            cityId: this.data.dateInfo.cityId,
            day: this.data.dateInfo.day,
            time: this.data.dateInfo.time,
            districtId: this.data.dateInfo.districtId,
            cinemaId: this.data.dateInfo.cinemaId
        };

        request({ 
            method: 'GET', 
            url: util.getUrl('/match',[params]) 
        }).then((resp) => {
            if(resp.code === 0) {
                me.setData({
                    status: 'matched',
                    matchEnd: false,
                    matchList: resp.data
                });
            } else {
                me.requestTime += 1;
                if(me.requestTime < 6) {
                    setTimeout(function() {
                        me.requestMatch();
                    },12000);
                } else {
                    me.setData({
                        status: 'unmatched'
                    });
                }
            }              
        });
    },
    // 防止重复点击
    decideClick: false,
    decide(e) {
        let me = this;
        let matchIndex = this.data.matchIndex;
        let act = e.target.dataset.act,
            rotateCls = act==='yes'?'rotate-out-right':'rotate-out-left';

        if(this.decideClick) {
            return false;
        }
        this.decideClick = true;

        let dateId = this.data.dateInfo._id;
        let matchId = this.data.matchList[matchIndex]._id;       
        if(matchIndex < this.data.matchList.length-1) {
            let nextMatchIndex = matchIndex + 1;
            this.setData({
                matchIndex: nextMatchIndex,
                rotateCls: rotateCls
            });
        } else {
            this.setData({
                matchEnd: true,
                rotateCls: rotateCls
            });
        }

        var nextMatchTimer = setTimeout(function(){
            if(me.data.matchEnd) {
                me.setData({
                    status: 'matching',
                    matchList: [],
                    matchIndex: 0,
                    preIndex: 0,
                    rotateCls: ''
                });
                me.requestTime = 0;
                me.requestMatch();
            } else {
                me.setData({
                    rotateCls: '',
                    preIndex: me.data.matchIndex
                });
            }
            me.decideClick = false;
        },700); 

        request({ 
            method: 'GET', 
            url: util.getUrl('/updatedate',[{dateId:dateId, matchId:matchId, act:act}]) 
        }).then((resp) => {  
            if(resp.code === 2) {
                clearTimeout(nextMatchTimer);
                me.setData({
                    status: 'succeed',
                    succeedList: resp.data
                });
            }                         
        });
    },
    closeLayer(){
        this.setData({
            ticketPanel: false
        });
    },

    goOn() {
        this.setData({
            status: 'matching'
        });
        this.requestTime = 0;
        this.requestMatch();
    },
    goDetail(e){
        let id = e.target.dataset.id;

        wx.navigateTo({
            url: '../pair/pair?id='+id
        })
    },
    goUserPage(e){
        let userId = e.target.dataset.uid;

        wx.navigateTo({
            url: '../user/user?id='+userId
        })
    }
})
