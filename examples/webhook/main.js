'use strict';

/*
 * This demo extends MyCoolAgent with the specific reply logic:
 *
 * 1) Echo any new message from the consumer
 * 2) Close the conversation if the consumer message starts with '#close'
 *
 */

const MyCoolAgent = require('../agent-bot/MyCoolAgent');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const jsonParser = bodyParser.json();
const req = request.defaults({
    'method': 'POST',
    'url': 'http://127.0.0.1:8080/post', // TODO: set via env variable
    'json': true
});

const echoAgent = new MyCoolAgent({
    accountId: process.env.LP_ACCOUNT,
    username: process.env.LP_USER,
    password: process.env.LP_PASS,
    // For internal lp only use
    //  export LP_CSDS=hc1n.dev.lprnd.net
    csdsDomain: process.env.LP_CSDS
});

// an API to send messages to
app.post('/post', jsonParser, (req, res) => {
    echoAgent.publishEvent(req.body);
    res.send(200);
});

app.listen(8080, () => console.log('Example app listening on port 8080!'));

echoAgent.on('MyCoolAgent.ContentEvent',(contentEvent)=>{
    if (contentEvent.message.startsWith('#close')) {
        echoAgent.updateConversationField({
            conversationId: contentEvent.dialogId,
            conversationField: [{
                field: 'ConversationStateField',
                conversationState: 'CLOSE'
            }]
        });

    } else {
        // send data to webhook endpoint
        const body = {
            dialogId: contentEvent.dialogId,
            event: {
                type: 'ContentEvent',
                contentType: 'text/plain',
                message: `echo : ${contentEvent.message}`
            }
        };
        req({body});
    }
});
