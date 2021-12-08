#!/usr/bin/env node

const debug = require('debug')('gateway:southbound');

/*global IOTA_CLIENT*/
const IOTA_TOPIC = process.env.IOTA_MESSAGE_INDEX || 'fiware';
const Northbound = require('./northbound');

// Switches data between an MQTT command payload and an IOTA Tangle message.
// MQTT places the APIKey and DeviceId in the topic path, so these must be extracted
// and forwarded to the Tangle as a string in the form i=...&d=...&k=... 
// 
function commandReceived(topic, message) {
    const parts = topic.toString().split('/');
    const apiKey = parts[1];
    const deviceId = parts[2];
    const action = parts[3];
    debug('Command received from MQTT', message.toString());
    process.nextTick(() => {forwardAsIOTATangle(apiKey, deviceId, message.toString(), action)});
}

// Commands are sent southbound in the form of IOTA messages.
// An IOTA message is the encapsulating data structure that is being actually broadcasted
// across the network. It is an atomic unit that is accepted/rejected as a whole.
// Queuing ensures that responses are not lost.
//
// see https://wiki.iota.org/iota.rs/libraries/nodejs/examples#messages
function forwardAsIOTATangle(apiKey, deviceId, state, topic) {
    const payload = 'i=' + deviceId + '&k=' + apiKey + '&d=' + state;
    IOTA_CLIENT.message()
        .index(IOTA_TOPIC + '/' + topic)
        .data(payload)
        .submit()
        .then((message) => {
            debug('Command pushed to Tangle: ' + payload + '  to ' + IOTA_TOPIC + '/' + topic);
            debug('messageId: ' + message.messageId);
        })
        .catch((err) => {
            debug(err);
            if (topic === 'cmd') {
                Northbound.commandError(apiKey, deviceId, state);
            }
        });
}

exports.command = commandReceived;
