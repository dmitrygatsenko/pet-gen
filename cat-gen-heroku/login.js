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
        console.log(typeof token);
        db.run('INSERT OR FAIL INTO Users (Email, Password, EntryToken) VALUES ($email, $password, $token)',
            {
                $email: email,
                $password: password,
                $token: token
            },
            function(error) {
                if (error) {
                    console.log('INSERT ERROR');
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
    db.get('SELECT Email, Password, EntryToken FROM Users',
        [],
        (error, row) => {
            if (error) {
                console.error(error.message); 
                return res.status(500).send('Internal server error');
            }
            console.log('row.Email = ' + row.Email);
            console.log('row.Token = ' + row.EntryToken);
            console.log('row.Password = ' + row.Password);
            if (row) {
                callback(pet, res); 
            }
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