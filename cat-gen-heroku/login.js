const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const sqlite3 = require('sqlite3');

const loginRouter = express.Router();

const TOKEN_KEY="h23iteriojh0lmnjhrtrfdsewjk671"

const db = new sqlite3.Database('./login.db', (error) => {
    if (error) {
      console.error(error.message);
    }
    console.log('Connected to the database.');
});

loginRouter.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const passwordCrypted = await bcrypt.hash(password, /**saltRounds*/10);
    try {
        await db.run(
            'INSERT OR FAIL INTO Users (Email, Password) VALUES ($email, $password)',
            {
                $email: email,
                $password: passwordCrypted
            }
        )
    }
    catch (error) {
        console.error(error.message);
        return res.status(409).send(error.message);
    }
    res.status(201).send(createToken({email}, TOKEN_KEY, "2h"));
});

loginRouter.post('/login', express.json(), async (req, res) => {
    const { email, password } = req.body;
    let user;
    try {
        user = await db.get(
            'SELECT * FROM Users WHERE Email = ?',
            [email]
        )
        if (!user) {
            return res.status(401).send('Invalid email');
        }
        console.log('user.Password = ' + user.Password)
        if (user && (await bcrypt.compare(password, user.Password))) {
            return res.status(200).send(createToken({email}, TOKEN_KEY, "2h"));
        }
        return res.status(401).send('Invalid Credentials');
    }
    catch (error) {
        console.error(error.message); 
        return res.status(500).send(error.message);
    }
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

const verifyLogin = (req, res, next) => {
    const token = req.get('Authorization');
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        jwt.verify(token, TOKEN_KEY);
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
}

module.exports.router = loginRouter;
module.exports.verifyLogin = verifyLogin;