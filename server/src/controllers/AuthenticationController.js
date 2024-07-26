
const userModel = require('../models/userModel');
const env = require('dotenv').config();
const { responseHandler } = require('../utils/responseHandler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Desc: Authentication controller for user login and logout
exports.login = (req, res, next) => {
    const user = req.body;
    const secretKey = process.env.JWT_SECRET;
    userModel.findOne({email: user.email}).exec()
        .then(doc => {
            if(!doc) {
                responseHandler(res, 401, "login failed", { message: "Invalid email or password" });   
            } else {
                bcrypt.compare(user.password, doc.password, (err, result) => {
                    if(err){
                        responseHandler(res, 500, "An error occurred", { error: err });
                    }
                        if(result){
                            const token = jwt.sign({
                                email: doc.email,
                                userId: doc._id
                            }, secretKey, {
                                expiresIn: "1h"
                            });
                            responseHandler(res, 200, "login successful", { user: {
                            _id: doc._id,
                            firstName: doc.firstName,
                            lastName: doc.lastName,
                            email: doc.email,
                            is_admin: doc.is_admin,
                            userImage: doc.userImage,
                            token: token,
                            request: {
                                method: ' POST',
                                url: "http://localhost:5000/api/users/" + doc._id
                            }
                        }
                         });
                        } else {
                            responseHandler(res, 401, "login failed", { message: "Invalid email or password" });
                        }
                });
            }
        })
        .catch(err => {
            responseHandler(res, 401, "login failed", { message: "Invalid email or password" });
        });
};


exports.logout = (req, res, next) => {
    responseHandler(res, 200, "logout successful", { message: "You have successfully logged out" });
}