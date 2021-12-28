const express = require('express');
const sqlite3 = require('sqlite3');

const loginRouter = express.Router();

const db = new sqlite3.Database('./login.db');

loginRouter.post('/registration', (req, res) => {
    let bodyData = '';
    req.on('data', (data) => {
        bodyData += data;
    });
    req.on('end', () => {
        const body = JSON.parse(bodyData);
        const email = body.email;
        const password = body.password;
        const token = makeToken(10);
        db.run('INSERT INTO Users (Email, Password, Token) VALUES ($email, $password, $token)',
            {
                $email: email,
                $password: password,
                $token: token
            },
            function(error) {
                if (error) {
                    return res.status(500).send('Internal server error');
                }
                expireInOneHour(email);
                res.status(201).send(token);
            }
        );
        
    });
});

loginRouter.get('/token', (req, res) => {
    let bodyData = '';
    req.on('data', (data) => {
        bodyData += data;
    });

    req.on('end', () => {
        const body = JSON.parse(bodyData);
        const email = body.email;
        //const password = body.password;

        updateToken(email, res);
    });
});

const expireInOneHour = (email, token) => {
    setTimeout(() => {
        db.run('UPDATE Users SET Token = null WHERE Email = $email',
            {
                $email: email
            },
            function(error) {
                if (error) {
                    console.log('Token expiration error');
                }
            }
        );
    })
}

const makeToken = length => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const updateToken = (email, res) => {
    const token = makeToken(10);
    db.run('UPDATE Users SET Token = $token WHERE Email = $email',
        {
            $email: email,
            $token: token
        },
        function(error) {
            if (error) {
                return res.status(500).send('Internal server error');
            }
            expireInOneHour(email);
            res.status(200).send(token);
        }
    );   
}

module.exports.router = loginRouter;
module.exports.updateToken = updateToken;