const { PubSub } = require('@google-cloud/pubsub');

require('dotenv').config();

const pubSubClient = new PubSub();
const topicName = "orderTopic";

exports.handler = async (event) => {
    const record = event.Records[0];
    console.log('Stream record: ', JSON.stringify(record, null, 2));
    if (record.eventName == 'INSERT') {
        var tableName = record.eventSourceARN.split(':')[5].split('/')[1];
        if (tableName === "tourOrders") {
            var params = {
                tableName: tableName,
                groupSize: record.dynamodb.NewImage.groupSize.S,
                email: record.dynamodb.NewImage.email.S
            }
        } else if (tableName === "roomOrders") {
            var params = {
                tableName: tableName,
                checkin: record.dynamodb.NewImage.checkin.S,
                checkout: record.dynamodb.NewImage.checkout.S,
                people: record.dynamodb.NewImage.people.S,
                email: record.dynamodb.NewImage.email.S
            }
        } else if (tableName === "kitchenOrders") {
            var params = {
                tableName: tableName,
                cuisine: record.dynamodb.NewImage.cuisine.S,
                foodName: record.dynamodb.NewImage.foodName.S,
                price: record.dynamodb.NewImage.price.S,
                email: record.dynamodb.NewImage.email.S
            }
        } else {
            var params = {}
        }
        var data = JSON.stringify(params);
        const dataBuffer = Buffer.from(data);
        try {
            var messageId = await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
            console.log(`Message ${messageId} published.`);
            return messageId;
        } catch (error) {
            console.error(`Received error while publishing: ${error.message}`);
            return error;
        }
    }

};
