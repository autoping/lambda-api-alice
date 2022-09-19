'use strict'
const uuid = require("uuid");
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

    const user = {
        id: uuid.v4(),
        login: userInput.login,
        passwordHash: userInput.password,
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






