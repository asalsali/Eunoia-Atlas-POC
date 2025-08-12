FROM node:18-alpine

WORKDIR /app

# Build-time variables to embed React env values
ARG REACT_APP_API_URL
ARG REACT_APP_XUMM_API_KEY
ARG REACT_APP_XUMM_API_SECRET
ARG REACT_APP_MEDA_WALLET_ADDRESS
ARG REACT_APP_TARA_WALLET_ADDRESS

# Make them available at build time
ENV REACT_APP_API_URL=$REACT_APP_API_URL \
    REACT_APP_XUMM_API_KEY=$REACT_APP_XUMM_API_KEY \
    REACT_APP_XUMM_API_SECRET=$REACT_APP_XUMM_API_SECRET \
    REACT_APP_MEDA_WALLET_ADDRESS=$REACT_APP_MEDA_WALLET_ADDRESS \
    REACT_APP_TARA_WALLET_ADDRESS=$REACT_APP_TARA_WALLET_ADDRESS

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