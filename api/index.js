const sha1 = require('./lib/sha1');
const api = require('./lib/api');
const service = require('./lib/service');
const express = require('express');

const app = express();
const port = process.env.PORT || 80;

app.get('/', async (req, res) => {
  try {
    const loginData = await api.login('plbsam', 'ssakoo');
    const summary = await api.getSummary(loginData);
    const outputPriority = await api.getSetting(loginData, 'bse_output_source_priority');
    const nextValue = service.getNewOutputPrioritySetting(summary['Battery Voltage'], summary['Timestamp'], outputPriority.val);
    if (nextValue) {
      await api.updateSetting(loginData, 'bse_output_source_priority', nextValue);
      res.send(`value updated to ${service.valueMap[nextValue]} based on ${JSON.stringify(summary)} `);
    }
    res.send('no change required');
  } catch (e) {
    res.send(e.toString());
  }
})

module.exports = app;