var User = require('../models/user');
var Message = require('../models/message');
var jwt = require('jsonwebtoken');
var config = require('../config/config');

function createToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: 200 // 86400 expires in 24 hours
      });
}

exports.registerUser = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ 'msg': 'You need to send Username and password' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            console.log("while search");
            console.log(err);
            return res.status(400).json({ 'msg': err });
        }

        if (user) {
            console.log(user);
            return res.status(400).json({ 'msg': 'The username already exists' });
        }

        let newUser = User(req.body);
        newUser.save((err, user) => {
            if (err) {
                console.log("while saving");
                console.log(err);
                return res.status(400).json({ 'msg': err });
            }
            return res.status(201).json(user);
        });
    });
};

exports.loginUser = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({ 'msg': 'You need to give  username and password' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(400).send({ 'msg': err });
        }

        if (!user) {
            return res.status(400).json({ 'msg': 'The username does not exist' });
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (isMatch && !err) {
                return res.status(200).json({
                    token: createToken(user)
                });
            } else {
                return res.status(400).json({ msg: ' username and password don\'t match.' });
            }
        });
    });
};

exports.Users = (req, res) => {
    User.find({ }, (err, users) => {
        if (users) {
            console.log(users);
            return res.status(201).json(users);
        }
    });
};

exports.Messages = (req, res) => {
    to = req.body.to;
/* q1={$and: [ { "to" : { $eq:   to } } ,    { "from" : { $eq: from }} ]} 
 q2={$and: [ { "to" : { $eq: from } } ,  { "from" : { $eq: to }} ]} */
 q1={"to" : { $eq:   to } };
 q2={"from" : { $eq:   to } };
   query = { $or:[q1,q2]      } 
   console.log(query);
    Message.find(query, (err, messages) => {
        if (messages) {
            console.log(messages);
            return res.status(201).json(messages);
        }
    });
};