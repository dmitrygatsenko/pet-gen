const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const login = require('./login.js');

const PORT = process.env.PORT || 5000;

const db = new sqlite3.Database('./pets.db');

const petsRouter = express.Router();
app.use('/pets', petsRouter);
app.use('/login', login.router);

petsRouter.get('/dog', (req, res) => {
    processRequest(req, res, 'dog');
});

petsRouter.get('/cat', (req, res) => { 
    processRequest(req, res, 'cat');
});

const processRequest = (req, res, pet) => {
    //let bodyData = '';
    const token = req.header('Authorization');
    db.get('SELECT Email FROM Users WHERE Token = $token',
        {
            $token: token
        },
        (error, row) => {
            if (error) {
                return res.status(500).send('Internal server error');
            }
            if (row) {
                getRandomPet(pet, res);                   
            }
            else {
                res.status(404).send();
            }
        }
    );
    //getRandomPet(pet, res);
    // req.on('data', (data) => {
    //     bodyData += data;
    // });
    // req.on('end', () => {
    //     const body = JSON.parse(bodyData);
    //     const email = body.email;
    //     const password = body.password;
    //     const token = body.token;
    //     db.get('SELECT Email, Token FROM Users WHERE Email = $email',
    //         {
    //             $email: email
    //         },
    //         (error, row) => {
    //             if (error) {
    //                 return res.status(500).send('Internal server error');
    //             }
    //             if (row.Token) {
    //                 if (row.Token == token) {
    //                     getRandomPet(pet, res);
    //                 }                      
    //             }
    //             else {
    //                 res.status(401).send();
    //             }
    //         }
    //     );
    // });
}

const getRandomPet = (pet, res) => {
    db.all(
        "SELECT url FROM Pets WHERE pet = $pet",
        { $pet : pet },
        (err, rows) => {
            if (err) {
                return res.status(500).send(err.message)
            }
            res.send(rows[getRandomIndex(rows.length)].url)
        }
    )
}

const getRandomIndex = (base) => {
    return Math.floor(Math.random() * base);
}

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});

