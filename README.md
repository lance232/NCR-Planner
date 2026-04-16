# NCR Planner

A comprehensive booking management system for coordinating schedules between Schedulers, Banks, and Custom Engineers.

## Features

- **Multi-Role Authentication**: Separate dashboards for Admin, Scheduler, Bank, and Custom Engineer roles
- **Admin-Controlled Accounts**: Admins create user accounts with temporary passwords
- **Bank Isolation**: Each bank can only view and manage their own schedules
- **Booking Workflow**: 
  - Schedulers create booking requests
  - Banks approve or reject requests
  - Rejected requests can be rescheduled and resubmitted
  - Approved bookings are assigned to engineers
- **Professional Calendar**: Outlook-style calendar interface for viewing bank availability
- **Secure & Private**: Role-based access control with protected routes

## Tech Stack

- **React 18** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS v4** for styling
- **Radix UI** for accessible components
- **Vite** for fast development and building
- **LocalStorage** for demo data persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ncr-planner.git
cd ncr-planner
```

2. Install dependencies:
```bash
npm install
```

3. Install React (required peer dependencies):
```bash
npm install react@18.3.1 react-dom@18.3.1
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Demo Accounts

Use these credentials to test different roles:

- **Admin**: admin@ncrplanner.com / admin123
- **Scheduler**: scheduler@example.com / scheduler123
- **Bank**: bank@example.com / bank123
- **Engineer**: engineer@example.com / engineer123

## Project Structure

```
/src
  /app
    /components         # React components
      /ui              # Reusable UI components
      AdminDashboard.tsx
      SchedulerDashboard.tsx
      BankDashboard.tsx
      EngineerDashboard.tsx
      Login.tsx
      ProtectedRoute.tsx
    /context           # React Context providers
      AuthContext.tsx  # Authentication & user management
      BookingContext.tsx # Booking & availability management
    routes.tsx         # Route configuration
    App.tsx           # Main app component
  /styles             # Global styles
  main.tsx           # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## User Roles

### Admin
- Create, view, and delete user accounts
- Assign roles (Scheduler, Bank, Engineer, Admin)
- Generate temporary passwords for new users
- Manage all system users

### Scheduler
- View bank availability calendar
- Create booking requests
- Reschedule rejected bookings
- Track booking status (pending, approved, rejected)

### Bank
- View booking requests for their bank only
- Approve or reject requests
- Provide rejection reasons and preferred alternatives
- Manage bank availability schedule

### Custom Engineer
- View assigned bookings
- Mark bookings as completed
- Add completion notes

## Data Storage

Currently uses **localStorage** for demo purposes. In production, replace with:
- Backend API for user authentication
- Database for persistent data storage
- Secure password hashing (bcrypt, etc.)
- JWT tokens for session management

## Security Notes

⚠️ **This is a demo application**. For production use:
- Implement proper backend authentication
- Use HTTPS for all communications
- Hash passwords securely
- Add CSRF protection
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for sensitive data

## Future Enhancements

- Excel file import for bank availability
- Email notifications
- Real-time updates
- Advanced calendar features
- Reporting and analytics
- Mobile app version
- Export booking data

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Author

Developed with modern React best practices and functional programming principles.
