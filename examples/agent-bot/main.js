'use strict';

/*
 * This demo extends MyCoolAgent with the specific reply logic:
 *
 * 1) Echo any new message from the consumer
 * 2) Close the conversation if the consumer message starts with '#close'
 *
 */

const MyCoolAgent = require('./MyCoolAgent');

const echoAgent = new MyCoolAgent({
    accountId: process.env.LP_ACCOUNT,
    username: process.env.LP_USER,
    // For internal lp only use
    //  export LP_CSDS=hc1n.dev.lprnd.net
    csdsDomain: process.env.LP_CSDS,
    appKey: process.env.LP_APP_KEY,
    secret: process.env.LP_SECRET,
    accessToken: process.env.LP_ACCESS_TOKEN,
    accessTokenSecret: process.env.LP_ACCESS_TOKEN_SECRET,
});

echoAgent.on('MyCoolAgent.ContentEvent', (contentEvent)=>{
    if (contentEvent.message.startsWith('#close')) {
        echoAgent.updateConversationField({
            conversationId: contentEvent.dialogId,
            conversationField: [{
                    field: 'ConversationStateField',
                    conversationState: 'CLOSE'
                }]
        });
    } else {
        echoAgent.publishEvent({
            dialogId: contentEvent.dialogId,
            event: {
                type: 'ContentEvent',
                contentType: 'text/plain',
                message: `echo : ${contentEvent.message}`
            }
        });
    }
});
