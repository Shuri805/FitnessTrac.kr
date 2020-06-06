const express = require('express');
const routinesRouter = express.Router();
const { getAllRoutines, createRoutine } = require('../db');
const { requireUser } = require('./utils');

routinesRouter.use((req, res, next) => {
    console.log("A request is being made to /routines");
  
    next(); 
});

// routinesRouter.post('/', requireUser, async (req, res, next) => {
//   const { name, goal, activities = '' } = req.body;

//   const tagArr = tags.trim().split(/\s+/)
//   const postData = {authorId: req.user.id, title, content};

//   // only send the tags if there are some to send
//   if (tagArr.length) {
//     routineData.tags = tagArr;
//   }

//   try {

//     const post = await createRoutine(routineData);

//     if(routine) {
//       res.send({routine});
//     } else {
//       next({
//         name: 'Routine Error',
//         message: 'Error!!!!'
//       })
//     }

//   } catch ({ name, message }) {
//     next({ name, message });
//   }
// });

routinesRouter.get('/', async (req, res) => {
    try {
      const routines = await getAllRoutines();

      res.send({
        routines
      });
    } catch ({ name, message }) {
      next({ name, message });
    }
});

module.exports = routinesRouter;