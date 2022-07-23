const axios = require('axios');
const sha1 = require('./sha1');

const REMOTE_URL = 'http://web.shinemonitor.com/public/';

const login = async (username, password) => {
    const passwordSha1 = sha1(password);
    const salt = (new Date).getTime();

    const mainParams = {
        action: "authSource",
        usr: username,
        source: 1,
        "company-key": "bnrl_frRFjEz8Mkn"
    };
    const params = {
        sign: sha1("".concat(salt).concat(passwordSha1, "&").concat(new URLSearchParams(mainParams).toString())),
        salt,
        ...mainParams
    };
    const loginUrl = REMOTE_URL + '?' + new URLSearchParams(params);
    const response = await axios.get(loginUrl);
    return { token: response.data.dat.token, secret: response.data.dat.secret };
};

const getSetting = async (authData, setting) => {
    const salt = (new Date).getTime();
    const token = authData.token;
    const secret = authData.secret;
    const mainParams = {
      action: 'queryDeviceCtrlValue',
      source: 1,
      pn: 'Q01000211428601609',
      sn: '92087200415026',
      devcode: 2391,
      devaddr: 1,
      id: setting,
      i18n: 'en_US'
    };
    const params = {
      sign: sha1("".concat(salt).concat(secret).concat(token, "&").concat(new URLSearchParams(mainParams).toString(1))),
      salt,
      token,
      ...mainParams
    };
    const updateUrl = REMOTE_URL + '?' + new URLSearchParams(params);
    const response = await axios.get(updateUrl);
    return response.data.dat;
};

const getSummary = async (authData) => {
    const salt = (new Date).getTime();
    const token = authData.token;
    const secret = authData.secret;
    let date_string = new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" });
    let date_lk = new Date(date_string);
    let year = date_lk.getFullYear();
    let month = ("0" + (date_lk.getMonth() + 1)).slice(-2);
    let date = ("0" + date_lk.getDate()).slice(-2);
    let date_yyyy_mm_dd = year + "-" + month + "-" + date;
    const mainParams = {
      action: 'queryDeviceDataOneDayPaging',
      source: 1,
      pn: 'Q01000211428601609',
      sn: 'Q01000211428601609096A01',
      devcode: 2410,
      devaddr: 1,
      i18n: 'en_US',
      field: 'bt_battery_voltage',
      precision: 5,
      date: date_yyyy_mm_dd,
      page: 0,
      pagesize: 1
    };
    const params = {
      sign: sha1("".concat(salt).concat(secret).concat(token, "&").concat(new URLSearchParams(mainParams).toString(1))),
      salt,
      token,
      ...mainParams
    };
    const summaryUrl = REMOTE_URL + '?' + new URLSearchParams(params);
    const response = await axios.get(summaryUrl);
    const values = response.data.dat.row[0]?.field;
    const summary = {};
    response.data.dat.title.forEach((e, i) => summary[e.title] = values[i]);
    return summary;
};

const updateSetting = async (authData, setting, value) => {
    const salt = (new Date).getTime();
    const token = authData.token;
    const secret = authData.secret;
    const mainParams = {
      action: 'ctrlDevice',
      source: 1,
      pn: 'Q01000211428601609',
      sn: '92087200415026',
      devcode: 2391,
      devaddr: 1,
      id: setting,
      val: value,
      i18n: 'en_US'
    };
    const params = {
      sign: sha1("".concat(salt).concat(secret).concat(token, "&").concat(new URLSearchParams(mainParams).toString(1))),
      salt,
      token,
      ...mainParams
    };
    const updateUrl = REMOTE_URL + '?' + new URLSearchParams(params);
    await axios.get(updateUrl);
    return true;
};

module.exports = {
    login,
    getSetting,
    getSummary,
    updateSetting
};