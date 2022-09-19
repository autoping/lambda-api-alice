'use strict'

const AWS = require("aws-sdk");

const usersTableName = "autoping-users";

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


module.exports.getUsers = async function () {
    let params = {
        TableName: usersTableName
    }
    return await docClient.scan(params).promise();
};

module.exports.putUser = async function (user) {
    let params = {
        TableName: usersTableName,
        Item: user
    };
    let result = await docClient.put(params).promise();
    let created = await this.getUser(null, user.id);
    return created.Items[0];
};

module.exports.getUser = async function (login, id) {
    let params = {};
    if (id && login) {
        params = {
            TableName: usersTableName,
            FilterExpression: "login = :e AND id = :id ",
            ExpressionAttributeValues: {
                ":e": login,
                ":id": id
            }
        };
    } else if (login) {
        params = {
            TableName: usersTableName,
            FilterExpression: "login = :e ",
            ExpressionAttributeValues: {
                ":e": login
            }
        };
    } else if (id) {
        params = {
            TableName: usersTableName,
            FilterExpression: "id = :id ",
            ExpressionAttributeValues: {
                ":id": id
            }
        };
    }
    return await docClient.scan(params).promise();
}

module.exports.getUserByPhone = async function (phone) {
    let params = {};
    if (phone) {
        params = {
            TableName: usersTableName,
            FilterExpression: "phone = :p ",
            ExpressionAttributeValues: {
                ":p": phone
            }
        };
    }
    return await docClient.scan(params).promise();
}