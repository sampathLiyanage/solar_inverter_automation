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

const callWebservice = async (authData, params) => {
  const salt = (new Date).getTime();
  const token = authData.token;
  const secret = authData.secret;
  const params = {
    sign: sha1("".concat(salt).concat(secret).concat(token, "&").concat(new URLSearchParams(mainParams).toString(1))),
    salt,
    token,
    ...mainParams
  };
  const url = REMOTE_URL + '?' + new URLSearchParams(params);
  return await axios.get(url);
}

const getSetting = async (authData, setting) => {
  const params = {
    action: 'queryDeviceCtrlValue',
    source: 1,
    pn: 'Q01000211428601609',
    sn: '92087200415026',
    devcode: 2391,
    devaddr: 1,
    id: setting,
    i18n: 'en_US'
  };
  const response = await callWebservice(authData, params);
  return response.data.dat;
};

const getCurrentTimeParts = () => {
  const date_string = new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" });
  const date_lk = new Date(date_string);
  const year = date_lk.getFullYear();
  const month = ("0" + (date_lk.getMonth() + 1)).slice(-2);
  const date = ("0" + date_lk.getDate()).slice(-2);
  const hours = ("0" + date_lk.getHours()).slice(-2);
  const minutes = ("0" + date_lk.getMinutes()).slice(-2);
  const seconds = ("0" + date_lk.getSeconds()).slice(-2);
  return { year, month, date, hours, minutes, seconds };
}

const getSummary = async (authData) => {
  const { year, month, date } = getCurrentTimeParts();
  let date_yyyy_mm_dd = year + "-" + month + "-" + date;
  const params = {
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
  const response = await callWebservice(authData, params);
  const values = response.data.dat.row[0]?.field;
  const summary = {};
  response.data.dat.title.forEach((e, i) => summary[e.title] = values[i]);
  return summary;
};

const getChartDataUptoNowForToday = async (authData, chart, fromTime) => {
  const { year, month, date, hours, minutes, seconds } = getCurrentTimeParts();
  let fromDateTime = year + "-" + month + "-" + date + " " + fromTime;
  let toDateTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
  const params = {
    action: 'queryDeviceChartFieldDetailData',
    source: 1,
    pn: 'Q01000211428601609',
    sn: 'Q01000211428601609096A01',
    devcode: 2410,
    devaddr: 1,
    i18n: 'en_US',
    field: chart,
    precision: 5,
    sdate: fromDateTime,
    edate: toDateTime,
  };
  const response = await callWebservice(authData, params);
  const values = response.data.dat;
  if (Array.isArray(values)) {
    return values.reduce((sum, current) => { return sum + (+current.val) }, 0);
  }
  return null;
}

const updateSetting = async (authData, setting, value) => {
  const params = {
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
  await callWebservice(authData, params);
  return true;
};

module.exports = {
  login,
  getSetting,
  getSummary,
  updateSetting,
  getChartDataUptoNowForToday
};