'use strict'

const WechatCrypt = require('./WechatCrypt')
const Axios = require('axios')

class Welogin {

  constructor (appId, appSecret) {
    this.appId = appId
    this.appSecret = appSecret
  }

  getUserInfo (code, encryptedData, iv) {
    return new Promise(async (resolve, reject) => {
      try {
        const { session_key } = await this.loginUser(code)
        const pc = new WechatCrypt(this.appId, session_key)
        const userData = await pc.decryptData(encryptedData, iv)
        resolve(userData)
      } catch (error) {
        reject(error)
      }
    })
  }

  loginUser (code) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!code) throw Error('no code provided')
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`
        const res = await Axios.get(url)
        const { errcode, errmsg, ...loginData } = res.data
        // <Int> errorcode === 0 means success
        if (errcode) throw Error(errmsg)
        resolve(loginData)
      } catch (error) {
        reject(error)
      }
    })
  }

}

module.exports = Welogin