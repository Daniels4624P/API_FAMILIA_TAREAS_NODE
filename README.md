# Family Task & Finance Management API

## Description

This project is a Node.js API designed to help families manage household tasks, track personal and shared finances, and organize projects. It features user authentication, task management with points, financial record-keeping (incomes and expenses), and categorization.

## Features

*   User registration and authentication (JWT-based)
*   Task management:
    *   Create, assign, and track tasks
    *   Point system for tasks
    *   Task categorization using folders
*   Finance management:
    *   Track incomes and expenses
    *   Categorize financial transactions
    *   Manage multiple accounts
*   Project management for collaborative efforts.
*   Data export functionality for finances (integrates with a FastAPI service).
*   Pre-populatable list of common household tasks.

## Technologies Used

*   Node.js
*   Express.js
*   Sequelize (with PostgreSQL)
*   Passport.js (for authentication)
*   `@hapi/boom` (for HTTP-friendly error objects)
*   `axios` (for making HTTP requests, e.g., to FastAPI)
*   `bcrypt` (for password hashing)
*   `joi` (for data validation)
*   `jsonwebtoken` (for generating and verifying JWTs)
*   `nodemailer` (for sending emails, e.g., for account recovery or notifications)
*   `passport-jwt` & `passport-local` (Passport.js strategies for authentication)

## Setup and Installation

### Prerequisites

*   Node.js (version specified in package.json or latest LTS)
*   PostgreSQL

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/proyecto-familia-tareas-api.git
    cd proyecto-familia-tareas-api
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root of the project. You can copy the example structure from `.env.example` if it exists, or create it from scratch.
    Key variables to include:
    *   `PORT`: The port the application will run on.
    *   `NODE_ENV`: The environment (e.g., `development`, `production`).
    *   `USER_DB`: PostgreSQL database user.
    *   `DB_PORT`: PostgreSQL database port.
    *   `DB_PASSWORD`: PostgreSQL database password.
    *   `DB_NAME`: PostgreSQL database name.
    *   `DB_HOST`: PostgreSQL database host.
    *   `JWT_SECRET`: Secret key for JWT generation and verification.
    *   `SMTP_EMAIL`: Email address for sending emails (e.g., password recovery).
    *   `SMTP_PASS`: Password for the email account.
    *   `URL_FASTAPI`: Base URL for the FastAPI service used for financial data export.
    (You can create a `.env` file by copying `.env.example` if available, or create it manually.)

4.  **Set up the database:**
    Ensure your PostgreSQL server is running and configured with the credentials from your `.env` file.
    Run database migrations:
    ```bash
    npm run migrations:run
    ```

## Running the Application

*   **Development mode (with auto-reloading):**
    ```bash
    npm run dev
    ```
*   **Production mode:**
    ```bash
    npm run start
    ```
The application will be accessible at `http://localhost:<PORT>`.

## API Endpoints

This project provides a RESTful API for managing tasks, projects, user authentication, personal and shared finances, and related categorizations.
Key route groups include:
*   `/api/v1/users`
*   `/api/v1/auth`
*   `/api/v1/tasks`
*   `/api/v1/projects`
*   `/api/v1/folders`
*   `/api/v1/categories`
*   `/api/v1/incomes`
*   `/api/v1/expenses`
*   `/api/v1/accounts`

For detailed information on specific endpoints, please refer to the files in the `routes/` directory.

The API also includes a special endpoint:
*   `POST /rellenar`: Populates the database with a predefined list of common household tasks.
*   `GET /finances/export`: Exports financial data to a CSV file, interacting with a FastAPI backend. Requires JWT authentication. Query parameters: `year`, `month`, `type` (`public` or `private`).

## Database Migrations

This project uses Sequelize-CLI for managing database schema changes.

*   **Generate a new migration:**
    ```bash
    npm run migrations:generate --name <your_migration_name>
    ```
*   **Run all pending migrations:**
    ```bash
    npm run migrations:run
    ```
*   **Revert the last migration:**
    ```bash
    npm run migrations:revert
    ```
*   **Revert all migrations:**
    ```bash
    npm run migrations:delete
    ```

## (Optional) Contributing

Contributions are welcome! Please follow these general steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a Pull Request.

Please ensure your code adheres to any existing styling and that tests pass (if applicable).

```
