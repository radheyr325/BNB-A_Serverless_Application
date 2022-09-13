
const { v1 } = require('@google-cloud/pubsub');
require('dotenv').config();
const subscriptionNameOrId = 'orderSubscription';
const projectId = 'lustrous-vial-356719';
const subClient = new v1.SubscriberClient();

exports.handler = async (event) => {
    if (event.httpMethod === "GET" && event.path === "/sub") {
        console.log(event);
        try {

            let result = [];

            const formattedSubscription =
                subscriptionNameOrId.indexOf('/') >= 0
                    ? subscriptionNameOrId
                    : subClient.subscriptionPath(projectId, subscriptionNameOrId);

            // The maximum number of messages returned for this request.
            // Pub/Sub may return fewer than the number specified.
            const request = {
                subscription: formattedSubscription,
                maxMessages: 10,
            };

            // The subscriber pulls a specified number of messages.
            const [response] = await subClient.pull(request);

            // Process the messages.
            const ackIds = [];
            for (const message of response.receivedMessages) {
                console.log(`Received message: ${message.message.data}`);
                ackIds.push(message.ackId);
                result.push(JSON.parse(message.message.data.toString()));
            }

            if (ackIds.length !== 0) {
                // Acknowledge all of the messages. You could also acknowledge
                // these individually, but this is more efficient.
                const ackRequest = {
                    subscription: formattedSubscription,
                    ackIds: ackIds,
                };

                await subClient.acknowledge(ackRequest);
            }

            console.log('Done.');
            console.log(result);
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application.json",
                },
                body: JSON.stringify(result)
            };
        } catch (error) {
            console.log("There is an error getting messages: ", error);
            return {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application.json",
                },
                body: JSON.stringify(error)
            };
        }
    } else {
        return {
            statusCode: 404,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application.json",
            },
            body: "404 not found",
        };
    }
};

