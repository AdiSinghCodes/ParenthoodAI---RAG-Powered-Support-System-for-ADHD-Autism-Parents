## Introduction and Overview

**ParenthoodAi** is a Generative AI web application designed to support and guide parents of children with ADHD and autism. It aims to provide advice and assistance, simulating a doctor's consultation, across multiple languages, including English and various Indian languages (Hindi, Tamil, Bengali, etc., supporting up to 20 languages). The application accepts input via text and speech and provides output in the same modalities.

**Target Audience:** Parents of children diagnosed with ADHD and/or autism.

**Core Workflow:**

1.  **User Authentication:** Parents log in or sign up on the platform.
2.  **Profile Management:** They create or update profiles, including their information and detailed information about their child (e.g., specific conditions, observed behaviors, challenges).
3.  **Personalized Guidance:** Based on this comprehensive profile and ongoing conversations, the AI system offers personalized guidance and support.
4.  **Interactive Activities for Children:** The application also features an "Activities" section with interactive content designed for children, teaching them about important topics like road safety, good touch vs. bad touch, and identifying dangerous objects.

## Key Features

*   **User Authentication:** Secure login and signup functionality for parents.
*   **Comprehensive Profile Management:** Ability for parents to create and manage detailed profiles for themselves and their children, including specific information about the child's condition (ADHD/autism), observed behaviors, and challenges.
*   **AI-Powered Guidance System:** Provides personalized advice and support based on user profiles and conversations.
    *   **Multi-lingual Support:** Offers guidance in English and up to 20 Indian languages.
    *   **Multi-modal Interaction:** Accepts input via text and speech, and delivers output in both formats.
*   **Interactive Activities Section:** Engaging activities designed for children to learn about:
    *   Road safety
    *   Good touch vs. bad touch
    *   Identifying and avoiding dangerous objects
*   **MongoDB Integration:** Utilizes MongoDB for storing user data, profiles, and conversation history.
*   **Neo4j Knowledge Graph:** Employs Neo4j to build a knowledge graph, representing entities and their relationships for advanced data reasoning and querying.
*   **Qdrant Vector Database:** Uses Qdrant for storing vector embeddings generated from unstructured data (text, etc.), enabling efficient semantic search and similarity matching for the AI guidance system.

## Technology Stack

*   **Frontend:** Vite, React (with TypeScript), Shadcn UI, Tailwind CSS
*   **Backend:** Node.js, Express.js (with TypeScript)
*   **Databases:**
    *   **MongoDB:** Primary data storage for user profiles, application data.
    *   **Neo4j:** For constructing and querying a knowledge graph.
    *   **Qdrant:** Vector database for semantic search and similarity matching.
*   **AI/ML:**
    *   **Generative AI:** Core for providing guidance and responses. Leverages models via Groq API and Google Gemini.
*   **Containerization:** Docker & Docker Compose (for managing database services like Neo4j, Qdrant, and MongoDB).

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm (comes with Node.js) or yarn
*   Docker and Docker Compose (for running database services, see Docker Setup section)

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd <YOUR_PROJECT_DIRECTORY_NAME>
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the `backend` directory (`backend/.env`) and add the following variables. Replace placeholder values with your actual configuration.
    ```env
    PORT=5000
    MONGODB_URI=mongodb://admin:admin@localhost:27017/bharatgen?authSource=admin # Or your MongoDB connection string
    JWT_SECRET=your_super_secret_jwt_key_change_this
    ```
    *Note: The `MONGODB_URI` should point to your MongoDB instance, which can be run via Docker (see Docker Setup).*

5.  **Start the backend development server:**
    ```bash
    npm run dev
    ```
    The backend server should now be running, typically on `http://localhost:5000`.

### Frontend Setup

1.  **Navigate to the root project directory** (if you are in the `backend` directory, go back one level `cd ..`):
    ```bash
    # Ensure you are in the project's root directory
    ```

