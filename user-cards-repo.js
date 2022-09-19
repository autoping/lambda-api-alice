'use strict'

const AWS = require("aws-sdk");

const userCardsTableName = "autoping-cards";
const autopingAssetsTableName = "autoping-cards";

//to use for local and prod
const dynamodb = require('serverless-dynamodb-client');
const docClient = dynamodb.doc;

//temp for local rn
// const docClient = new AWS.DynamoDB.DocumentClient({
//     region: 'localhost',
//     endpoint: 'http://localhost:8000',
//     accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
//     secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
// });


module.exports.getUserCards = async function () {
    let params = {
        TableName: userCardsTableName
    }
    return await docClient.scan(params).promise();
};

module.exports.getUserCard = async function (id) {
    if(!id){
        return null;
    }
    let params = {
        TableName: userCardsTableName,
        FilterExpression: "id = :id ",
        ExpressionAttributeValues: {
            ":id": id
        }
    }
    return await docClient.scan(params).promise();
};

module.exports.putUserCard = async function (userCard) {
    let params = {
        TableName: userCardsTableName,
        Item: userCard
    };
    let result = await docClient.put(params).promise();
    let created = await this.getUserCard(userCard.id);
    return created;
};
