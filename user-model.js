const db = require('./data/dbconfig.js');

module.exports = {
    findBy,
    find,
    register,
};


function findBy(username){

    return db('users-table').select('*').where({username: username});
}

function register(user){
    return db('users-table').insert(user);
}

function find(){

    return db('users-table');
}