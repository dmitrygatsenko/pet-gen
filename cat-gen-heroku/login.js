const express = require('express');

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

loginRouter.get('/enter', (req, res) => {
    let bodyData = '';
    req.on('data', (data) => {
        bodyData += data;
    });

    req.on('end', () => {
        const body = JSON.parse(bodyData);
        const email = body.email;
        const password = body.password;
        const token = body.token;
        db.get('SELECT Email, Password, Token FROM Users WHERE Email = $email',
            {
                $email: email
            },
            (error, row) => {
                if (error) {
                    return res.status(500).send('Internal server error');
                }
                if (row.password === password) {
                    if (row.Token) {
                        if (row.Token == token) {
                            return res.status(200).send();
                        }                      
                    }
                    else {
                        updateToken(email, res);
                    }
                }
                else return res.status(403).send('Wrong password');
            }
        );
        
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

const updateToken = (email, token, res) => {
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
            res.status(401).send(token);
        }
    );   
}

module.exports.router = loginRouter;
module.exports.updateToken = updateToken;