const express = require('express');
const activitiesRouter = express.Router();
const { getAllActivities } = require('../db');

activitiesRouter.get('/', async (req, res) => {
    try {
        const activities = await getAllActivities();

        res.send({
            activities
        })
    } catch({name, message}) {
        next({name, message})
    }
})

module.exports = activitiesRouter;