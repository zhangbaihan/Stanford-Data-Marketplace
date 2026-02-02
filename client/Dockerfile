# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:alpine

# Copy the built React app from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx configuration (if any)
# If you have a custom nginx.conf, uncomment the line below and place your config in the client directory
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
