'use strict'
const uuid = require("uuid");
const crypto = require("crypto");
const userCardsRepo = require('./user-cards-repo');
const userService = require('./user-service');
const response = require('./response');


module.exports.setCardToUser = async (event) => {
    let id = event.pathParameters.id;
    let user = userService.getUser(id);
    const input = JSON.parse(event.body);
    let card;
    if (input.externalKey) {
        //todo check if there is no such
        return response.getResponse(400, "Custom external keys not implemented")
    } else {
        card = crypto.randomBytes(48).toString('hex');
    }
    let userCard = {
        id: uuid.v4(),
        userId: user.id,
        userCard: card
    }
    let created = await userCardsRepo.putUserCard(userCard);
    return response.getResponse(statusCode, created);
};







