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
        FROM actvities;
    `);

    return rows;
};

async function getAllRoutines() {
    const { rows } = await client.query(`
        SELECT is, name
        FROM routines;
    `);

    return rows;
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



module.exports = {
  client,
  getAllUsers,
  getAllActivities,
  getAllRoutines,
  createUser,
  createActivity,
  createRoutine,
}