2.  **Install dependencies:**
    ```bash
    npm install 
    # or 'npm i'
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root project directory (`./.env`) and add the following variables. Obtain necessary API keys and credentials.
    ```env
    VITE_GROQ_API_KEY=your_groq_api_key
    VITE_QUADRANT_HOST=http://localhost:6333
    VITE_NEO4J_URL=bolt://localhost:7687
    VITE_NEO4J_USERNAME=admin # Or your Neo4j username
    VITE_NEO4J_PASSWORD=admin # Or your Neo4j password
    VITE_MONGODB_URI=mongodb://admin:admin@localhost:27017/bharatgen?authSource=admin # This is often the backend API endpoint or a direct DB link if frontend uses it directly. Clarify usage.
    ```
    *Note: The database URLs and credentials should match your Dockerized services setup (see Docker Setup section).*

4.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend development server will start, typically on `http://localhost:5173` (Vite's default) or another specified port. You can access the application in your browser.

## Docker Setup for Services

This project uses Docker to simplify the setup and management of backend services: MongoDB, Neo4j, and Qdrant. The `docker-compose.neo.yml` file is configured to run these services.

### Prerequisites

*   Docker (latest version recommended)
*   Docker Compose (usually comes with Docker Desktop)

### Running Services with Docker Compose

1.  **Ensure Docker is running** on your machine.

2.  **Navigate to the root directory** of the cloned project where `docker-compose.neo.yml` is located.

3.  **Start the services** using Docker Compose:
    ```bash
    docker-compose -f docker-compose.neo.yml up -d
    ```
    This command will download the necessary images (if not already present) and start the containers for MongoDB, Neo4j, and Qdrant in detached mode (`-d`).

    *   **MongoDB** will be accessible on port `27017`.
    *   **Neo4j Browser** will be accessible at `http://localhost:7474`, and the Bolt protocol on port `7687`.
    *   **Qdrant** will be accessible on port `6333` (gRPC) and `6334` (HTTP).

### Credentials and Configuration

**Important:** The `docker-compose.neo.yml` file sets default credentials for Neo4j and MongoDB.

*   **Neo4j:**
    *   The default credentials are set via the environment variable `NEO4J_AUTH: admin/admin` in `docker-compose.neo.yml`. This means the username is `admin` and the password is `admin`.
    *   If you modify these credentials in `docker-compose.neo.yml`, you **must** update your frontend environment variables (`VITE_NEO4J_USERNAME`, `VITE_NEO4J_PASSWORD`) accordingly. If the backend also directly connects to Neo4j, ensure its configuration is also updated.

*   **MongoDB:**
    *   The default root credentials are set via `MONGO_INITDB_ROOT_USERNAME: "admin"` and `MONGO_INITDB_ROOT_PASSWORD: "admin"` in `docker-compose.neo.yml`.
    *   Your backend application's `MONGODB_URI` (in `backend/.env`) should use these credentials to connect to the Dockerized MongoDB instance. For example:
        `MONGODB_URI=mongodb://admin:admin@localhost:27017/bharatgen?authSource=admin`
        The `authSource=admin` query parameter is important for MongoDB to authenticate against the `admin` database where the root user is created.

*   **Qdrant:**
    *   Qdrant is currently configured without explicit authentication in the `docker-compose.neo.yml`. Ensure your application's connection URI (`VITE_QUADRANT_HOST`) points to `http://localhost:6333` (or `http://localhost:6334` for REST API).

### Application Connection

Once these services are running via Docker, your locally run frontend and backend applications (started via `npm run dev` as described in the "Getting Started" section) will be able to connect to them using the specified hostnames and ports (e.g., `localhost:27017` for MongoDB).

### Stopping Services

To stop the Docker Compose services, run:
```bash
docker-compose -f docker-compose.neo.yml down
```
To stop and remove volumes (all data will be lost):
```bash
docker-compose -f docker-compose.neo.yml down -v
```

## Environment Variables

This project requires several environment variables to be configured for the frontend and backend to function correctly. Create `.env` files as specified in the "Getting Started" section.

### Backend Environment Variables

File: `backend/.env`

*   `PORT`: The port on which the backend server will run (e.g., `5000`).
*   `MONGODB_URI`: The connection string for your MongoDB instance. If using the Docker setup with default credentials, this would be something like: `mongodb://admin:admin@localhost:27017/bharatgen?authSource=admin`.
*   `JWT_SECRET`: A secret key used for signing and verifying JSON Web Tokens (JWTs) for authentication (e.g., `your_super_secret_jwt_key_change_this`).

