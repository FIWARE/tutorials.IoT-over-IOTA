#!/usr/bin/env node

const debug = require('debug')('gateway:northbound');

/*global MQTT_CLIENT*/
const DEVICE_PAYLOAD = process.env.DUMMY_DEVICES_PAYLOAD || 'ultralight';

// Extracts a Command from a JSON Object - used with JSON Payloads only.
function getJSONCommand(string) {
    const obj = JSON.parse(string);
    return Object.keys(obj)[0];
}

// Extracts a Command Result from a JSON Object - used with JSON Payloads only.
function getResult(cmd, status) {
    const result = {};
    result[cmd] = status;
    return JSON.stringify(result);
}

// Error Command error handling for the IoT Agent for JSON and IoT Agent for Ultralight.
// If persistence to the IOTA Tangle is failing for some reason (e.g. timeouts, connection failures)
// Then commands cannot be sent. The Gateway will immediately respond with an MQTT error
// message in JSON or Ultralight format as appropriate.
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

// Switches data between an IOTA Tangle command acknowlegdement payload and an MQTT message.
// The Tangle holds a string in the form i=...&d=...&k=... The
// DeviceId and APIKey must be removed from the payload so that an MQTT message
// holding the data only can be sent to the /APIKey/DeviceId/cmdExe topic.
// 
function commandResponseReceived(messageData) {
    const payload = Buffer.from(messageData.message.payload.data, 'hex').toString('utf8');
    debug('Command response received from Tangle:', payload);
    const data = unmarshall(payload);
    process.nextTick(() => {forwardAsMQTT(data.k, data.i, data.d, 'cmdexe')});
}

// Spilt up the parts of the IOTA Payload for further processing.
// The Tangle holds a string in the form i=...&d=...&k=... similar to the HTTP transport
function unmarshall(payload) {
    const parts = payload.split('&');
    const obj = {};
    parts.forEach((elem) => {
        const keyValues = elem.split('=');
        obj[keyValues[0]] = keyValues[1];
    });
    return obj;
}

// Switches data between an IOTA Tangle measure payload and an MQTT message.
// The Tangle holds a string in the form i=...&d=...&k=... The
// DeviceId and APIKey must be removed from the payload so that an MQTT message
// holding the data only can be sent to the /APIKey/DeviceId/attrs topic.
function measureReceived(messageData) {
    const payload = Buffer.from(messageData.message.payload.data, 'hex').toString('utf8');
    debug('Measure received from Tangle:', payload);
    const data = unmarshall(payload);
    process.nextTick(() => {forwardAsMQTT(data.k, data.i, data.d, 'attrs')});
}

// measures and command acknowledgements are sent northbound over MQTT and posted as topics
function forwardAsMQTT(apiKey, deviceId, state, topic) {
    const mqttTopic = '/' + apiKey + '/' + deviceId + '/' + topic;
    debug('Sent to MQTT topic ' + mqttTopic);
    MQTT_CLIENT.publish(mqttTopic, state);
}

exports.commandResponse = commandResponseReceived;
exports.commandError = errorReceived;
exports.measure = measureReceived;
