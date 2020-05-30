const { Client } = require('pg'); // imports the pg module

const client = new Client('postgres://localhost:5432/fitness-dev');

async function getAllUsers() {
    const { rows } = await client.query(
      `SELECT id, username, name
      FROM users;
    `);

    return rows;
};

async function getAllActivities() {
    const { rows } = await client.query(`
        SELECT id, name
        FROM activities;
    `);

    return rows;
};

async function getAllRoutines() {
    const { rows } = await client.query(`
        SELECT id, name
        FROM routines;
    `);

    return rows;
};

// async function getPublicRoutines() {
//     const { rows } = await client.query(`
//       SELECT id, name
//       FROM routines;
//     `)
// }

async function createUser({ username, password, name}) {
    try {
        const result = await client.query(`
            INSERT INTO users (username, password, name)
            VALUES ($1, $2, $3);
        `, [username, password, name]);

        return result;
    } catch(error) {
        throw error;
    }
};

async function createActivity({ name, description }) {
  try {
    const result = await client.query(`
      INSERT INTO activities (name, description)
      VALUES ($1, $2);
      `, [name, description]);

      return result;
  } catch (error) {
      throw error;
  }
};

async function createRoutine({ creatorId, public, name, goal }) {
  try {
    const result = await client.query(`
    INSERT INTO routines ("creatorId", public, name, goal)
    VALUES ($1, $2, $3, $4);
    `, [creatorId, public, name, goal]);

    return result;
  } catch (error) {
      throw error;
  }
};

async function updateActivity(id, fields = {}) {
  const setString = Object.keys(fields).map(
      (key, index) => `"${key}"=$${ index + 1 }`
  ).join(', ');

  if(setString.length === 0) {
      return;
  }

  try {
      const { rows: [activity] } = await client.query(`
          UPDATE activities
          SET ${setString}
          WHERE id=${id}
          RETURNING *;
      `, Object.values(fields));

      return activity;
  } catch(error) {
      throw error;
  }
};

async function updateRoutine(id, fields = {}) {
  const setString = Object.keys(fields).map(
      (key, index) => `"${key}"=$${ index + 1 }`
  ).join(', ');

  if(setString.length === 0) {
      return;
  }

  try {
    const {rows: [routine] } = await client.query(`
      UPDATE routines
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `, Object.values(fields));

      return routine;
  } catch (error) {
    throw error;
  }
};

async function createRoutineActivity(routineId, activityId) {
  try {
    await client.query(`
    INSERT INTO routine_activities("routineId", "activityId")
    VALUES ($1, $2)
    ON CONFLICT ("routineId", "activityId") DO NOTHING;
    `,[ routineId, activityId]);
  } catch (error) {
    throw error;
  }
}

async function addActivitytoRoutine(routineId, activityList){
  try {
    const createRoutineActivityPromises = activityList.map(activity=> createRoutineActivity(routineId, activity.id)
    );

    await Promise.all(createRoutineActivityPromises)

    return await getRoutineById(routineId);
  } catch (error) {

  }
}



module.exports = {
  client,
  getAllUsers,
  getAllActivities,
  getAllRoutines,
  createUser,
  createActivity,
  createRoutine,
  updateActivity,
  updateRoutine,
}
