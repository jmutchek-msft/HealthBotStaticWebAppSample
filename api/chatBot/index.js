const crypto = require('crypto');
const jwt = require("jsonwebtoken");

module.exports = async function (context, req) {
    context.log('Initializing chat request');

    // if no userid was passed on querystring, generate one randomly
    var userid = req.query.userId;
    if (!userid) {
        userid = "dl_" + crypto.randomBytes(4).toString('hex');
    }

    var response = {};
    response['userId'] = userid;
    response['userName'] = req.query.userName;
    response['locale'] = req.query.locale;
    
    // as an alternative to having the web client call an api/token endpoint to retrieve a token,
    // that call could be made here and the token returned in one signed package
    // 
    // response['authenticationToken'] = '';
    // 

    // add any additional attributes here
    // 
    // response['optionalAttributes'] = {age: 33};
    // 

    const jwtToken = jwt.sign(response, process.env["APP_SECRET"]);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: jwtToken
    };
}