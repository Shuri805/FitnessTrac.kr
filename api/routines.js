const express = require('express');
const routinesRouter = express.Router();
const { getAllRoutines, createRoutine, getRoutineById, updateRoutine } = require('../db');
const { requireUser } = require('./utils');

routinesRouter.use((req, res, next) => {
    console.log("A request is being made to /routines");
  
    next(); 
});

routinesRouter.post('/', requireUser, async (req, res, next) => {
  const { creatorId, name, goal, public } = req.body;

  const routineData = {creatorId , public, name, goal};

  try {

    const routine = await createRoutine(routineData);

    if(routine) {
      res.send({routine});
    } else {
      next({
        name: 'Routine Error',
        message: 'Error!!!!'
      })
    }

  } catch ({ name, message }) {
    next({ name, message });
  }
});

routinesRouter.patch('/:routineId', requireUser, async (req, res, next) => {
  const {routineId} = req.params;
  const {public, name, goal} = req.body;

  const updateFields = {};

  if(public) {
    updateFields.public = public;
  };

  if(name) {
    updateFields.name = name;
  };

  if(goal) {
    updateFields.goal = goal;
  };

  try {
    const originalRoutine = await getRoutineById(routineId);

    if(originalRoutine) {
      const updatedRoutine = await updateRoutine(routineId, updateFields);
      res.send({routine: updatedRoutine});
    } else {
      next({
        name: 'Error', 
        description: 'You cannot update routine'
      })
    }
  } catch({name, message}) {
    next({name, message})
  }
});

routinesRouter.delete('/routineId', requireUser, async (req, res, next) => {
    try {
      const routine = await getRoutineById(req.params.routineId);

      if(routine) {
        res.send({routine});
      } else {
        next({
          name: 'Error',
          message: 'Error deleting routine'
        })
      }
    } catch({name, message}) {
      next({name, message})
    }
});

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