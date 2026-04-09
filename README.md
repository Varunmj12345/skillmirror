# SkillMirror - Career Intelligence Platform

SkillMirror is a full-stack AI career intelligence platform designed to help users manage their careers by providing insights into job opportunities, skill analysis, and personalized career roadmaps. This project is built using Django for the backend, PostgreSQL for the database, and React (or Next.js) for the frontend.

## Project Structure

The project is organized into the following main components:

- **Backend**: The backend is built with Django and includes various apps for user management, job intelligence, skill analysis, career roadmap generation, and AI functionalities.
- **Frontend**: The frontend is developed using React (or Next.js) and provides a user-friendly interface for interacting with the backend services.
- **Infrastructure**: Docker and Kubernetes configurations are included for easy deployment and management of the application.

## Features

- **User Management**: Users can register, log in, and manage their profiles.
- **Job Intelligence**: Users can search for job listings and analyze job descriptions to find suitable opportunities.
- **Skill Analysis**: The platform analyzes users' skills and identifies gaps to help them improve.
- **Career Roadmap Generation**: Users can generate personalized career roadmaps based on their skills and job interests.
- **AI Integration**: The platform utilizes AI for skill embeddings and data analysis to provide intelligent insights.

## Getting Started

### Prerequisites

- Python 3.x
- Node.js and npm
- PostgreSQL
- Docker (optional)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd skillmirror
   ```

2. Set up the backend:
   - Navigate to the `backend` directory.
   - Install the required Python packages:
     ```
     pip install -r requirements.txt
     ```
   - Create a `.env` file based on `.env.example` and configure your environment variables.
   - Run database migrations:
     ```
     python manage.py migrate
     ```

3. Set up the frontend:
   - Navigate to the `frontend` directory.
   - Install the required Node.js packages:
     ```
     npm install
     ```

4. Start the development servers:
   - For the backend:
     ```
     python manage.py runserver
     ```
   - For the frontend:
     ```
     npm run dev
     ```

### Docker

To run the application using Docker, you can use the provided `docker-compose.yml` file in the `infra` directory. This will set up both the backend and frontend services along with a PostgreSQL database.

### Testing

To run tests for the backend, navigate to the `backend` directory and execute:
```
python manage.py test
```

For frontend tests, use:
```
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.