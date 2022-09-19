'use strict'
const uuid = require("uuid");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const userRepo = require('./user-repo');
const response = require('./response');


module.exports.getUsers = async (event) => {
    let result = await userRepo.getUsers();
    return response.getResponse(200, result.Items);
}

module.exports.getUser = async (event) => {
    let id = event.pathParameters.id;

    let result = await userRepo.getUser(null, id);
    if (!result.Count) {
        return response.getResponse(400, 'There is no user with such an id');
    }
    return response.getResponse(200, result.Items);
}


module.exports.postUser = async (event) => {
    const userInput = JSON.parse(event.body);
    let statusCode = 200;

    if (!(userInput.login || "").trim()
        || !(userInput.password || "").trim()
        || !(userInput.nickname || "").trim()) {
        statusCode = 400;
        return response.getResponse(statusCode, "Please, fill up login, password and nickname");
    }

    let pHash = await bcrypt.hash(userInput.password, 10);
    const user = {
        id: uuid.v4(),
        login: userInput.login,
        passwordHash: pHash,
        nickname: userInput.nickname,
        chatId: undefined,
        createdAt: Math.floor(Date.now() / 1000)
    }
    //validate
    // user login uniqueness

    let withSameLogin = await userRepo.getUser(user.login);
    if (withSameLogin.Count) {
        statusCode = 400;
        console.log(withSameLogin);
        return response.getResponse(statusCode, "User exists with same login, please choose another.");
    }


    let created = await userRepo.putUser(user);
    return response.getResponse(statusCode, created);
}

module.exports.postAssets = async (event) => {
    const assetInput = JSON.parse(event.body);
    let statusCode = 200;

    if (!(assetInput.userId || "").trim()
        || !(assetInput.name || "").trim()) {
        statusCode = 400;
        return response.getResponse(statusCode, "Please, fill up userId and name");
    }

    const asset = {
        id: uuid.v4(),
        name: assetInput.name,
        userId: assetInput.userId,
        createdAt: Math.floor(Date.now() / 1000)
    }
    //validate
    // user exists

    let user = await userRepo.getUser(null, asset.userId);
    if (!user.Count) {
        statusCode = 400;
        return response.getResponse(statusCode, "There is no user with id " + asset.userId);
    }

    let created = await userRepo.putAsset(asset);
    return response.getResponse(statusCode, created);
}

module.exports.postCards = async (event) => {
    const cardInput = JSON.parse(event.body);
    let statusCode = 200;

    if (!(cardInput.assetId || "").trim()) {
        statusCode = 400;
        return response.getResponse(statusCode, "Please, fill up assetId");
    }

    const card = {
        id: uuid.v4(),
        assetId: cardInput.assetId,
        description: cardInput.description,
        createdAt: Math.floor(Date.now() / 1000)
    }
    //validate
    // asset exists
    let asset = await userRepo.getAsset( card.assetId);
    if (!asset.Count) {
        statusCode = 400;
        return response.getResponse(statusCode, "There is no asset with id " + card.assetId);
    }

    let created = await userRepo.putCard(card);
    return response.getResponse(statusCode, created);
}


module.exports.confirmUser = async (event) => {
    let id = event.pathParameters.id;
    //todo
    let result = await userRepo.getUser(null, id);
    if (!result.Count) {
        return response.getResponse(400, 'There is no user with such an id');
    }
    let user = result.Items[0];
    //
    const input = JSON.parse(event.body);
    if (input.chatId) {
        user.chatId = input.chatId;
        user.confirmed = true;
    } else {
        return response.getResponse(400, "There is no chatId in request body")
    }
    let created = await userRepo.putUser(user);
    return response.getResponse(200, created);
}

//todo
const getUser = async (userId) => {
    let result = await userRepo.getUser(null, id);
    if (!result.Count) {
        return response.getResponse(400, 'There is no user with such an id');
    }
    let user = result.Items[0];
    return user;
}






