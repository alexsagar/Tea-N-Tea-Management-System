FROM node:20-bullseye

WORKDIR /app

# Install concurrently globally
RUN npm install -g concurrently

# Copy backend package.json and frontend package.json
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy the rest of the code
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Expose ports
EXPOSE 5000 3000

# Start both frontend and backend in dev mode
CMD ["concurrently", "--kill-others-on-fail", \
     "npm run dev --prefix backend", \
     "npm run dev --prefix frontend"]
