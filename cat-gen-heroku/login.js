const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const sqlite3 = require('sqlite3');

const loginRouter = express.Router();

const db = new sqlite3.Database('./login.db', (error) => {
    if (error) {
      console.error(error.message);
    }
    console.log('Connected to the database.');
});

loginRouter.post('/register', express.urlencoded({ extended: true}), express.json(), async (req, res) => {
    //const body = JSON.parse(bodyData);
    console.log('req.body.email = ' + req.body.email);
    console.log('req.body.password = ' + req.body.password);
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, /**saltRounds*/10);
    //const token = makeToken(10);
    try {
        await db.run(
            'INSERT OR FAIL INTO Users (Email, Password) VALUES ($email, $password)',
            {
                $email: email,
                $password: password//,
                //$token: token
            }
        )
    }
    catch (error) {
        console.error(error.message);
        return res.status(409).send(error.message);
    }
    // Create token
    const token = 
    res.status(201).send(createToken({email}, process.env.TOKEN_KEY, "2h"));
});

loginRouter.post('/login', express.json(), async (req, res) => {
    // const body = JSON.parse(bodyData);
    const { email, password } = req.body;
    //await bcrypt.hash(req.body.password, /**saltRounds*/10);

    //check whether user exists
    let user;
    try {
        user = await db.get(
            'SELECT * FROM Users WHERE Email = ?',
            [email]
        )
        if (!user) {
            return res.status(401).send('Invalid email');
        }
        if (user && (await bcrypt.compare(password, user.Password))) {
            return res.status(200).send(createToken({email}, process.env.TOKEN_KEY, "2h"));
        }
        return res.status(401).send('Invalid Credentials');
    }
    catch (error) {
        console.error(error.message); 
        return res.status(500).send(error.message);
    }
    
    //updateToken(email, res);
});

const createToken = (obj, secret, expiration) => {
    return jwt.sign(
        obj,
        secret,
        {
            expiresIn: expiration,
        }
    );
}

// const expireInOneHour = (email) => {
//     setTimeout(() => {
//         db.run('UPDATE Users SET EntryToken = null WHERE Email = ?',
//             [email],
//             function(error) {
//                 if (error) {
//                     console.error('Token expiration error: ' + error.message);
//                 }
//             }
//         );
//     }, 60000 * 60);
// }

// const makeToken = length => {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//         result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
// }

// const updateToken = (email, res) => {
//     const token = makeToken(10);
//     db.run('UPDATE Users SET EntryToken = $token WHERE Email = $email',
//         {
//             $email: email,
//             $token: token
//         },
//         function(error) {
//             if (error) {
//                 console.error(error.message); 
//                 return res.status(500).send('Internal server error');
//             }
//             expireInOneHour(email);
//             res.status(200).send(token);
//         }
//     );   
// }

const verifyLogin = (req, res, next) => {
    const token = req.get('Authorization');
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        jwt.verify(token, process.env.TOKEN_KEY);
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
    
    // db.get('SELECT * FROM Users WHERE EntryToken = ?',
    //     [token],
    //     (error, row) => {
    //         if (error) {
    //             console.error(error.message); 
    //             return res.status(500).send('Internal server error');
    //         }
    //         if (row) {
    //             callback(pet, res); 
    //         }
    //     }
    // );
}

module.exports.router = loginRouter;
module.exports.verifyLogin = verifyLogin;