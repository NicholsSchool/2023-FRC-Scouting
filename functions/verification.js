const {admin} = require('./server');

var methods = {};

/**
 * Verifies the user by checking the "Authorization" header of the https request 
 * for an ID token. Returns the decoded user info or an error. 
 * 
 * @param request the request sent from the user
 * @return decoded user info or an error if invalid
 */
methods.verifyAuthToken = async function (request) {
    const tokenId = request.get('Authorization');
    return admin.auth().verifyIdToken(tokenId)
}

module.exports = methods;