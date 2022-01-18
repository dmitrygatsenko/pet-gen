const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const login = require('./login.js');

const PORT = process.env.PORT || 5000;

const db = new sqlite3.Database('./pets.db');

const petsRouter = express.Router();
app.use('/pets', petsRouter);
app.use('/auth', login.router);
app.use(login.verifyLogin);

petsRouter.get('/dog', (req, res) => {
    getRandomPet('dog', res);
});

petsRouter.get('/cat', (req, res) => { 
    getRandomPet('cat', res);
    //processRequest(req, res, 'cat');
});

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

