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

module.exports = {
  client,
  getAllUsers,
  getAllActivities,
  getAllRoutines,
  createUser,
}
