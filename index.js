const sha1 = require('./lib/sha1');
const api = require('./lib/api');
const service = require('./lib/service');
const express = require('express');

const app = express();
const port = process.env.PORT || 80;

const handleRequest = async (res) => {
  const loginData = await api.login('plbsam', 'ssakoo');
  const summary = await api.getSummary(loginData);
  const outputPriority = await api.getSetting(loginData, 'bse_output_source_priority');
  const nextValue = service.getNewOutputPrioritySetting(summary['Battery Voltage'], summary['Timestamp'], outputPriority.val);
  if (nextValue) {
    await api.updateSetting(loginData, 'bse_output_source_priority', nextValue);
    res.send(`Output priority updated to ${service.valueMap[nextValue]} based on ${JSON.stringify({ ...summary, outputPriority: outputPriority?.val })} `);
  }
  res.send(`no change required based on ${JSON.stringify({ ...summary, outputPriority: outputPriority?.val })}`);
}

app.get('/', async (req, res) => {
  try {
    await handleRequest(res);
  } catch (e) {
    try {
      await new Promise(r => setTimeout(r, 60000));
      console.log('first request sequence failed. Retrying...');
      await handleRequest(res);
    } catch (e) {
      try {
        await new Promise(r => setTimeout(r, 60000));
        console.log('second request sequence failed. Retrying...');
        await handleRequest(res);
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
