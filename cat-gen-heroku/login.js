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
    req.on('data', (data) => {
        bodyData += data;
    });
    req.on('end', () => {
        const body = JSON.parse(bodyData);
        const email = body.email;
        const password = body.password;
        const token = makeToken(10);
        db.run('INSERT OR FAIL INTO Users (Email, Password, EntryToken) VALUES ($email, $password, $token)',
            {
                $email: email,
                $password: password,
                $token: token
            },
            function(error) {
                if (error) {
                    console.error(error.message);                               
                    return res.status(409).send('Email already exists');
                }
                else {
                    expireInOneHour(email);
                    res.status(201).send(token);
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
        updateToken(email, res);
    });
});

const expireInOneHour = (email) => {
    setTimeout(() => {
        db.run('UPDATE Users SET EntryToken = null WHERE Email = ?',
            [email],
            function(error) {
                if (error) {
                    console.error('Token expiration error: ' + error.message);
                }
            }
        );
    }, 60000 * 60);
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
    db.run('UPDATE Users SET EntryToken = $token WHERE Email = $email',
        {
            $email: email,
            $token: token
        },
        function(error) {
            if (error) {
                console.error(error.message); 
                return res.status(500).send('Internal server error');
            }
            expireInOneHour(email);
            res.status(200).send(token);
        }
    );   
}

const checkLogin = (req, res, pet, callback) => {
    const token = req.get('Authorization');
    db.get('SELECT * FROM Users WHERE EntryToken = ?',
        [token],
        (error, row) => {
            if (error) {
                console.error(error.message); 
                return res.status(500).send('Internal server error');
            }
            if (row) {
                callback(pet, res); 
            }
        }
    );
}

module.exports.router = loginRouter;
module.exports.checkLogin = checkLogin;