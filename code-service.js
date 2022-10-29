'use strict';

const QRCode = require('qrcode')
const sharp = require('sharp');


module.exports.getQRCode = async (event) => {
// let eb = event?event.body:'some text';
    const input = JSON.parse(event.body);
    console.log(input)
    const url = input.url;

    let generatedQR = await generateQR(url);
    let nGenerated = await sharp('let_me.png')
        .composite([{input: generatedQR, gravity: 'centre'}])
        .toBuffer();
    console.log("generatedqr:", nGenerated);
    // return{
    //     'headers': { 'Content-Type': 'image/png' },
    //     'statusCode': 200,
    //     'body': 'bla',
    //     'isBase64Encoded': true
    // };
    // Buffer.from(nGenerated, 'utf-8'),

    //

    return{
        statusCode: 200,
        headers: {
            'content-type': '*/*',
            'Access-Control-Allow-Origin': '*',
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        },
        body: generatedQR,
        isBase64Encoded: true
    };

////
};

const generateQR = async text => {
    try {
        return await QRCode.toBuffer(text);
    } catch (err) {
        return console.error(err);
    }
};