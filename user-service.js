'use strict'
const uuid = require("uuid");
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
    const user = JSON.parse(event.body);
    let statusCode = 200;
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
    //todo
    // user with same phone

    user.createdAt = new Date().toJSON();
    user.id = uuid.v4();
    let created = await userRepo.putUser(user);
    return response.getResponse(statusCode, created);
}





