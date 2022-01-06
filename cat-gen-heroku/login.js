const express = require('express');
const sqlite3 = require('sqlite3');

const loginRouter = express.Router();

const db = new sqlite3.Database('./login.db', (error) => {
    if (error) {
      console.error(error.message);
    }
    console.log('Connected to the database.');
});

loginRouter.post('/registration', (req, res) => {
    let bodyData = '';
    console.log('start');
    req.on('data', (data) => {
        bodyData += data;
        console.log('req.data');
    });
    req.on('end', () => {
        console.log('req.end start');
        const body = JSON.parse(bodyData);
        const email = body.email;
        const password = body.password;
        const token = makeToken(10);
        console.log('req.end end');
        db.get('SELECT Email FROM Users WHERE Email = $email',
            {
                $email: email
            },
            (error, row) => {
                if (error) {
                    console.log('SELECT ERROR');
                    console.error(error.message);                  
                    res.status(500).send('Internal server error');
                }
                if (!row) {
                    db.run('INSERT INTO Users (Email, Password, Token) VALUES ($email, $password, $token)',
                        {
                            $email: email,
                            $password: password,
                            $token: token
                        },
                        function(error) {
                            if (error) {
                                console.log('INSERT ERROR');
                                console.error(error.message);                               
                                res.status(500).send('Internal server error');
                            }
                            else {
                                expireInOneHour(email);
                                res.status(201).send(token);
                            }      
                        }
                    );
                }
                else {
                    return res.status(500).send('This email is already existing');
                }
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

const checkLogin = (req, res, pet, callback) => {
    const token = req.get('Authorization');
    console.log('token = ' + token);
    db.get('SELECT Email FROM Users WHERE Token = $token',
        {
            $token: token
        },
        (error, row) => {
            if (error) {
                return res.status(500).send('Internal server error');
            }
            db.all('SELECT Email, Token, Password FROM Users',
                (error, rows) => {
                    console.log('rows = ' + rows);
                }
            );
            console.log('row = ' + row);
            //if (row) {
                //callback(pet, res);                   
            //}
            //else {
            //    res.status(404).send();
            //}
        }
    );
}

module.exports.router = loginRouter;
module.exports.checkLogin = checkLogin;