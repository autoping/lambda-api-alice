'use strict';

const QRCode = require('qrcode')
const sharp = require('sharp');

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