'use strict'
const uuid = require("uuid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const userRepo = require('./user-repo');
const validator = require('./validator');
const response = require('./response');

const tokenPrivateKey = process.env.TOKEN_PRIVATE_KEY;


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

    // if (!(userInput.login || "").trim()
    //     || !(userInput.password || "").trim()
    //     || !(userInput.nickname || "").trim()) {
    //     statusCode = 400;
    //     return response.getResponse(statusCode, "Please, fill up login, password and nickname");
    // }

    let loginNoValid = validator.isStringNoValid("login", userInput.login, 1, 24, true);
    if (loginNoValid) {
        return response.getResponse(400, loginNoValid);
    }

    let passwordNoValid = validator.isStringNoValid("password", userInput.password, 1, 18, true);
    if (passwordNoValid) {
        return response.getResponse(400, passwordNoValid);
    }

    let nicknameNoValid = validator.isStringNoValid("nickname", userInput.nickname, 1, 18, true);
    if (nicknameNoValid) {
        return response.getResponse(400, nicknameNoValid);
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

module.exports.getOwnUser = async (event) => {
    let statusCode = 200;
    let userId = "";
    try {
        userId = getUserIdFromEvent(event);
    } catch (e) {
        return response.getResponse(e.code, e.message);
    }

    let users = await userRepo.getUser(null, userId);
    return response.getResponse(statusCode, users.Items[0]);
}

module.exports.getAssets = async (event) => {
    let statusCode = 200;
    let userId = "";
    try {
        userId = getUserIdFromEvent(event);
    } catch (e) {
        return response.getResponse(e.code, e.message);
    }

    let assets = await userRepo.getAssets(userId);
    return response.getResponse(statusCode, assets);
}

module.exports.postAssets = async (event) => {
    const assetInput = JSON.parse(event.body);
    let statusCode = 200;
    let userId = "";
    try {
        userId = getUserIdFromEvent(event);
    } catch (e) {
        return response.getResponse(e.code, e.message);
    }

    let nameNoValid = validator.isStringNoValid("name", assetInput.name, 1, 16, true);
    if (nameNoValid) {
        return response.getResponse(400, nameNoValid);
    }

    const asset = {
        id: uuid.v4(),
        name: assetInput.name,
        userId: userId,
        createdAt: Math.floor(Date.now() / 1000)
    }

    // user exists
    let user = await userRepo.getUser(null, asset.userId);
    if (!user.Count) {
        statusCode = 400;
        return response.getResponse(statusCode, "There is no user with id " + asset.userId);
    }

    //n of assets <5
    let existedAssets = await userRepo.getAssets(userId);
    if(existedAssets.length>4){
        statusCode = 400;
        return response.getResponse(statusCode, "You can't create new asset as maximum number of assets is achieved!");
    }

    let created = await userRepo.putAsset(asset);
    return response.getResponse(statusCode, created);
}

module.exports.getCardsOfAsset = async (event) => {
    let userId = "";
    try {
        userId = getUserIdFromEvent(event);
    } catch (e) {
        return response.getResponse(e.code, e.message);
    }

    let statusCode = 200;
    let id = event.pathParameters.id;

    let cards = await userRepo.getCards(userId,id);
    console.log(cards,userId,id)
    return response.getResponse(statusCode, cards.Items);
}

module.exports.postCards = async (event) => {
    const cardInput = JSON.parse(event.body);
    let statusCode = 200;
    let userId = "";
    try {
        userId = getUserIdFromEvent(event);
    } catch (e) {
        return response.getResponse(e.code, e.message);
    }

    if (!(cardInput.assetId || "").trim()) {
        statusCode = 400;
        return response.getResponse(statusCode, "Please, fill up assetId");
    }
    let descriptionNoValid = validator.isStringNoValid("description", cardInput.description, 0, 32,);
    if (descriptionNoValid) {
        return response.getResponse(400, descriptionNoValid);
    }

    // asset exists
    let assetsResponse = await userRepo.getAsset(cardInput.assetId);
    if (!assetsResponse.Count) {
        statusCode = 400;
        return response.getResponse(statusCode, "There is no asset with id " + cardInput.assetId);
    }

    if (userId != assetsResponse.Items[0].userId) {
        statusCode = 400;
        return response.getResponse(statusCode, "Only for own asset the card can set");
    }

    const card = {
        id: uuid.v4(),
        assetId: cardInput.assetId,
        userId: assetsResponse.Items[0].userId,
        description: cardInput.description,
        createdAt: Math.floor(Date.now() / 1000)
    }


    //n of cards <5
    let existedCards = await userRepo.getCards(userId, cardInput.assetId);
    if(existedCards.Items.length>4){
        statusCode = 400;
        return response.getResponse(statusCode, "You can't create new card as maximum number of cards is achieved!");
    }

    let created = await userRepo.putCard(card);
    return response.getResponse(statusCode, created);
}

module.exports.getCards = async (event) => {
    let statusCode = 200;
    let userId = "";
    try {
        userId = getUserIdFromEvent(event);
    } catch (e) {
        return response.getResponse(e.code, e.message);
    }

    let cards = await userRepo.getCards(userId);
    return response.getResponse(statusCode, cards);
}

module.exports.getCard = async (event) => {
    let userId = "";
    try {
        userId = getUserIdFromEvent(event);
    } catch (e) {
        return response.getResponse(e.code, e.message);
    }

    let statusCode = 200;
    let id = event.pathParameters.id;

    let cards = await userRepo.getCard(id);
    return response.getResponse(statusCode, cards.Items[0]);
}

module.exports.login = async (event) => {
    const credentials = JSON.parse(event.body);
    let statusCode = 200;

    if (!(credentials.login || "").trim()
        || !(credentials.password || "").trim()) {
        statusCode = 501;
        return response.getResponse(statusCode, "Please, provide login and password");
    }

    //validate
    let users = await userRepo.getUser(credentials.login);

    if (!users.Count || !await bcrypt.compare(credentials.password, users.Items[0].passwordHash)) {
        statusCode = 501;
        return response.getResponse(statusCode, "Login or password are wrong, please, try another!");
    }

    let token = jwt.sign(users.Items[0], tokenPrivateKey);
    let jwt_res = {
        accessToken: token
    }
    return response.getResponse(statusCode, jwt_res);
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

const getUserIdFromEvent = (e) => {
    let userId = "";
    try {
        userId = getUserIdFromToken(e.headers["Authorization"].split(" ")[1]);
    } catch (e) {
        throw {
            "code": 501,
            "message": 'Access token is wrong'
        };
    }

    if (!userId) {
        throw {
            "code": 501,
            "message": "There is no userId in token "
        };
    }
    return userId;
}

const getUserIdFromToken = (token) => {
    let verified = jwt.verify(token, tokenPrivateKey);
    return verified.id;
}






