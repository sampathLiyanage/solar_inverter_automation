const SBU_VAL = 12338;
const SUB_VAL = 12337;

valueMap = {};
valueMap[SBU_VAL] = 'SBU';
valueMap[SUB_VAL] = 'SUB';

const getNewOutputPrioritySetting = (batteryVoltage, timestamp, currentBatterySetting) => {
    const currentTime = timestamp.substring(11,24);
    if (currentTime > '15:00:00' && currentTime < '19:00:00' && batteryVoltage < '52.1' && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if (currentTime > '15:00:00' && currentTime < '19:00:00' && batteryVoltage > '52.9' && currentBatterySetting === 'SUB') {
        return SBU_VAL;
    } if (currentTime > '19:00:00' && currentTime < '22:00:00' && batteryVoltage < '51.7' && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if (currentTime > '19:00:00' && currentTime < '22:00:00' && batteryVoltage > '52.1' && currentBatterySetting === 'SUB') {
        return SBU_VAL;
    } else if ((currentTime < '15:00:00' || currentTime > '22:00:00') && batteryVoltage < '50.7' && currentBatterySetting === 'SBU') {
        return SUB_VAL;
    } else if ((currentTime < '15:00:00' || currentTime > '22:00:00') && batteryVoltage > '51.7' && currentBatterySetting === 'SUB') {
        return SBU_VAL;
    }
    return false;
}

module.exports = {
    valueMap,
    getNewOutputPrioritySetting
}
