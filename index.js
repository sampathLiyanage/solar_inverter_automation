const api = require('./lib/api');
const service = require('./lib/service');
const express = require('express');

const app = express();
const port = process.env.PORT || 80;

const handleRequest = async (req, res) => {
  const threshold1 = req.query.threshold1 ?? 50;
  const threshold2 = req.query.threshold2 ?? 25;
  const multiplier = req.query.multiplier ?? 1;
  const loginData = await api.login('plbsam', 'ssakoo');
  const fromTime = '06:00:00';
  const summary = await api.getSummary(loginData);
  const outputPriority = await api.getSetting(loginData, 'bse_output_source_priority');
  const chargeCurrentSum = await api.getChartDataUptoNowForToday(loginData, 'bt_battery_charging_current', fromTime);
  const dischargeCurrentSum = await api.getChartDataUptoNowForToday(loginData, 'bt_battery_discharge_current', fromTime);
  const nextValue = service.getNewOutputPrioritySettingBasedOnChargeDischargeData(
    summary['AC Output Active Power'],
    summary['Battery Voltage'],
    chargeCurrentSum,
    dischargeCurrentSum,
    summary['Timestamp'],
    outputPriority.val,
    threshold1,
    threshold2,
    multiplier
  );
  if (nextValue) {
    await api.updateSetting(loginData, 'bse_output_source_priority', nextValue);
    res.send({
      currentStatus: { ...summary, chargedAmpHours: chargeCurrentSum * 0.1 * multiplier, dischargedAmpHours: dischargeCurrentSum * 0.1 * multiplier, outputPriority: outputPriority?.val },
      nextChargePriority: service.valueMap[nextValue],
      message: `Output priority updated to ${service.valueMap[nextValue]}`
    });
  }
  res.send({
    currentStatus: { ...summary, chargedAmpHours: chargeCurrentSum * 0.1 * multiplier, dischargedAmpHours: dischargeCurrentSum * 0.1 * multiplier, outputPriority: outputPriority?.val },
    nextChargePriority: outputPriority?.val,
    message: `No change required`
  });
}

app.get('/', async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (e) {
    try {
      await new Promise(r => setTimeout(r, 60000));
      console.log('first request sequence failed. Retrying...');
      await handleRequest(req, res);
    } catch (e) {
      try {
        await new Promise(r => setTimeout(r, 60000));
        console.log('second request sequence failed. Retrying...');
        await handleRequest(req, res);
      } catch (e) {
        console.log('Request sequence failed. Giving up...');
        res.send(e.toString());
      }
    }
  }
})

app.listen(port, () => {
  console.log(`Server running at port ` + port);
});
