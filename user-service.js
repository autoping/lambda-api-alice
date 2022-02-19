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

    const user = {
        id: uuid.v4(),
        confirmed: false,
        externalKey: undefined,
        chatId: undefined,
        name: userInput.name,
        email: userInput.email,
        phone: userInput.phone,
        createdAt: new Date().toJSON()
    }
    //validate
    // user with same email
    if (user.email) {
        let withSame = await userRepo.getUser(user.email);
        if (withSame.Count) {
            statusCode = 400;
            console.log(withSame);
            return response.getResponse(statusCode, "User exists with same email");
        }
    }

    // user with same phone
    if (user.phone) {
        let withSamePhone = await userRepo.getUserByPhone(user.phone);
        if (withSamePhone.Count) {
            statusCode = 400;
            console.log(withSamePhone);
            return response.getResponse(statusCode, "User exists with phone");
        }
    }

    let created = await userRepo.putUser(user);
    return response.getResponse(statusCode, created);
}


module.exports.confirmUser = async (event) => {
    let id = event.pathParameters.id;
    let user = this.getUser(id);
    const input = JSON.parse(event.body);
    if (input.chatId) {
        user.chatId = input.chatId;
        user.confirmed = true;
    } else {
        return response.getResponse(400, "There is no chatId in request body")
    }
    let created = await userRepo.putUser(user);
    return response.getResponse(statusCode, created);
}

module.exports.getUser = async (userId) => {
    let result = await userRepo.getUser(null, id);
    if (!result.Count) {
        return response.getResponse(400, 'There is no user with such an id');
    }
    let user = result.Items[0];
    return user;
}






