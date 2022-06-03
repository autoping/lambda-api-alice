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
    // console.log("generatedqr:", nGenerated);
    return{
        'headers': { "Content-Type": "image/png" },
        'statusCode': 200,
        'body': 'it s ok',
        'isBase64Encoded': true
    };
    // {
    //     statusCode: 200,
    //     headers: {
    //         'Access-Control-Allow-Origin': '*'
    //
    //     },
    //     body: nGenerated,
    //     isBase64Encoded: true
    // };

//// 'content-type': 'image/png'
};

const generateQR = async text => {
    try {
        return await QRCode.toBuffer(text);
    } catch (err) {
        return console.error(err);
    }
};