'use strict'
const uuid = require("uuid");
const crypto = require("crypto");
const userCardsRepo = require('./user-cards-repo');
const userRepo = require('./user-repo');
const response = require('./response');


module.exports.setCardToUser = async (event) => {
    let id = event.pathParameters.id;
    //todo
    let result = await userRepo.getUser(null, id);
    if (!result.Count) {
        return response.getResponse(400, 'There is no user with such an id');
    }
    let user = result.Items[0];
    //
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







