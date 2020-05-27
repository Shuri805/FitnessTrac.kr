async function createTables() {
  try {
    console.log("Starting to build tables...");    

    await client.query(`
            CREATE TABLE users (
              id SERIAL PRIMARY KEY,
              username varchar(255) UNIQUE NOT NULL,
              password varchar(255) NOT NULL,
              name varchar(255) NOT NULL,
            );

            CREATE TABLE activities (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) UNIQUE NOT NULL,
              description TEXT NOT NULL,
            );

            CREATE TABLE routines (
              id SERIAL PRIMARY KEY,
              "creatorId" INTEGER FOREIGN KEY,
              public BOOLEAN DEFAULT false,
              name VARCHAR(255) UNIQUE NOT NULL,
              goal TEXT NOT NULL
            );

            CREATE TABLE routine_activities (
              id SERIAL PRIMARY KEY,
              "routineId" INTEGER FOREIGN KEY,
              "activityId" INTEGER FOREIGN KEY,
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
      DROP TABLE IF EXISTS routines;
      DROP TABLE IF EXISTS activities;
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
};

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
