const sha1 = require('./lib/sha1');
const api = require('./lib/api');
const service = require('./lib/service');
const express = require('express');

const app = express();
const port = process.env.PORT || 80;

const applyChargeDischargeBasedStrategy = async (res) => {
  const loginData = await api.login('plbsam', 'ssakoo');
  const fromTime = '07:00:00';
  const summary = await api.getSummary(loginData);
  const outputPriority = await api.getSetting(loginData, 'bse_output_source_priority');
  const chargeCurrentSum = await api.getChartDataUptoNowForToday(loginData, 'bt_battery_charging_current', fromTime);
  const dischargeCurrentSum = await api.getChartDataUptoNowForToday(loginData, 'bt_battery_discharge_current', fromTime);
  const nextValue = service.getNewOutputPrioritySettingBasedOnChargeDischargeData(
    summary['Battery Voltage'],
    chargeCurrentSum,
    dischargeCurrentSum,
    summary['Timestamp'],
    outputPriority.val
  );
  if (nextValue) {
    await api.updateSetting(loginData, 'bse_output_source_priority', nextValue);
    res.send({
      currentStatus: { ...summary, chargeCurrentSum, dischargeCurrentSum, outputPriority: outputPriority?.val },
      nextChargePriority: service.valueMap[nextValue],
      message: `Output priority updated to ${service.valueMap[nextValue]}`
    });
  }
  res.send({
    currentStatus: { ...summary, chargeCurrentSum, dischargeCurrentSum, outputPriority: outputPriority?.val },
    nextChargePriority: outputPriority?.val,
    message: `No change required`
  });
}

const applyVoltageBasedStrategy = async (res) => {
  const summary = await api.getSummary(loginData);
  const outputPriority = await api.getSetting(loginData, 'bse_output_source_priority');
  const nextValue = service.getNewOutputPrioritySetting(summary['Battery Voltage'], summary['Timestamp'], outputPriority.val);
  if (nextValue) {
    await api.updateSetting(loginData, 'bse_output_source_priority', nextValue);
    res.send({
      currentStatus: { ...summary, outputPriority: outputPriority?.val },
      nextChargePriority: service.valueMap[nextValue],
      message: `Output priority updated to ${service.valueMap[nextValue]}`
    });
  }
  res.send({
    currentStatus: { ...summary, outputPriority: outputPriority?.val },
    nextChargePriority: outputPriority?.val,
    message: `No change required`
  });
}

app.get('/', async (req, res) => {
  try {
    await applyChargeDischargeBasedStrategy(res);
  } catch (e) {
    try {
      await new Promise(r => setTimeout(r, 60000));
      console.log('first request sequence failed. Retrying...');
      await applyChargeDischargeBasedStrategy(res);
    } catch (e) {
      try {
        await new Promise(r => setTimeout(r, 60000));
        console.log('second request sequence failed. Retrying...');
        await applyChargeDischargeBasedStrategy(res);
      } catch (e) {
        console.log('Request sequence failed. Giving up...');
        res.send(e.toString());
      }
    }
  }
})

app.listen(port,() => {
  console.log(`Server running at port `+port);
});
