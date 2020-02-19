const express = require('express');
const userDB = require('./user-model.js');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const server = express();

server.use(express.json());


function generateToken(user){

    const payload = {
        userID: user.id,
        username: user.username
    }
    const secret = "my secret secret secret";

    const options = {
        expiresIn: '1d'
    }

    return JWT.sign(payload,secret,options);

}

function validateUser(req, res, next){
    const token = req.headers.authorization;
    if(token){
        JWT.verify(token, "my secret secret secret", (err, decodedToken) => {
            if(err){
                res.status(401).json({message: "can't touch this"})
            }else{
                next();
            }
        });
    }else {
        res.status(401).message({message: "You shall not pass!"})
    }
}


server.post('/api/register', (req, res) => {

    const user = req.body;

    const hash = bcrypt.hashSync(user.password, 12);
    
    user.password = hash;

    userDB.register(user)
        .then( user => {
            res.status(201)
                .json({message: user});
        })
        .catch(err => {
            res.status(500)
                .json({error: err.message})
        })
       

});

server.post('/api/login', (req, res) => {

    const {username, password} = req.body;

    userDB.findBy(username)
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)){
                const token = generateToken(user);

                res.status(200)
                    .json({message: `Welcome ${user.username}`, token})
            } else {
                res.status(401)
                    .json({message: 'Invalid Credentials',});
            }
        })
        .catch(err => {
            res.status(500)
                .json({error: err.message, err})
        })

});

server.get('/api/users', validateUser, (req, res) => {

    userDB.find()
        .then( users => {
            res.status(200)
                .json({users});
        })
        .catch( err => {
            res.status(500)
                .json({error: err.message})
        })
});


module.exports = server;