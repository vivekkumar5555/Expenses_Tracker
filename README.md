# SmartSpend+ Web Edition

A complete, production-ready full-stack financial management application with a modern, futuristic UI featuring 3D animations and glassmorphism effects.

## 🚀 Features

- **Authentication**: Register, login, JWT-based auth, OTP password reset
- **Expense Management**: Full CRUD with filtering, pagination, categories, vendors, notes, payment modes, tags
- **Categories**: Default and custom categories with icons and colors
- **Budgets**: Weekly, monthly, and custom budgets with alerts
- **Recurring Expenses**: Daily, weekly, monthly recurring expenses
- **Scheduled Expenses**: Track pending, paid, and overdue expenses
- **Savings Goals**: Set targets with progress tracking and daily saving calculations
- **Reports**: Summary, category breakdown, vendor breakdown, monthly trends
- **CSV Export**: Export expense data to CSV
- **User Settings**: Currency, language, approval limit, theme preferences
- **Modern UI**: Dark/light mode, 3D animations, glassmorphism, responsive design

## 🛠️ Tech Stack

### Frontend
- React 18
- JavaScript (ES6+)
- TailwindCSS
- React Router
- Axios
- React Hook Form
- Recharts
- Framer Motion
- React-Three-Fiber + Drei

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Bcrypt
- express-validator
- Nodemailer (OTP)

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create a .env file from the example
cp env.example .env

# Edit .env file with your database credentials and other settings
# DATABASE_URL="postgresql://username:password@localhost:5432/smartspend?schema=public"
# JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password
# etc.

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the development server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
smart/
├── backend/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth, validation, error handling
│   ├── routes/           # API routes
│   ├── services/         # Business logic (email, etc.)
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── server.js         # Express server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts (Auth, Theme)
│   │   ├── pages/        # Page components
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   └── package.json
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/smartspend?schema=public"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@smartspend.com
FRONTEND_URL=http://localhost:3000
```

## 🗄️ Database Migration

The Prisma schema includes all necessary tables:
- Users
- Categories (with default categories)
- Expenses
- Budgets
- Recurring Expenses
- Scheduled Expenses
- Savings Goals
- User Settings
- OTP Codes

Default categories are automatically created when a user registers.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Expenses
- `GET /api/expenses` - Get expenses (with filters, pagination)
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `GET /api/categories` - Get categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Reports
- `GET /api/reports/summary` - Get summary report
- `GET /api/reports/category-breakdown` - Get category breakdown
- `GET /api/reports/vendor-breakdown` - Get vendor breakdown
- `GET /api/reports/export-csv` - Export expenses to CSV

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

## 🎨 UI Features

- **Responsive Design**: Works on all screen sizes
- **Dark/Light Mode**: Toggle between themes
- **3D Animations**: React-Three-Fiber powered 3D elements
- **Glassmorphism**: Modern glass-like UI effects
- **Smooth Transitions**: Framer Motion animations
- **Interactive Charts**: Recharts for data visualization
- **Sidebar Navigation**: Collapsible sidebar with icons
- **Topbar**: Context-aware header with theme toggle

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists: `createdb smartspend`

### Email Not Sending
- For Gmail, use an App Password (not your regular password)
- Enable "Less secure app access" or use OAuth2
- Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env

### Port Already in Use
- Change PORT in backend .env
- Change port in frontend vite.config.js

### Prisma Issues
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:migrate` to apply migrations
- Use `npm run prisma:studio` to view database

## 📝 Notes

- All API routes (except auth) require JWT authentication
- Default categories are created automatically on user registration
- Budgets calculate spent amount based on expenses in the date range
- Recurring expenses automatically calculate next due date
- Scheduled expenses auto-update status to "overdue" when past due date
- Savings goals calculate required daily saving based on target date

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in backend .env
2. Build frontend: `cd frontend && npm run build`
3. Serve frontend build with a static server (nginx, etc.)
4. Use a process manager (PM2) for the backend
5. Set up SSL certificates
6. Configure proper CORS settings
7. Use environment-specific database URLs
8. Set strong JWT_SECRET

## 📄 License

ISC

## 👨‍💻 Development

This project uses:
- ES6 modules (type: "module" in package.json)
- Modern React patterns (hooks, contexts)
- Clean architecture (separation of concerns)
- Best practices (error handling, validation, security)

Enjoy building with SmartSpend+! 🎉



