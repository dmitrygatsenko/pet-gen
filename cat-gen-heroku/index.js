const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;
// Use static server to serve the Express Yourself Website
// app.use(express.static('public'));

const petsRouter = express.Router();
app.use('/pets', petsRouter);
    
let dogs = [
    'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=1200:*',
    'https://i.guim.co.uk/img/media/684c9d087dab923db1ce4057903f03293b07deac/205_132_1915_1150/master/1915.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=14a95b5026c1567b823629ba35c40aa0'
];
let cats = [
    'https://www.humanesociety.org/sites/default/files/styles/1240x698/public/2020-07/kitten-510651.jpg?h=f54c7448&itok=ZhplzyJ9',
    'https://images.unsplash.com/photo-1615789591457-74a63395c990?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZG9tZXN0aWMlMjBjYXR8ZW58MHx8MHx8&w=1000&q=80',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv7t4GtTX9MDwzbf67MQFaM6fxiQUZ4FImvg&usqp=CAU'
];

petsRouter.get('/dog', (req, res) => {
    res.send(dogs[getRandomIndex(2)]);
});

petsRouter.get('/cat', (req, res) => {
    res.send(dogs[getRandomIndex(3)]);
});

const getRandomIndex = (base) => {
    return Math.floor(Math.random() * base);
}

// Get a single animal
// animalsRouter.get('/:id', (req, res, next) => {
// const animal = getElementById(req.params.id, animals);
// if (animal) {
//     res.send(animal);
// } else {
//     res.status(404).send();
// }
// });

// Create an animal
// animalsRouter.post('/', (req, res, next) => {
// const receivedAnimal = createElement('animals', req.query);
// if (receivedAnimal) {
//     animals.push(receivedAnimal);
//     res.status(201).send(receivedAnimal);
// } else {
//     res.status(400).send();
// }
// });

// // Update an animal
// animalsRouter.put('/:id', (req, res, next) => {
// const animalIndex = getIndexById(req.params.id, animals);
// if (animalIndex !== -1) {
//     updateElement(req.params.id, req.query, animals);
//     res.send(animals[animalIndex]);
// } else {
//     res.status(404).send();
// }
// });

// // Delete a single animal
// animalsRouter.delete('/:id', (req, res, next) => {
// const animalIndex = getIndexById(req.params.id, animals);
// if (animalIndex !== -1) {
//     animals.splice(animalIndex, 1);
//     res.status(204).send();
// } else {
//     res.status(404).send();
// }
// });

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});

module.exports = petsRouter;
