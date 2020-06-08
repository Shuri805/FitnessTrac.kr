const { client,
  getAllUsers,
  getUserByUsername,
  getAllActivities,
  getAllRoutines,
  createUser,
  createActivity,
  createRoutine,
  updateActivity,
  updateRoutine,
  getRoutineById,
  getPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  updateRoutineActivity,
  createRoutineActivity,
  destroyRoutineActivity,
  getUserById,
  getActivityById,
} = require('./index');

async function testDB() {
  try {
    const users = await getAllUsers();
    // console.log('getAllUsers:', users);

    const [activity] = await getAllActivities();
    const updateActivityResult = await updateActivity(activity.id, {
      name: 'Biking',
      description: 'Ride a bike'
    });
    // console.log('updateActivityResult:', updateActivityResult);

    const [routine] = await getAllRoutines();
    const updateRoutineResult = await updateRoutine(routine.id, {
     public: true,
     name: 'cardio',
     goal: '30 mins',
    });
    // console.log('updateRoutineResult', updateRoutineResult);

    const requestedRoutine = await getRoutineById(1);
    // console.log('getRoutineById>>>>>>>>>>:', requestedRoutine);

    const publicRoutines = await getPublicRoutines();
    // console.log('getPublicRoutines>>>>>>>>>:', publicRoutines);

    const userRoutines = await getAllRoutinesByUser(1);
    // console.log('getAllRoutinesByUser>>>>>:', userRoutines);

    const publicUserRoutines = await getPublicRoutinesByUser(1);
    // console.log('getPublicRoutinesByUser>>>>:', publicUserRoutines);

    const publicRoutineActivity = await getPublicRoutinesByActivity(2);
    console.log('getPublicRoutineByActivity>>>>>:', publicRoutineActivity);

    const newRoutineActivity = await updateRoutineActivity(1, {
      duration: 15,
      count: 10,
    });
    // console.log('updateRoutineActivity>>>>', newRoutineActivity);

    const deleteRA = await destroyRoutineActivity(1);
    // console.log('destroyRoutineActivity:', deleteRA);

    const gottenActivity = await getActivityById(1);
    // console.log('getActivityById:', gottenActivity);

    console.log('finished testing DB');
  } catch (error) {
    console.error(error);
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
            CREATE TABLE users (
              id SERIAL PRIMARY KEY,
              username varchar(255) UNIQUE NOT NULL,
              password varchar(255) NOT NULL,
              name varchar(255) NOT NULL
            );
            CREATE TABLE activities (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) UNIQUE NOT NULL,
              description TEXT NOT NULL
            );
            CREATE TABLE routines (
              id SERIAL PRIMARY KEY,
              "creatorId" INTEGER,
              FOREIGN KEY("creatorId") REFERENCES users(id),
              public BOOLEAN DEFAULT false,
              name VARCHAR(255) UNIQUE NOT NULL,
              goal TEXT NOT NULL
            );
            CREATE TABLE routine_activities (
              id SERIAL PRIMARY KEY,
              "routineId" INTEGER,
              FOREIGN KEY("routineId") REFERENCES routines(id),
              "activityId" INTEGER,
              FOREIGN KEY("activityId") REFERENCES activities(id),
              duration INTEGER,
              count INTEGER,
              UNIQUE ("routineId", "activityId")
            );
          `);

          console.log('Finished building tables');
  } catch(error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    // have to make sure to drop in correct order
    await client.query(`
      DROP TABLE IF EXISTS routine_activities;
      DROP TABLE IF EXISTS activities;
      DROP TABLE IF EXISTS routines;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
};

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialActivity();
    await createInitialRoutine();
    await createInitialRoutineActivity();
  } catch (error) {
    console.error(error);
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    await createUser({
      username: 'albert',
      password: 'bertie99',
      name: 'Al Bert',
    });
    await createUser({
      username: 'sandra',
      password: '2sandy4me',
      name: 'Just Sandra',
    });
    await createUser({
      username: 'glamgal',
      password: 'soglam',
      name: 'Joshua',
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
};

async function createInitialActivity() {
  try {
    console.log("Starting to create activity...");

    await createActivity({
      name: "exercise",
      description: "jogging"
    });

    await createActivity({
      name: "swim",
      description: "swim in the pool"
    });

    await createActivity({
      name: "volleyball",
      description: "play volleyball"
    });

    console.log("Finished creating activity!");

  } catch (error) {
    console.error("Error creating activity!")
    throw error;
  }
}

async function createInitialRoutine() {
  try {
    const [albert, sandra, glamgal] = await getAllUsers();

    console.log("Starting to create routine...");

    await createRoutine({
      creatorId: albert.id,
      public: "true",
      name: "leg day",
      goal: "30 reps",
    });

    await createRoutine({
      creatorId: albert.id,
      public: "true",
      name: "back day",
      goal: "20 reps",
    });

    await createRoutine({
      creatorId: sandra.id,
      public: "true",
      name: "arm day",
      goal: "100 reps",
    });

    await createRoutine({
      creatorId: glamgal.id,
      public: "true",
      name: "chest day",
      goal: "10 reps",
    });

    console.log("Finished creating routine!");

  } catch (error) {
    console.error("Error creating routine!")
    throw error;
  }
};

async function createInitialRoutineActivity() {
  try {
    console.log('Creating Routine Activities');

    await createRoutineActivity({
      routineId: 1,
      activityId: 1,
      duration: 10,
      count: 100,
    });

    console.log('Finished adding to Routine');
  } catch(error) {
    throw error;
  }
};

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(()=> client.end());
