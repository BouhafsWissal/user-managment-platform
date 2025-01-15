# user-managment-platform
# Course Platform

A full-stack application for managing online courses. Built with Node.js, Express, SQLite, React, and TypeScript.

## Features

- User Management (Consumers and Creators)
- Course Creation and Management
- Course Enrollment System
- Invitation System
- JWT Authentication

## Tech Stack

### Backend
- Node.js
- Express.js
- SQLite
- JWT for authentication

### Frontend
- React
- TypeScript
- TanStack Router
- TanStack React Query
- TailwindCSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev:all
   ```

This will start both the frontend and backend servers.

## API Documentation

### Authentication

#### Register
- `POST /api/auth/register`
- Body: `{ email: string, password: string, name: string, isCreator: boolean }`
- Returns: `{ token: string }`

#### Login
- `POST /api/auth/login`
- Body: `{ email: string, password: string }`
- Returns: `{ token: string }`

### Courses

#### Create Course
- `POST /api/courses`
- Auth: Required (Creator only)
- Body: `{ title: string, description: string }`
- Returns: Created course object

#### Get Created Courses
- `GET /api/ courses/created`
- Auth: Required (Creator only)
- Returns: Array of created courses

#### Get Enrolled Courses
- `GET /api/courses/enrolled`
- Auth: Required
- Returns: Array of enrolled courses

### Course Invites

#### Send Invite
- `POST /api/courses/:courseId/invite`
- Auth: Required (Course Creator only)
- Body: `{ userId: number }`
- Returns: Success message

#### Respond to Invite
- `POST /api/invites/:inviteId/respond`
- Auth: Required
- Body: `{ accept: boolean }`
- Returns: Success message



## Security

- JWT-based authentication
- Protected routes for creators
- Input validation
- SQLite security best practices

## Error Handling

The application includes comprehensive error handling for:
- Invalid authentication
- Unauthorized access
- Database errors
- Invalid invites
- Duplicate enrollments
