const jwt = require('jsonwebtoken');
const config = require('config');

//all middleware take in req res and next. does something with req res and then next to continue after middleware.

module.exports = function(req, res, next) {
    // get token from header
    const token = req.header('x-auth-token');

    //check if token exists
    if (!token) {
        //status 401 = not authorized
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    //verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user; //setting it to user object only if verified
        next();
    } catch (err) {
        res.status(401).json({ msg: 'token is not valid' });
    }
};
