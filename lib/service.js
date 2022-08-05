const SBU_VAL = 12338;
const SUB_VAL = 12337;

valueMap = {};
valueMap[SBU_VAL] = 'SBU';
valueMap[SUB_VAL] = 'SUB';

const getNewOutputPrioritySettingBasedOnVoltage = (batteryVoltage, timestamp, currentBatterySetting) => {
    const currentTime = timestamp.substring(11,24);
    if (currentTime > '15:00:00' && currentTime < '19:00:00' && batteryVoltage < '51.9' && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if (currentTime > '15:00:00' && currentTime < '19:00:00' && batteryVoltage > '52.5' && currentBatterySetting === 'SUB') {
        return SBU_VAL;
    } if (currentTime > '19:00:00' && currentTime < '22:00:00' && batteryVoltage < '51.3' && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if (currentTime > '19:00:00' && currentTime < '22:00:00' && batteryVoltage > '51.9' && currentBatterySetting === 'SUB') {
        return SBU_VAL;
    } else if ((currentTime < '15:00:00' || currentTime > '22:00:00') && batteryVoltage < '50.7' && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if ((currentTime < '15:00:00' || currentTime > '22:00:00') && batteryVoltage > '51.3' && currentBatterySetting === 'SUB') {
        return SBU_VAL;
    }
    return false;
}

const getNewOutputPrioritySettingBasedOnChargeDischargeData = (batteryVoltage, chargeSum, dischargeSum, timestamp, currentBatterySetting, threshold1 = 500, threshold2 = 250) => {
    const currentTime = timestamp.substring(11,24);
    if (batteryVoltage < '50.7' && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if (currentTime > '15:00:00' && currentTime < '19:00:00' && ((+chargeSum) - (+dischargeSum)) < threshold1 && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if (currentTime > '15:00:00' && currentTime < '19:00:00' && ((+chargeSum) - (+dischargeSum)) > threshold1 && currentBatterySetting === 'SUB') {
        return SBU_VAL;
    } else if (currentTime > '19:00:00' && currentTime < '22:00:00' && ((+chargeSum) - (+dischargeSum)) < threshold2 && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if (currentTime > '19:00:00' && currentTime < '22:00:00' && ((+chargeSum) - (+dischargeSum)) > threshold2 && currentBatterySetting === 'SUB') {
        return SBU_VAL;
    } else if (currentTime > '22:00:00' && currentBatterySetting === 'SUB' && batteryVoltage > '51.0') {
        return SBU_VAL;
    }
    return false;
}

module.exports = {
    valueMap,
    getNewOutputPrioritySettingBasedOnVoltage,
    getNewOutputPrioritySettingBasedOnChargeDischargeData
}
