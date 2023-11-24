# Base image from node
FROM node:18

# Expose port
EXPOSE 4201

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Install angular cli
RUN npm install -g @angular/cli

# Bundle app source
COPY . .

# Build and start
RUN npm run build
