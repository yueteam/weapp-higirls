//index.js
const config = require('../../conf.js');
const util = require('../../utils/util.js');
const request = require('../../utils/request.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        status: 'nowplaying',
        cityInfo: {
            name: '选城市'
        },
        whenList: [['今天','明天','后天'],['上午','下午','晚上']],
        filmList: [],
        districtList: [],
        cinemaList: [],
        filmInfo: {},
        day: '',
        time: '',
        timeStr: '',
        districtId: 'all',
        districtName: '不限',
        cinemaInfo: {
            id: '',
            name: '不限',
            address: ''
        },
        isSubmit: false
    },
    onLoad: function () {
        wx.setNavigationBarTitle({
            title: '约吗？'
        })
        this.initPage();

        let localUserInfo = wx.getStorageSync('userInfo');
        if (localUserInfo) {
            console.log(localUserInfo);
            app.globalData.userInfo = localUserInfo;
        } else {
            // 获取用户信息
            wx.getUserInfo({
                success: res => {               
                    app.globalData.userInfo = res.userInfo;
                    this.checkUser();

                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    if (this.userInfoReadyCallback) {
                        this.userInfoReadyCallback(res)
                    }
                    console.log('firstlogin',app.globalData.userInfo);
                }
            })
        }
    },
    addUser() {
        request({ 
            method: 'GET', 
            url: util.getUrl('/adduser',[app.globalData.userInfo]) 
        }).then((resp) => {
            if(resp.code == 1) {
                app.globalData.userInfo = resp.data;
            }

            // 用户信息缓存在本地
            wx.setStorageSync('userInfo', app.globalData.userInfo);
        });
    },
    checkUser() {
        // 登录
        wx.login({
            success: res => {
                console.log(res.code);
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                request({ 
                    method: 'GET', 
                    url: util.getUrl('/getopenid',[{code: res.code}]) 
                }).then((resp) => {
                    if (resp.code === 0) {
                        // console.log('openid:'+resp.data);
                        app.globalData.userInfo.openId = resp.data;
                        this.addUser();
                    }
                });
            }
        });
    },
    //事件处理函数
    switchCity: function() {
        wx.navigateTo({
            url: '../city/city'
        })
    },
    getDateStr(day) {
        let now = new Date(),
            month = now.getMonth()+1,
            date = now.getDate(),
            today = month + '-' + date;

        if(day) {
            now.setDate(date + day);
            let month1 = now.getMonth()+1,
                day1 = now.getDate();

            return month1 + '-' + day1;
        }
        return today;
    },
    initPage() {        
        let today = this.getDateStr(), // 今天
            tomorrow = this.getDateStr(1), // 明天
            afterTomorrow = this.getDateStr(2), // 后天
            col1Arr = ['今天 '+today,'明天 '+tomorrow,'后天 '+afterTomorrow],
            now = new Date(),
            hour = now.getHours(),
            col2Arr = ['上午','下午','晚上'];
        if(hour >= 11 && hour < 17) {
            col2Arr = ['下午','晚上'];
        } else if(hour >= 17) {
            col2Arr = ['晚上'];
        }

        this.setData({
            whenList: [col1Arr,col2Arr]
        });

        this.fetchFilms();
    },
    fetchFilms() {
        var cityInfo = wx.getStorageSync('cityInfo'),
            filmList = wx.getStorageSync('filmList'),
            districtList = wx.getStorageSync('districtList'),
            updateInfo = wx.getStorageSync('updateInfo');

        if(cityInfo) {
            this.setData({
                cityInfo: cityInfo
            });
        }
        let today = this.getDateStr();
        if(filmList && districtList && updateInfo && updateInfo.cityId == cityInfo.id && updateInfo.updateTime === today) {
            this.setData({
                filmList: filmList,
                districtList: districtList
            });

            return false;
        }

        wx.showLoading({
            title: '加载中...'
        });

        request({ 
            method: 'GET', 
            url: util.getUrl('/nowplaying',[{city: cityInfo?cityInfo.uid:''}]) 
        }).then((resp) => {
            wx.hideLoading();
            if (resp.code === 0) {   
                if (cityInfo) {
                    this.setData({
                        filmList: resp.data.filmList,
                        districtList: resp.data.districtList
                    });
                } else {
                    this.setData({
                        cityInfo: resp.data.cityInfo,
                        filmList: resp.data.filmList,
                        districtList: resp.data.districtList
                    });
                }

                let stUpdateInfo = {
                    cityId: this.data.cityInfo.id,
                    updateTime: this.getDateStr()
                }
                wx.setStorageSync('filmList', resp.data.filmList);
                wx.setStorageSync('districtList', resp.data.districtList);
                wx.setStorageSync('updateInfo', stUpdateInfo);
            }
            
        });
    },
    yue(e) {
        if(!app.globalData.userInfo.birthday) {
            wx.redirectTo({
                url: '../settings/settings'
            });

            return false;
        }

        let filmInfo = e.target.dataset.filminfo;
        
        this.setData({
            status: 'editing',
            filmInfo: filmInfo
        });
    },
    bindTimeChange(e) {
        let v = e.detail.value,
            whenList = this.data.whenList,
            day = whenList[0][v[0]].substring(3),
            time = whenList[1][v[1]],
            timeStr = whenList[0][v[0]].substr(0,2) + ' ' + time;

        if(day === this.data.day && time === this.data.time) {
            return false;
        }  

        this.setData({
            day: day,
            time: time,
            timeStr: timeStr
        });
    },
    bindTimeColChange(e) {
        let col1Arr = this.data.whenList[0],
            col2Arr = ['上午','下午','晚上'];
        if(e.detail.column === 0) {
            if(e.detail.value === 0) {
                let now = new Date(),
                    hour = now.getHours();
                if(hour >= 11 && hour < 17) {
                    col2Arr = ['下午','晚上'];
                } else if(hour >= 17) {
                    col2Arr = ['晚上'];
                }
            }
            this.setData({
                whenList: [col1Arr,col2Arr]
            });
        } 
    },
    bindDistrictChange(e) {
        let index = e.detail.value;
        let districtId = this.data.districtList[index].id,
            districtName = this.data.districtList[index].name;

        if(districtId === this.data.districtId) {
            return false;
        }

        this.setData({
            districtId: districtId,
            districtName: districtName==='全部'?'不限':districtName,
            cinemaInfo: {
                id: '',
                name: '不限',
                address: ''
            }
        });
        request({ 
            method: 'GET', 
            url: util.getUrl('/getcinemas',[{cityId: this.data.cityInfo.id, districtId: districtId}]) 
        }).then((resp) => {
            if (resp.code === 0) {         
                this.setData({
                    cinemaList: resp.data
                });
            }
            
        });
    },
    bindCinemaChange(e) {
        let index = e.detail.value;
        let cinemaId = this.data.cinemaList[index].id,
            cinemaName = this.data.cinemaList[index].name,
            cinemaAddress = this.data.cinemaList[index].address;

        this.setData({
            cinemaInfo: {
                id: cinemaId,
                name: cinemaName,
                address: cinemaAddress
            }
        });
    },
    submit(e) {
        if(this.data.day === '') {
            wx.showToast({
                title: '请选择时间',
                image: '../../images/warn.png',
                duration: 1000
            });
            return false;
        }

        this.setData({
            isSubmit: true
        });
        request({ 
            method: 'POST', 
            url: util.getUrl('/pubdate'),
            data: {
                userId: app.globalData.userInfo._id,
                nickName: app.globalData.userInfo.nickName,
                gender: app.globalData.userInfo.gender,
                avatarUrl: app.globalData.userInfo.avatarUrl,
                age: app.globalData.userInfo.age,
                constellation: app.globalData.userInfo.constellation,
                business: app.globalData.userInfo.business,
                company: app.globalData.userInfo.company,
                profession: app.globalData.userInfo.profession,
                filmId: this.data.filmInfo.id,
                filmName: this.data.filmInfo.title,
                cityId: this.data.cityInfo.id,
                cityName: this.data.cityInfo.name,
                day: this.data.day,
                time: this.data.time,
                districtId: this.data.districtId,
                districtName: this.data.districtName,
                cinemaId: this.data.cinemaInfo.id,
                cinemaName: this.data.cinemaInfo.name,
                cinemaAddress: this.data.cinemaInfo.address,
                words: e.detail.value.textarea
            },
            header: {
                'content-type': 'application/json'
            }
        }).then((resp) => {
            if (resp.code === 0) {       
                wx.showToast({
                    title: '发布成功',
                    icon: 'success',
                    duration: 1500,
                    complete: function() {
                        wx.reLaunch({
                            url: '../matching/matching'
                        })
                    }
                })
            }            
        });
    }
})
