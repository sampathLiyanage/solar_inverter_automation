const SBU_VAL = 12338;
const SUB_VAL = 12337;

const valueMap = {};
valueMap[SBU_VAL] = 'SBU';
valueMap[SUB_VAL] = 'SUB';

const DISCHARGE_MULTIPLIER = 0.69;
const DEFAULT_THRESHOLD1 = 50;
const DEFAULT_THRESHOLD2 = 25;

const getNewOutputPrioritySetting = (batteryVoltage, chargeSum, dischargeSum, timestamp, currentBatterySetting, threshold1 = DEFAULT_THRESHOLD1, threshold2 = DEFAULT_THRESHOLD2) => {
    const currentTime = timestamp.substring(11, 24);
    if (batteryVoltage < '49.7' && currentBatterySetting === valueMap[SBU_VAL]) {
        return SUB_VAL;
    } else if (currentTime > '15:00:00' && currentTime < '18:00:00' && ((+chargeSum) - (+dischargeSum * DISCHARGE_MULTIPLIER)) * 0.1 < threshold1 && currentBatterySetting === valueMap[SBU_VAL]) {
        return SUB_VAL;
    } else if (currentTime > '15:00:00' && currentTime < '18:00:00' && ((+chargeSum) - (+dischargeSum * DISCHARGE_MULTIPLIER)) * 0.1  > threshold1 && currentBatterySetting === valueMap[SUB_VAL]) {
        return SBU_VAL;
    } else if (currentTime > '18:00:00' && currentTime < '22:00:00' && ((+chargeSum) - (+dischargeSum * DISCHARGE_MULTIPLIER)) * 0.1  < threshold2 && currentBatterySetting === valueMap[SBU_VAL]) {
        return SUB_VAL;
    } else if (currentTime > '18:00:00' && currentTime < '22:00:00' && ((+chargeSum) - (+dischargeSum * DISCHARGE_MULTIPLIER)) * 0.1  > threshold2 && currentBatterySetting === valueMap[SUB_VAL]) {
        return SBU_VAL;
    } else if ((currentTime > '22:00:00' || currentTime < '15:00:00') && currentBatterySetting === valueMap[SUB_VAL] && batteryVoltage > '50.7') {
        return SBU_VAL;
    }
    return false;
}

module.exports = {
    valueMap,
    getNewOutputPrioritySetting,
    DISCHARGE_MULTIPLIER,
    DEFAULT_THRESHOLD1,
    DEFAULT_THRESHOLD2
}
