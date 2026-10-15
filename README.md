# JobTrack - Job Application Tracker

A full-stack web application that helps job seekers organize and track their job applications in one place.

## About the Project

JobTrack is a career management dashboard built to simplify the job search process. Users can record job applications, update application statuses, search for opportunities, and monitor their progress through a centralized dashboard.

## Features

- **Dashboard:** View application statistics and track job search progress.
- **Add Applications:** Record company names, job titles, locations, application statuses, and application dates.
- **Edit Applications:** Update existing application details.
- **Delete Applications:** Remove applications that are no longer needed.
- **Search:** Find applications by company name, job title, or location.
- **Filter:** Organize applications by status.
- **Sorting:** Sort applications by application date.
- **Statistics:** Monitor total applications, interviews, offers, and rejected applications.
- **CSV Export:** Export application data for personal records.

## Technologies Used

### Frontend
- React
- JavaScript
- HTML5
- CSS3
- Vite
- Lucide React

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Hibernate
- REST API

### Database
- MySQL

### Tools
- IntelliJ IDEA
- Visual Studio Code
- MySQL Workbench
- Git and GitHub
- Postman / HTTP Client

## Project Structure

```text
jobtracker/
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── api.js
│       └── index.css
├── jobtracker/
│   ├── src/main/java/com/example/jobtracker/
│   │   ├── controller/
│   │   ├── entity/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/
│   └── pom.xml
└── README.md
```

## Getting Started

### Prerequisites

Install the following software before running the project:

- Java Development Kit (JDK)
- Node.js and npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Sriram9010/jobtracker.git
cd jobtracker
```

### 2. Configure MySQL

Create the database in MySQL:

```sql
CREATE DATABASE jobtracker;
```

Configure your database connection in the Spring Boot application's `application.properties` file.

Use your own MySQL username and password. Do not commit real database credentials to GitHub.

Refer to `jobtracker/src/main/resources/application-example.properties` for the example configuration.

### 3. Start the Backend

Open a terminal in the backend directory:

```bash
cd jobtracker
```

Run the Spring Boot application using Maven:

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs at:

`http://localhost:8080`

### 4. Start the Frontend

Open another terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local frontend address displayed in your terminal, usually:

`http://localhost:5173`

Make sure the backend and MySQL server are running before using the application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobs` | Retrieve all job applications |
| GET | `/jobs/{id}` | Retrieve a specific application |
| POST | `/jobs` | Create a job application |
| PUT | `/jobs/{id}` | Update a job application |
| DELETE | `/jobs/{id}` | Delete a job application |
| GET | `/jobs/search?companyName={name}` | Search applications |
| GET | `/jobs/filter?status={status}` | Filter applications by status |

## Learning Outcomes

Through this project, I gained practical experience in:

- Building a React frontend with reusable components.
- Developing REST APIs using Spring Boot.
- Connecting Java applications to MySQL using Spring Data JPA.
- Implementing CRUD operations.
- Handling frontend and backend API communication.
- Managing application state, searching, filtering, and sorting.
- Using Git and GitHub for version control.

## Future Improvements

- User authentication and authorization.
- Cloud deployment for the frontend and backend.
- Application reminders and interview scheduling.
- Charts for visualizing job search progress.
- Secure user-specific application management.

## Author

**Sriram Penumala**

GitHub: [@Sriram9010](https://github.com/Sriram9010)
