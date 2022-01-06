'use strict';

const QRCode = require('qrcode')
const sharp = require('sharp');
const AWS = require("aws-sdk");
const uuid = require("uuid");

const usersTableName = "usersTable";

//to use for local and prod
// const dynamodb = require('serverless-dynamodb-client');
//
// const rawClient = dynamodb.raw;  // returns an instance of new AWS.DynamoDB()
//
// const docClient = dynamodb.doc;  // return an instance of new AWS.DynamoDB.DocumentClient()

//temp for local rn
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
    secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
})

module.exports.getUsers = async (event) => {

    let params = {
        TableName: usersTableName
    }

    let result = await docClient.scan(params).promise();

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(
            result.Items
        )
    };
}

module.exports.getUser = async (event) => {
    let id = event.pathParameters.id;

    let result = await getUser(null, id);
    if (!result.Count) {
        return getResponse(400, 'There is no user with such an id');
    }
    return getResponse(200, result.Items);
}


module.exports.postUser = async (event) => {
    const user = JSON.parse(event.body);
    let statusCode = 200;
    //validate
    // user with same email
    if (user.email) {
        let withSame = await getUser(user.email);
        if (withSame.Count) {
            statusCode = 400;
            console.log(withSame);
            return getResponse(statusCode, "User exists with same email");
        }


    }
    //todo
    // user with same phone

    user.createdAt = new Date().toJSON();
    user.id = uuid.v4();

    let params = {
        TableName: usersTableName,
        Item: user
    };

    let result = await docClient.put(params).promise();
    let created = await getUser(null, user.id);

    return getResponse(statusCode, created.Items[0]);
}


module.exports.getQRCode = async (event) => {

    const input = JSON.parse(event.body);
    const url = input.url;

    let generatedQR = await generateQR(url);
    let nGenerated = await sharp('let_me.png')
        .composite([{input: generatedQR, gravity: 'centre'}])
        .toBuffer();
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'content-type': 'image/png'
        },
        body: nGenerated,
        isBase64Encoded: true
    };


};

const generateQR = async text => {
    try {
        return await QRCode.toBuffer(text);
    } catch (err) {
        return console.error(err);
    }
};

const getResponse = function (statusCode, statusMessage) {
    return {
        statusCode: statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(statusMessage)
    };
}

//todo make a kind of repo
async function getUser(email, id) {
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
