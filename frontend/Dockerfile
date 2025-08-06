FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Copy serve.json to build directory
COPY serve.json build/

# Install serve to run the app
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the app with proxy configuration
CMD ["serve", "-s", "build", "-l", "3000", "--config", "serve.json"] 