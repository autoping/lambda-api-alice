'use strict'

const AWS = require("aws-sdk");

const usersTableName = "autoping-users";
const assetsTableName = "autoping-assets";
const cardsTableName = "autoping-cards";

// //to use for local and prod
// const dynamodb = require('serverless-dynamodb-client');
// const docClient = dynamodb.doc;

// temp for local rn
const docClient = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'DEFAULT_ACCESS_KEY',  // needed if you don't have aws credentials at all in env
    secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
});


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

module.exports.putAsset = async function (asset) {
    let params = {
        TableName: assetsTableName,
        Item: asset
    };
    let result = await docClient.put(params).promise();
    let created = await this.getAsset(asset.id);
    return created.Items[0];
};

module.exports.getAssets = async function (userId) {
    let params = {};
    params = {
        TableName: assetsTableName,
        FilterExpression: " userId = :userId ",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    };
    let result = await docClient.scan(params).promise();

    return result.Items;
};

module.exports.getAsset = async function (id) {
    let params = {};
    params = {
        TableName: assetsTableName,
        FilterExpression: " id = :id ",
        ExpressionAttributeValues: {
            ":id": id
        }
    };
    return await docClient.scan(params).promise();
}

module.exports.putCard = async function (card) {
    let params = {
        TableName: cardsTableName,
        Item: card
    };
    let result = await docClient.put(params).promise();
    let created = await this.getCard(card.id);
    return created.Items[0];
};

module.exports.getCard = async function (id) {
    let params = {};
    params = {
        TableName: cardsTableName,
        FilterExpression: " id = :id ",
        ExpressionAttributeValues: {
            ":id": id
        }
    };
    return await docClient.scan(params).promise();
}

//todo check
module.exports.getCards = async function (userId) {
    let assets = await this.getAssets(userId);
    console.log(assets)
    let assetsIds = [];
    for (let i = 0; i < assets.length; i++) {
        assetsIds.push(assets[i].id);
    }
    let params = {};
    console.log(assetsIds);
    params = {
        TableName: cardsTableName,
        FilterExpression: " assetId IN ('bla')",
        ExpressionAttributeValues: {
            ":assetIds": assetsIds
        }
    };
    let result = await docClient.scan(params).promise();
    return result.Items;
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