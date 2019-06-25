'use strict'

const WechatCrypt = require('./WechatCrypt')
const Axios = require('axios')

class Welogin {

  constructor (appId, appSecret) {
    this.appId = appId
    this.appSecret = appSecret
  }

  async getUserInfo (code, encryptedData, iv) {
    const { session_key } = await this.loginUser(code)
    const pc = new WechatCrypt(this.appId, session_key)
    const userData = await pc.decryptData(encryptedData, iv)
    return userData
  }

  async loginUser (code) {
    if (!code) throw Error('no code provided')
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`
    const res = await Axios.get(url)
    const { errcode, errmsg, ...loginData } = res.data
    // <Int> errorcode === 0 means success
    if (errcode) throw Error(errmsg)
    return loginData
  }

}

module.exports = Welogin