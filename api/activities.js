const express = require('express');
const activitiesRouter = express.Router();
const { getAllActivities, createActivity, updateActivity, getActivityById, getPublicRoutinesByActivity, } = require('../db');
const { requireUser } = require('./utils');

activitiesRouter.get('/', async (req, res) => {
    try {
        const activities = await getAllActivities();

        res.send({
            activities
        })
    } catch({name, message}) {
        next({name, message})
    }
});

activitiesRouter.post('/', requireUser, async (req, res, next) => {
    const { name, description } = req.body;
  
    const activityData = {name, description};
  
    try {
  
      const activity = await createActivity(activityData);
  
      if(activity) {
        res.send({activity});
      } else {
        next({
          name: 'Activity Error',
          message: 'Error!!!!'
        })
      }
  
    } catch ({ name, message }) {
      next({ name, message });
    }
});

activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
    const {activityId} = req.params;
    const {name, description} = req.body;

    const updateFields = {};

    if(name) {
      updateFields.name = name;
    };

    if(description) {
      updateFields.description = description;
    };

    try {
      const originalActivity = await getActivityById(activityId);
    
      if(originalActivity) {
        const updatedActivity = await updateActivity(activityId, updateFields);
        res.send({ activity: updatedActivity});
      } else {
        next({
          name: 'Error',
          description: 'You cannot update activity'
        })
      }
    } catch({name, message}) {
      next({name, message});
    }
});

activitiesRouter.get('/:activityId', async(req, res) => {

  const activity = await getActivityById(req.params.activityId);
  // console.log('activityId', activity.id)
  res.send({activity});
});  

activitiesRouter.get('./:activityId/routines', requireUser, async (req, res, next) => {
  const activity = await getActivityById(req.params.activityId);
  console.log(activity.id);
  try {
    const publicRoutineActivities = await getPublicRoutinesByActivity(activity.id);
    res.send({publicRoutineActivities});
  } catch ({name, message}) {
    next({
      name: 'Error',
      message: 'ERROR in activitesRouter!!!'
    })
  }
});

module.exports = activitiesRouter;