'use strict'

const AWS = require("aws-sdk");

const usersTableName = "usersTable";

//to use for local and prod
const dynamodb = require('serverless-dynamodb-client');

const rawClient = dynamodb.raw;  // returns an instance of new AWS.DynamoDB()

const docClient = dynamodb.doc;  // return an instance of new AWS.DynamoDB.DocumentClient()

// //temp for local rn
// const docClient = new AWS.DynamoDB.DocumentClient({
//     region: 'localhost',
//     endpoint: 'http://localhost:8000',
//     accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
//     secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
// })
module.exports.getUsers =  async function(){
    //todo - to user repo
    let params = {
        TableName: usersTableName
    }

    return await docClient.scan(params).promise();
};

module.exports.putUser = async function(user){
    let params = {
        TableName: usersTableName,
        Item: user
    };
    let result = await docClient.put(params).promise();
    let created = await this.getUser(null, user.id);
    console.log("bla",created);
    return created.Items[0];
};

module.exports.getUser = async function (email, id) {
        let params = {};
        if (email) {
            params = {
                TableName: usersTableName,
                FilterExpression: "email = :e ",
                ExpressionAttributeValues: {
                    ":e": email
                }
            };
        }
        if (id) {
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