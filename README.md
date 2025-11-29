# Canteen Management System - Frontend

## Overview
This is the frontend application for the Canteen Management System built with React.js, Tailwind CSS, and Socket.IO.

## Features
- User authentication and registration
- Browse menu with filters and search
- Shopping cart management
- Real-time order tracking
- User profile management
- Admin dashboard with analytics
- Kitchen staff order management
- Real-time notifications via WebSocket
- Responsive design with dark mode support

## Installation

### Prerequisites
- Node.js (v14 or higher)
- pnpm (or npm/yarn)

### Steps
1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file in the root directory:
   ```
   VITE_BACKEND_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

3. Start the development server:
   ```bash
   pnpm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Build for Production

```bash
pnpm run build
```

The built files will be in the `dist` directory.

## Project Structure
```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/      # Reusable components
│   │   ├── common/      # Common components (Navbar, Footer, etc.)
│   │   ├── ui/          # UI components from shadcn/ui
│   │   └── ...
│   ├── contexts/        # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   ├── App.jsx          # Main App component
│   ├── App.css          # Global styles
│   └── main.jsx         # Entry point
└── package.json
```

## Key Technologies
- **React 19** - UI library
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icons
- **Vite** - Build tool

## User Roles
- **User** - Regular customer who can browse menu, order food, and track orders
- **Admin** - Administrator with full access to dashboard, products, orders, and staff management
- **Kitchen Staff** - Kitchen personnel who can manage order preparation

## Available Routes
- `/` - Home page
- `/menu` - Browse menu
- `/product/:id` - Product details
- `/login` - Login page
- `/register` - Registration page
- `/cart` - Shopping cart
- `/orders` - Order history
- `/profile` - User profile
- `/favorites` - Favorite dishes
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/staff` - Staff management
- `/admin/expenses` - Expense tracking
- `/kitchen` - Kitchen dashboard

## Real-time Features
The application uses Socket.IO for real-time updates:
- New order notifications
- Order status updates
- Item preparation status
- Product availability updates
- Discount notifications

## License
MIT

