const SBU_VAL = 12338;
const SUB_VAL = 12337;

valueMap = {};
valueMap[SBU_VAL] = 'SBU';
valueMap[SUB_VAL] = 'SUB';

const getNewOutputPrioritySetting = (batteryVoltage, chargeSum, dischargeSum, timestamp, currentBatterySetting, threshold1 = 50, threshold2 = 25, multiplier = 1) => {
    const currentTime = timestamp.substring(11, 24);
    if (batteryVoltage < '50.5' && currentBatterySetting === valueMap[SBU_VAL]) {
        return SUB_VAL;
    } else if (currentTime > '15:00:00' && currentTime < '18:00:00' && ((+chargeSum) - (+dischargeSum)) * 0.1 * multiplier < threshold1 && currentBatterySetting === valueMap[SBU_VAL]) {
        return SUB_VAL;
    } else if (currentTime > '15:00:00' && currentTime < '18:00:00' && ((+chargeSum) - (+dischargeSum)) * 0.1 * multiplier > threshold1 && currentBatterySetting === valueMap[SUB_VAL]) {
        return SBU_VAL;
    } else if (currentTime > '18:00:00' && currentTime < '22:00:00' && ((+chargeSum) - (+dischargeSum)) * 0.1 * multiplier < threshold2 && currentBatterySetting === valueMap[SBU_VAL]) {
        return SUB_VAL;
    } else if (currentTime > '18:00:00' && currentTime < '22:00:00' && ((+chargeSum) - (+dischargeSum)) * 0.1 * multiplier > threshold2 && currentBatterySetting === valueMap[SUB_VAL]) {
        return SBU_VAL;
    } else if ((currentTime > '22:00:00' || currentTime < '15:00:00') && currentBatterySetting === valueMap[SUB_VAL] && batteryVoltage > '50.7') {
        return SBU_VAL;
    }
    return false;
}

module.exports = {
    valueMap,
    getNewOutputPrioritySetting
}
