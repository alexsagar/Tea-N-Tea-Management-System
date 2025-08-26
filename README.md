
# Tea-N-Tea Management System

## Project Summary

**Tea-N-Tea Management System** is a comprehensive web-based application designed to streamline the day-to-day operations of tea businesses. This system enables users to efficiently manage inventory, track sales and orders, oversee staff activities, and gain actionable insights through dashboards and reports. Built on the robust MERN stack (MongoDB, Express.js, React, Node.js), Tea-N-Tea provides a secure, scalable, and user-friendly platform for administrators and staff to collaborate and enhance productivity.

## Project Structure

```
tea/
├── backend/     # Node.js/Express backend API
├── frontend/    # React + Vite frontend app
```

- **backend/**: Backend server, REST APIs, authentication, business logic, database models (likely MongoDB)
- **frontend/**: React frontend, user interface, views, and client-side logic

## Features

- User authentication (login/register)
- Tea inventory and product management
- Order and sales tracking
- Role-based access (admin/staff)
- Dashboard for analytics and insights
- Modern responsive UI



## Tech Stack

- **Frontend:** React, Vite, JavaScript, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Other:** JWT for authentication, RESTful API

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (local or cloud)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/alexsagar/Tea-N-Tea-Management-System.git
cd tea
```

#### 2. Setup Backend

```bash
cd backend
npm install
# Create .env file (see .env.example if provided)
npm start   # or: node server.js
```

- The backend will usually run on `http://localhost:5000/` (check your `server.js` for port).

#### 3. Setup Frontend

```bash
cd ../frontend
npm install
# Create .env file for frontend API base URL if needed
npm run dev
```

- The frontend typically runs on `http://localhost:3000/` (check Vite config).

### Usage

- Access the web app via your browser at the frontend URL.
- Register or login to access features.
- Manage tea products, sales, orders, and analytics via the dashboard.

## Folder Structure

- **/backend**: Express API, models, routes, middleware, config
- **/frontend**: React app (`src/`), static assets (`public/`), configs

## Environment Variables

Both backend and frontend require `.env` files for environment-specific configuration.  
Typical variables:
- **Backend:** `MONGODB_URI`, `JWT_SECRET`, `PORT`, etc.
- **Frontend:** `VITE_API_URL`, etc.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
