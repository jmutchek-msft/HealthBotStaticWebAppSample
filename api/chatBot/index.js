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
    response['userName'] = "Web Chat User";
    response['locale'] = req.query.locale;
    response['connectorToken'] = '';

    /*
    //Add any additional attributes
    response['optionalAttributes'] = {age: 33};
    */

    if (req.query.lat && req.query.long)  {
        response['location'] = {lat: req.query.lat, long: req.query.long};
    }

    // response['directLineURI'] = DIRECTLINE_ENDPOINT_URI;
    const jwtToken = jwt.sign(response, process.env["APP_SECRET"]);
    // res.send(jwtToken);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: jwtToken
    };
}