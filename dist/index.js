'use strict'

const WechatCrypt = require('./WechatCrypt')
const Axios = require('axios')
const sanitizeHtml = require('sanitize-html')
const emojiStrip = require('emoji-strip')

class Welogin {

    constructor (appId, appSecret) {
		this.appId = appId
  		this.appSecret = appSecret
    }

    getUserInfo (code, encryptedData, iv) {
        return new Promise(async (resolve, reject) => {
            try {
                const authData = await this.loginUser(code)
                const {session_key, openid, unionid} = authData
                const pc = new WechatCrypt(this.appId, session_key)
                try {
                    var userData = await pc.decryptData(encryptedData , iv)
                } catch (err) {
                    return reject(err)
                }
                userData.nickName = emojiStrip(sanitizeHtml(userData.nickName, {
                    allowedTags: [],
                    allowedAttributes: {}
                }).replace(/\s/g, ''))
                delete userData.watermark
                resolve(userData)
            } catch (err) {
                // oops
                console.log(err)
            }
        })
    }

    loginUser (code) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`)
                const {session_key, openid, unionid, errcode, errmsg} = result.data
                if (errcode) {
                    console.log(errcode, errmsg)
                    reject(errmsg)
                } else {
                    resolve({session_key, openid, unionid})
                }
            } catch (err) {
                // throw error
                reject(errmsg)
                // console.log(errcode, errmsg)
            }
        })
    }
    
}

module.exports = Welogin