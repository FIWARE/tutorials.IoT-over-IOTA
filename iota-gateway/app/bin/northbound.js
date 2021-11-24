#!/usr/bin/env node

const debug = require('debug')('gateway:northbound');

/*global MQTT_CLIENT*/
const DEVICE_PAYLOAD = process.env.DUMMY_DEVICES_PAYLOAD || 'ultralight';

function getJSONCommand(string) {
    const obj = JSON.parse(string);
    return Object.keys(obj)[0];
}

function getResult(cmd, status) {
    const result = {};
    result[cmd] = status;
    return JSON.stringify(result);
}

function errorReceived(apiKey, deviceId, state) {
    if (DEVICE_PAYLOAD === 'ultralight') {
        const keyValuePairs = state.split('|') || [''];
        const errorState = keyValuePairs[0] + '| ERROR';
        forwardAsMQTT(apiKey, deviceId, errorState, 'cmdexe');
    } else {
        const command = getJSONCommand(state);
        const errorState = getResult(command, 'ERROR');
        forwardAsMQTT(apiKey, deviceId, errorState, 'cmdexe');
    }
}

function commandResponseReceived(messageData) {
    const payload = Buffer.from(messageData.message.payload.data, 'hex').toString('utf8');
    debug('Command response received from Tangle:', payload);
    const data = unmarshall(payload);
    forwardAsMQTT(data.k, data.i, data.d, 'cmdexe');
}

function unmarshall(payload) {
    const parts = payload.split('&');
    const obj = {};
    parts.forEach((elem) => {
        const keyValues = elem.split('=');
        obj[keyValues[0]] = keyValues[1];
    });
    return obj;
}

function measureReceived(messageData) {
    const payload = Buffer.from(messageData.message.payload.data, 'hex').toString('utf8');
    debug('Measure received from Tangle:', payload);
    const data = unmarshall(payload);
    forwardAsMQTT(data.k, data.i, data.d, 'attrs');
}

// measures sent over MQTT are posted as topics
function forwardAsMQTT(apiKey, deviceId, state, topic) {
    const mqttTopic = '/' + apiKey + '/' + deviceId + '/' + topic;
    debug('Sent to MQTT topic ' + mqttTopic);
    MQTT_CLIENT.publish(mqttTopic, state);
}

exports.commandResponse = commandResponseReceived;
exports.commandError = errorReceived;
exports.measure = measureReceived;
