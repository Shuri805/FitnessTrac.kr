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
        SELECT *
        FROM activities;
    `);

    return rows;
};

async function getRoutineById(routineId) {
    try {
        const { rows: [routine] } = await client.query(`
            SELECT *
            FROM routines
            WHERE id=$1;
            `, [routineId]);

            if(!routine) {
                throw {
                    name: "RoutineNotFoundError",
                    message: "Could not find a routine with that routineId"
                }
            };

            const { rows: [activities] } = await client.query(`
                SELECT *
                FROM activities
                JOIN routine_activities ON activities.id=routine_activities."activityId"
                WHERE routine_activities."routineId"=$1;
                `, [routineId]);

            const { rows: [creator]} = await client.query(`
                SELECT id, username, name
                FROM users
                WHERE id=$1;
                `, [routine.creatorId]);

            routine.activities = activities;
            routine.creator = creator;

            delete routine.creatorId;

            return routine;
    } catch(error) {
        throw error;
    }
};

async function getActivityById(activityId) {
    try {
        const { rows: [activity]} = await client.query(`
            SELECT *
            FROM activities
            WHERE id=$1;
            `, [activityId]);

            if(!activity) {
                throw {
                    name: 'ActivityNotFoundError',
                    description: 'Could not find activity with that activityId'
                }
            };

            return activity;
    } catch(error) {
        throw error;
    }
};

async function getAllRoutines() {
    const { rows } = await client.query(`
        SELECT *
        FROM routines;
    `);

    return rows;
};

async function getPublicRoutines() {
    try {
        const { rows } = await client.query(`
            SELECT *
            FROM routines
            WHERE public=$1;
            `, ["true"]);

        return rows;
    } catch(error) {
        throw error;
    }
};

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

async function getUserByUsername(username) {
    try {
        const { rows: [user]} = await client.query(`
            SELECT *
            FROM users
            WHERE username=$1;
            `, [username]);

        console.log(user);
        return user;
    } catch (error) {
        console.error(error)
        throw error;
    }
};

async function createRoutineActivity({routineId, activityId, duration, count}) {
    try {
      const result = await client.query(`
      INSERT INTO routine_activities("routineId", "activityId", duration, count)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("routineId", "activityId") DO NOTHING;
      `, [routineId, activityId, duration, count]);

      return result;
    } catch (error) {
      throw error;
    }
  };

async function getAllRoutinesByUser(userId) {
    try {
        const { rows: routineIds } = await client.query(`
            SELECT id
            FROM routines
            WHERE "creatorId"=${userId};
            `);

        const routines = await Promise.all(routineIds.map(
            routine => getRoutineById( routine.id )
        ));

        return routines;
    } catch(error) {
        throw error;
    }
};

async function getPublicRoutinesByUser(userId) {
    try {
        const { rows : routineIds } = await client.query(`
            SELECT id
            FROM routines
            WHERE "creatorId"=${userId}
            AND public=$1;`, ["true"]);

        const routines = await Promise.all(routineIds.map(
            routine => getRoutineById( routine.id )
        ));

        return routines;
    } catch (error) {
        throw error;
    }
};

async function getPublicRoutinesByActivity(activityId) {
    try {
        const { rows: routineIds } = await client.query(`
            SELECT routines.id
            FROM routines
            JOIN routine_activities ON routines.id=routine_activities."routineId"
            JOIN activities ON activities.id=routine_activities."activityId"
            WHERE activities.name=$1
            AND public=$2;`, [activityId, "true"]);

            return await Promise.all(routineIds.map(
                routine => getRoutineById(routine.id)
            ));
    } catch(error) {
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
      (key, index) => `"${ key }"=$${ index + 1 }`
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

async function updateRoutineActivity( id, fields = {}) {
  const setString = Object.keys(fields).map(
    (key, index) => `${ key }=$${ index +1 }`
  ).join(', ');

  if(setString.length === 0) {
    return;
  }

  try {
    const{rows: [routine_activity]} = await client.query(`
    UPDATE routine_activities
    SET ${setString}
    WHERE "routineId"=${id}
    RETURNING *;
    `, Object.values(fields));

    // console.log('routine-activity>>>:', routine_activity);

    return routine_activity;
  } catch (error) {
    throw error;
  }
};

async function getUserById(userId) {
    try {
      const { rows: [ user ] } = await client.query(`
        SELECT id, username, name
        FROM users
        WHERE id=${ userId }
      `);
  
      if (!user) {
        return null
      }
  
      user.routines = await getAllRoutinesByUser(userId);
  
      return user;
    } catch (error) {
      throw error;
    }
};

async function addActivitytoRoutine(routineId, activityList){
  try {
    const createRoutineActivityPromises = activityList.map(
        activity => createRoutineActivity(routineId, activity.id)
    );

    await Promise.all(createRoutineActivityPromises)

    return await getRoutineById(routineId);
  } catch (error) {
    throw error;
  }
};

async function destroyRoutineActivity(id) {
    try {
        await client.query(`
            DELETE from routine_activities
            WHERE id=$1;
            `, [id]);

        return `DELETED ROUTINE_ACTIVITY NUMBER: ${id}`;
    } catch(error) {
        throw error;
    }
};

async function destroyRoutine(id) {
    try {
        await client.query(`
            DELETE FROM routines
            WHERE id=$1;
            `, [id]);

        return `DELETED ROUTINE NUMBER: ${id}`
    } catch(error) {
        throw error;
    }
};

module.exports = {
  client,
  getAllUsers,
  getUserByUsername,
  getAllActivities,
  getAllRoutines,
  createUser,
  createActivity,
  createRoutine,
  updateActivity,
  updateRoutine,
  addActivitytoRoutine,
  getRoutineById,
  getPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  updateRoutineActivity,
  createRoutineActivity,
  destroyRoutineActivity,
  destroyRoutine,
  getUserById,
  getActivityById,
}
