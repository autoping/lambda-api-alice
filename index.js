let QRCode = require('qrcode')


module.exports.getQRCode = async (event) => {

    const input = JSON.parse(event.body);
    const url = input.url;
    console.log(url);
    let generatedQR = await generateQR(url);
    console.log(generatedQR)
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'content-type': 'image/png'
        },
        body: generatedQR,
        isBase64Encoded: true
    };
    // {
    //     statusCode: 200,
    //     headers: {
    //         'Access-Control-Allow-Origin': '*',
    //         'content-type': 'image/png'
    //     },
    //     body: generatedQR
    // };


};

const generateQR = async text => {
    try {
        return await QRCode.toBuffer(text);
    } catch (err) {
        return console.error(err);
    }
};