'use strict';

/*
 * This demo extends MyCoolAgent with the specific reply logic:
 *
 * 1) Echo any new message from the consumer
 * 2) Close the conversation if the consumer message starts with '#close'
 *
 * Replying is done via webhooks, so this example exposes an /post API by
 * starting a simple express.js server and then posting a request to this
 * REST API.
 */

const MyCoolAgent = require('../agent-bot/MyCoolAgent');
const express = require('express');
const bodyParser = require('body-parser');

const baseurl = process.env.LP_API_ENDPOINT || 'http://127.0.0.1:8080/logic'
const logicUrl = baseurl + logicPath;

const app = express();
const jsonParser = bodyParser.json();
const jsonReq = require('request').defaults({
    'json': true
});


// ************** Example webhook of logic
// usually should be deployed on different server
app.post('/logic', jsonParser, (req, res) => {
    const contentEvent = req.body;
    jsonReq.post({ 
        url: `${baseurl}/api/publishEvent`, 
        body: {
            dialogId: contentEvent.dialogId,
            event: {
                type: 'ContentEvent',
                contentType: 'text/plain',
                message: `echo : ${contentEvent.message}`
            }
        }
    });
});
// ************** End of webhook of logic


// ************** Webhook bridge
const echoAgent = new MyCoolAgent({
    accountId: process.env.LP_ACCOUNT,
    username: process.env.LP_USER,
    password: process.env.LP_PASS,
    // For internal lp only use
    //  export LP_CSDS=hc1n.dev.lprnd.net
    csdsDomain: process.env.LP_CSDS
});

// forward events to the webhook logic
echoAgent.on('MyCoolAgent.ContentEvent',(contentEvent)=>{
    jsonReq.post({ url: logicUrl, body: contentEvent})
});

// get async commands from the webhook logic
app.post('/api/:method', jsonParser, (req, res) => {
    echoAgent[req.params.method](req.body, (r,e)=> res.sendStatus(e?400:200));
});
// ************** End of Webhook bridge

app.listen(8080, () => console.log('Example app listening on port 8080!'));
