# ------ Build Stage ------
FROM node:22-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# ------ Production Stage ------
FROM node:22-alpine AS production

# Set working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies for a smaller image
RUN npm ci --only=production

# Copy the compiled output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the standard NestJS port (Modify if your app uses a different port)
EXPOSE 3000

# Set environment string
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "run", "start:prod"]
