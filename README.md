# Miftah Educational Platform

Miftah (meaning "key" in Arabic) is a comprehensive educational platform designed to revolutionize education in Morocco by providing a modern, accessible, and feature-rich e-learning environment.

## Overview

Miftah is built using Next.js with TypeScript and leverages a robust tech stack to deliver a seamless educational experience for students, teachers, and administrators in Morocco.

## Features

### For Students
- **Course Access**: Browse and enroll in available courses
- **Progress Tracking**: Monitor learning progress across all enrolled courses
- **Study Plans**: AI-generated personalized study plans to optimize learning
- **Assignments**: Submit and track assignments for each course

### For Teachers
- **Course Management**: Create, edit, and manage course content
- **Analytics**: Access detailed insights on student performance
- **Communication Tools**: Engage with students effectively
- **Assessment Creation**: Design and distribute assignments

### For Administrators
- **User Management**: Oversee all platform users
- **Health Monitoring**: Track the platform's operational status
- **Moderation Tools**: Ensure content quality and appropriateness
- **System Settings**: Configure platform-wide settings

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: Shadcn UI library
- **Authentication**: Secure user authentication and authorization
- **AI Features**: Intelligent learning tools and study plan generation

## Getting Started

### Run Locally

To run this project locally:

```bash
# Install dependencies
npm install

npm run genkit:dev

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Deployed Version

You can also access the deployed version of Miftah at:
[https://miftah-eight.vercel.app/](https://miftah-eight.vercel.app/)

## Authentication

Miftah offers two ways to login:

### Quick Login (For Testing)

For quick testing, you can login by simply selecting one of the available roles:
- Student
- Teacher
- Admin

### Credential Login

You can also login using the following credentials:

**Student Access:**
- Email: alex.thompson@example.com
- Password: student123

**Teacher Access:**
- Email: sarah.johnson@example.com
- Password: teacher123

**Admin Access:**
- Email: admin@example.com
- Password: admin123

## Project Structure

The project follows Next.js App Router pattern with organized directories for:
- App routes under `src/app`
- Reusable components in `src/components`
- Custom hooks in `src/hooks`
- Utility functions in `src/lib`
- AI functionality in `src/ai`

## Troubleshooting

### Authentication Issues

If you experience authentication issues (like being redirected to the login page after clicking navigation items):

1. **Clear Browser Cookies**: Remove cookies for the domain and try logging in again
2. **Try Different Browser**: Some authentication issues may be browser-specific
3. **Check Console Logs**: Open developer tools (F12) to view authentication-related logs
4. **Quick Login Method**: If email login fails, try the quick login option by selecting a role
5. **Verify Network Requests**: Check the Network tab in developer tools to ensure cookies are being set

### Cookie Debugging

To verify if authentication cookies are being set correctly:

1. Log in to the platform
2. Open browser developer tools (F12)
3. Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
4. Look for cookies named `userId` and `userRole`
5. Ensure they have proper values and aren't expired

If cookies are missing, try disabling any tracking protection or privacy features in your browser that might block cookies.

## About

Miftah is designed to empower Moroccan students and educators with the tools they need for success, fostering a collaborative and engaging learning environment.
