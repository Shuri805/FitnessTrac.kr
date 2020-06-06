const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser } = require('../db');
const jwt = require('jsonwebtoken');
// const {JWT_SECRET} = process.env;

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");
  
    next();
  });

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
      next({
        name: "MissingCredentialsError",
        message: "Please supply both a username and password"
      });
    }

    try {
      const user = await getUserByUsername(username);

      const token = jwt.sign({
        id: user.id,
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });

      if (user && user.password == password) {
        res.send({ message: "you're logged in!", token: token });
      } else {
        next({
          name: 'IncorrectCredentialsError',
          message: 'Username or password is incorrect'
        });
      }
    } catch(error) {
      console.log(error);
      next(error);
    }
  });

  usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name } = req.body;
    console.log('userInfo:', req.body);

    try {
      const _user = await getUserByUsername(username);

      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      }

      const user = await createUser({
        username,
        password,
        name,
      });

      const token = jwt.sign({
        id: user.id,
        username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });

      res.send({
        message: "thank you for signing up",
        token
      });
    } catch ({ name, message }) {
      next({ name, message })
    }
  });

  usersRouter.get('/', async (req, res) => {
      const users = await getAllUsers();
      console.log(req);

    res.send({
      users
    });
  });

//   usersRouter.get('/:username/routines', async (req, res, next) => {
//     console.log('hello');
//     console.log(req.params.username);
//   try {
//     const routines = await getPostsByTagName(req.params.tagName);
//     res.send({posts});
//   } catch ({ name, message }) {
//     next({
//       name: 'Error',
//       messgage: 'ERROR'
//     })
//   }
// });

  module.exports = usersRouter;
