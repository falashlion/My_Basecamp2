const jwt = require('jsonwebtoken');
const { responseHandler } = require('../utils/responseHandler');
const userModel = require('../models/userModel');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        userModel.findById(decoded.userId)
            .then(user => {
                if (!user) {
                    console.log('User not found');
                    return responseHandler(res, 401, "Auth failed", { message: "User not found" });
                }
                req.user = user;
                next();
            })
            .catch(err => {
                console.error('Error during user lookup:', err);
                return responseHandler(res, 500, "An error occurred with authentication", { error: err });
            });
    } catch (error) {
        console.error('Token verification error:', error);
        responseHandler(res, 401, "Auth failed", { message: "You are not authorized to access this resource" });
    }
};