**Example `backend/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb://admin:admin@localhost:27017/bharatgen?authSource=admin
JWT_SECRET=your_super_secret_jwt_key_change_this
```

### Frontend Environment Variables

File: `./.env` (in the project root)

*   `VITE_GROQ_API_KEY`: Your API key for the Groq AI service.
*   `VITE_QUADRANT_HOST`: The URL for your Qdrant vector database instance (e.g., `http://localhost:6333`).
*   `VITE_NEO4J_URL`: The Bolt URL for your Neo4j graph database instance (e.g., `bolt://localhost:7687`).
*   `VITE_NEO4J_USERNAME`: The username for connecting to Neo4j (e.g., `admin` if using Docker defaults).
*   `VITE_NEO4J_PASSWORD`: The password for connecting to Neo4j (e.g., `admin` if using Docker defaults).
*   `VITE_MONGODB_URI`: The MongoDB connection string. *(Note: It's unusual for a frontend application to connect directly to MongoDB. This variable might be used to configure a backend API endpoint or for a specific frontend library. Please verify its usage within the project. If it's for the backend API URL, consider renaming it to something like `VITE_API_BASE_URL` in your application code for clarity).*

**Example `./.env` (frontend):**
```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_QUADRANT_HOST=http://localhost:6333
VITE_NEO4J_URL=bolt://localhost:7687
VITE_NEO4J_USERNAME=admin
VITE_NEO4J_PASSWORD=admin
VITE_MONGODB_URI=mongodb://admin:admin@localhost:27017/bharatgen?authSource=admin # Verify usage
```
Make sure to replace placeholder values with your actual keys, URLs, and credentials. **Do not commit `.env` files containing sensitive information to your version control system.** Ensure `.env` is listed in your `.gitignore` file.

## Project Structure

Here's a high-level overview of the key directories in this project:

*   `./` (Root Directory)
    *   `README.md`: This file.
    *   `package.json`: Frontend dependencies and scripts.
    *   `vite.config.ts`: Vite configuration for the frontend.
    *   `tailwind.config.ts`: Tailwind CSS configuration.
    *   `docker-compose.neo.yml`: Docker Compose configuration for backend services.
    *   `.env`: (To be created by user) Frontend environment variables.
    *   `src/`: Contains the main source code for the React frontend application.
        *   `src/components/`: Reusable UI components.
        *   `src/pages/`: Top-level page components.
        *   `src/App.tsx`: Main application component.
        *   `src/main.tsx`: Entry point for the React application.
    *   `public/`: Static assets for the frontend.
*   `backend/`
    *   `package.json`: Backend dependencies and scripts.
    *   `tsconfig.json`: TypeScript configuration for the backend.
    *   `.env`: (To be created by user) Backend environment variables.
    *   `src/`: Contains the source code for the Node.js/Express backend application.
        *   `src/controllers/`: Request handlers.
        *   `src/models/`: Database models (e.g., Mongoose schemas).
        *   `src/routes/`: API route definitions.
        *   `src/middleware/`: Custom middleware.
        *   `src/server.ts`: Main backend server setup and entry point.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these general steps:

1.  **Fork the Repository:** Create your own fork of the project on GitHub.
2.  **Create a Branch:** Make a new branch in your fork for your feature or bug fix.
    ```bash
    git checkout -b feature/your-feature-name
    ```
    or
    ```bash
    git checkout -b fix/your-bug-fix
    ```
3.  **Make Your Changes:** Implement your feature or fix the bug.
4.  **Commit Your Changes:** Commit your changes with a clear and descriptive commit message.
    ```bash
    git commit -m "feat: Add new feature X" 
    # or "fix: Resolve issue Y"
    ```
5.  **Push to Your Branch:** Push your changes to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
6.  **Submit a Pull Request:** Open a pull request from your branch to the main branch of the original repository. Provide a clear description of your changes in the pull request.

Please ensure your code adheres to the project's coding standards and includes any necessary tests.



