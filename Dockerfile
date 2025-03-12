# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application (including server.js)
COPY . .

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the Node.js server
CMD ["node", "server.js"]

