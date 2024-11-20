# Codes for Tomorrow - Interview Project Setup

This document provides a detailed guide for setting up and running the Codes for Tomorrow interview project. The project utilizes JavaScript, Node.js, and PostgreSQL with Sequelize ORM.

## Prerequisites

Before starting, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (version 14 or above)
- [PostgreSQL](https://www.postgresql.org/) database
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Project Setup

Follow the steps below to set up the project:

### Step 1: Initialize the Project

Run the following command to initialize a new Node.js project and generate the `package.json` file:

````bash
npm init -y

Step 2: Generate the Express Application

```bash
npx express-generator --ejs

Step 3: Install Project Dependencies
```bash
npm install

Step 4: Install Additional Packages
```bash
npm install sequelize pg pg-hstore

Step 5: Configure PostgreSQL Database
```bash
{
    "DB_USER": "your-username",
    "DB_PASSWORD": "your-password",
    "DB_DATABASE": "your-database-name",
    "DB_HOST": "127.0.0.1",
    "dialect": "postgres"
}


Step 6: Sync Sequelize Models
```bash
In app.js, you should uncomment the following line to sync the Sequelize models with your PostgreSQL database:

/*db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synced.");
}); */


API Endpoints
The project includes the following key API endpoints for user authentication:

Make sure your PostgreSQL server is running before starting the project.
To test the endpoints, you can use tools like Postman or Insomnia.
Ensure that JWT tokens are securely stored and handled on the client side.

Conclusion
This setup should help you get the project up and running quickly. If you encounter any issues or have questions, feel free to reach out to the project team.
```bash
email [parvind06@gmail.com]



