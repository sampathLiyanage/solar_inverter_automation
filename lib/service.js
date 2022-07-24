const SBU_VAL = 12338;
const SUB_VAL = 12337;

valueMap = {};
valueMap[SBU_VAL] = 'SBU';
valueMap[SUB_VAL] = 'SUB';

const getNewOutputPrioritySetting = (batteryVoltage, timestamp, currentBatterySetting) => {
    const currentTime = timestamp.substring(11,24);
    if (currentTime > '16:00:00' && currentTime < '22:00:00' && batteryVoltage < '52.0' && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if ((currentTime < '16:00:00' || currentTime > '22:00:00') && currentBatterySetting !== 'SBU') {
        return SBU_VAL;
    }
    return false;
}

module.exports = {
    valueMap,
    getNewOutputPrioritySetting
}