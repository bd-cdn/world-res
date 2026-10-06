if (window.H5API === undefined) {
  // 避免重复引用加载
  // 原创平台页游API
  window.H5API = {
    /**
     * 提供一个多次postMessage的方法，用于可能的有多个iframe时API接口不在最顶层
     *
     * @param {String} eventType message事件
     * @param {Object} data 数据
     */
    postMessage: function (eventType, data) {
      var target = window;
      if (target === null || target.parent === null) {
        console.error('window对象不存在或者出错');
        return;
      }
      for (var i = 0; i < 5 && target !== target.parent; i++) {
        try {
          target = target.parent;
          target.postMessage(
            {
              eventType: eventType,
              data: data
            },
            '*'
          );
        } catch (e) {
          // 可能因为跨域等问题报错，直接跳到下个循环
        }
      }
    },

    /**
     * 打开支付
     *
     * @param {Int} money 充值金额（人民币：元） 只能为整数
     * @param {String} mark 游戏的充值订单编号 最多64位
     * @param {String} server 服务器编号 不能为空或者0
     * @param {String} extra 透传参数，用于充值成功后的服务端回调地址
     */
    openPay: function (money, mark, server, extra) {
      this.postMessage('openPay', {
        // 充值金额（人民币：元） 只能为整数
        money: money,
        // 游戏的充值订单编号 最多64位
        mark: mark,
        // 服务器编号 不能为空或者0
        server: server,
        // 透传参数，用于充值成功后的服务端回调地址
        extra: extra
      });
    },

    /**
     * 退出登录，清除当前用户信息，并展示登录窗口
     */
    logout: function () {
      this.postMessage('logout');
    },

    /**
     * 游戏分享
     *
     * @param {String} extra 透传参数，附带在被邀请者的登录地址
     */
    shareGame: function (extra) {
      this.postMessage('shareGame', {
        extra: extra
      });
    },

    /**
     * 获得用户头像地址，高宽为120*120像素
     *
     * @param {String} uid 用户编号
     * @param {String} size 头像大小
     * @return 用户头像地址
     */
    getUserAvatar: function (uid, size) {
      var nowDate = new Date();
      var nowFullYear = nowDate.getFullYear();
      var nowMonth = nowDate.getMonth() + 1;
      var nowDay = nowDate.getDate();
      var nowHours = nowDate.getHours() < 12 ? 1 : 2;
      var timestamp =
        String(nowFullYear) +
        String(nowMonth) +
        String(nowDay) +
        String(nowHours);
      return (
        'https://a.3304399.net/' +
        uid +
        '/' +
        (size || 'middle') +
        '?' +
        timestamp
      );
    },

    /**
     * 获得用户小头像地址，高宽为48*48像素（small 不再使用，统一调整为 middle）
     */
    getUserSmallAvatar: function (uid) {
      return this.getUserAvatar(uid, 'middle');
    },

    /**
     * 获得用户大头像地址，高宽为200*200像素
     */
    getUserBigAvatar: function (uid) {
      return this.getUserAvatar(uid, 'big');
    },

    /**
     * 获得用户超大头像地址，高宽为360*360像素
     */
    getUserLargeAvatar: function (uid) {
      return this.getUserAvatar(uid, 'large');
    },

    /**
     * 是否可以播放广告
     *
     * @param callback 回调函数
     */
    canPlayAd: function (callback) {
      return this.callPlayAd(callback);
    },

    /**
     * 是否可以播放广告
     *
     * @param callback 回调函数
     */
    callPlayAd: function (callback) {
      this.postMessage('canPlayAd');
      if (typeof callback === 'function') {
        this._callPlayAdCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },

    /**
     * 是否可播放广告内部回调
     */
    _callPlayAdCallback: null,

    /**
     * 播放广告
     *
     * @param callback 回调函数
     */
    playAd: function (callback) {
      this.postMessage('playAd');
      if (typeof callback === 'function') {
        this._playAdCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },

    /**
     * 广告播放状态内部回调
     */
    _playAdCallback: null,

    /**
     * 关闭APP页面（暂只支持4399在线玩及游戏盒）
     */
    closeApp: function () {
      this.postMessage('closeApp');
    },

    /**
     * 设置bar后退按钮
     * @param bool 是否是关闭操作
     */
    setBackBar: function (bool) {
      this.postMessage('backTitleBar', {
        close: bool
      });
    },

    /**
     * 特殊游戏分享
     *
     * @param {String} title 标题
     * @param {String} content 内容
     * @param {String} icon 图标
     * @param {String} extra 扩展参数
     * @param {String} urlId 地址编号
     */
    specialShare: function (title, content, icon, extra, urlId) {
      this.postMessage('specialShare', {
        title: title,
        content: content,
        icon: icon,
        extra: extra,
        urlId: urlId
      });
    },

    /**
     * 设置游戏分享内容
     *
     * @param {String} title 标题
     * @param {String} content 内容
     * @param {String} icon 图标
     * @param {String} extra 扩展参数
     * @param {String} urlId 地址编号
     */
    setShare: function (title, content, icon, extra, urlId) {
      this.postMessage('setShare', {
        title: title,
        content: content,
        icon: icon,
        extra: extra,
        urlId: urlId
      });
    },

    /**
     * 是否为APP环境下的原生接口
     * @return bool true为当前支持使用4399游戏盒原生接口
     */
    is4399APP: function () {
      return (
        navigator.userAgent.indexOf('4399GameCenter') > -1 &&
        navigator.userAgent.indexOf('minigame') > -1
      );
    },

    /**
     * 分享回调
     */
    _appShareCallback: null,
    /**
     * APP内实时分享，例如游戏盒好友实时收到邀请消息
     *
     * @param {String} extra 扩展参数
     * @param {String} title 标题(可选，默认为游戏名称)
     * @param {String} content 内容(可选，默认为运营配置的游戏推荐语)
     * @param {String} icon 图标(可选, 默认为游戏图标)
     */
    appShare: function (extra, title, content, icon, callback) {
      this.postMessage('appShare', {
        extra: extra,
        title: title,
        content: content,
        icon: icon
      });
      if (callback !== null && typeof callback === 'function') {
        this._appShareCallback = callback;
      }
    },

    /**
     * APP内打开对应用户的个人主页
     *
     * @param {String} uid
     */
    openUserCenter: function (uid) {
      this.postMessage('openUserCenter', {
        uid: uid
      });
    },

    /**
     * 获取用户扩展信息回调
     */
    _getUserExtendCallback: null,

    /**
     * 获取用户扩展信息
     *
     * @param callback 回调函数
     */
    getUserExtend: function (callback) {
      this.postMessage('getUserExtend');
      if (typeof callback === 'function') {
        this._getUserExtendCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },

    /**
     * 是否支持游戏跳转回调函数
     */
    _canGameJumpCallback: null,

    /**
     * 是否支持游戏跳转
     */
    canGameJump: function (callback) {
      this.postMessage('canGameJump');
      if (typeof callback === 'function') {
        this._canGameJumpCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },

    /**
     * 游戏跳转
     */
    gameJump: function (gameID) {
      this.postMessage('gameJump', {
        game_id: gameID
      });
    },

    /**
     * 角色登录
     *
     * @param {String} server 服务器编号，默认为0
     * @param {String} roleId 角色id，默认为0
     * @param {int} isNew 是否当前新创建角色，否为0，是为1
     * @param {String} roleName 角色名，默认为''
     * @param {String} level 等级，默认为1
     * @param {int} isVip 是否是VIP，否为0，是为1
     */
    roleLogin: function (server, roleId, isNew, roleName, level, isVip) {
      this.postMessage('roleLogin', {
        server: server,
        roleId: roleId,
        isNew: isNew,
        roleName: roleName,
        level: level,
        isVip: isVip
      });
    },

    /**
     * 检查敏感词回调
     */
    _checkWordCallback: null,

    /**
     * 检查敏感词
     *
     * @param {*} callback
     */
    checkWord: function (word, callback) {
      this.postMessage('checkWord', word);
      if (typeof callback === 'function') {
        this._checkWordCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },

    /**
     * 实名认证状态回调
     */
    _verifyStateCallback: null,

    /**
     * 实名认证状态
     * @param {*} callback
     */
    verifyState: function (callback) {
      this.postMessage('verifyState');
      if (typeof callback === 'function') {
        this._verifyStateCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },

    /**
     * 打开实名认证弹窗回调
     */
    _openVerifyCallback: null,

    /**
     * 打开实名认证弹窗
     * @param {*} callback
     * @param {*} tip
     */
    openVerify: function (callback, tip) {
      this.postMessage('openVerify', tip);
      if (typeof callback === 'function') {
        this._openVerifyCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },

    /**
     * 显示引导下载面板回调
     */
    _showGuideCallback: null,
    /**
     * 显示引导下载面板
     *
     * @param {*} callback
     */
    showGuide: function (callback, index) {
      this.postMessage('showGuide', index);
      if (typeof callback === 'function') {
        this._showGuideCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },
    /**
     * 处理游戏盒跳转详情
     * @param {*} obj
     */
    skipGameDetail: function () {
      this.postMessage('gotoGameDetail');
    },

    /**
     * 刷新SDK
     */
    reloadSDK: function () {
      this.postMessage('reloadSDK');
    },

    /**
     * 是否已绑定手机
     * @param {*} callback
     */
    isBindingPhone: function (callback) {
      this.postMessage('isBindingPhone');
      if (typeof callback === 'function') {
        this._isBindingPhoneCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },
    /**
     * 是否已绑定手机状态内部回调
     */
    _isBindingPhoneCallback: null,

    /**
     * 绑定手机
     * @param {*} callback
     */
    bindingPhone: function (callback) {
      this.postMessage('bindingPhone');
      if (typeof callback === 'function') {
        this._bindingPhoneCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },
    /**
     * 绑定手机状态内部回调
     */
    _bindingPhoneCallback: null,

    /**
     * 检查绑定手机
     * @param {*} callback
     */
    checkBindingPhone: function (callback) {
      this.postMessage('checkBindingPhone');
      if (typeof callback === 'function') {
        this._checkBindingPhoneCallback = callback;
      } else {
        console.warn('错误的回调函数');
      }
    },
    /**
     * 检查绑定手机状态内部回调
     */
    _checkBindingPhoneCallback: null,
    /**
     * 刷新游戏
     */
    reloadGame: function () {
      this.postMessage('reloadGame');
    }
  };
  // 广告等状态监听
  window.addEventListener('message', function (e) {
    switch (e.data.eventType) {
      case '_canPlayAd':
        if (window.H5API._callPlayAdCallback !== null) {
          window.H5API._callPlayAdCallback(e.data);
        }
        break;
      case '_playAd':
        if (window.H5API._playAdCallback !== null) {
          window.H5API._playAdCallback(e.data);
        }
        break;
      case '_getUserExtend':
        if (window.H5API._getUserExtendCallback !== null) {
          window.H5API._getUserExtendCallback(e.data);
        }
        break;
      case '_appShare':
        if (window.H5API._appShareCallback !== null) {
          window.H5API._appShareCallback(e.data);
        }
        break;
      // 是否支持游戏跳转
      case '_canGameJump':
        if (window.H5API._canGameJumpCallback !== null) {
          window.H5API._canGameJumpCallback(e.data);
        }
        break;
      case '_checkWord':
        if (window.H5API._checkWordCallback !== null) {
          window.H5API._checkWordCallback(e.data);
        }
        break;
      case '_verifyState':
        if (window.H5API._verifyStateCallback !== null) {
          window.H5API._verifyStateCallback(e.data);
        }
        break;
      case '_openVerify':
        if (window.H5API._openVerifyCallback !== null) {
          window.H5API._openVerifyCallback(e.data);
        }
        break;
      case '_showGuide':
        if (window.H5API._showGuideCallback !== null) {
          window.H5API._showGuideCallback(e.data);
        }
        break;
      // 是否已绑定手机状态
      case '_isBindingPhone':
        if (window.H5API._isBindingPhoneCallback !== null) {
          window.H5API._isBindingPhoneCallback(e.data);
        }
        break;
      // 绑定手机状态
      case '_bindingPhone':
        if (window.H5API._bindingPhoneCallback !== null) {
          window.H5API._bindingPhoneCallback(e.data);
        }
        break;
      // 检查绑定手机状态
      case '_checkBindingPhone':
        if (window.H5API._checkBindingPhoneCallback !== null) {
          window.H5API._checkBindingPhoneCallback(e.data);
        }
        break;
    }
  });
}
