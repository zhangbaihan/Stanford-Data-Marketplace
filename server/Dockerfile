# Stage 1: Install dependencies and build if necessary (for TypeScript or Babel)
# This project uses plain JavaScript, so we primarily install dependencies.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json ./
COPY package-lock.json ./

RUN npm install --production

# Copy the rest of the application code
COPY . .

# Stage 2: Run the application
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose the port your Express app runs on
EXPOSE 5001

# Command to run the application
CMD ["node", "index.js"]
