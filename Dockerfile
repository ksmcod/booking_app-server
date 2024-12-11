# Use an official Node runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Copy app source
COPY . .

# Generate prisma client
RUN npx prisma generate

# Compile ts source code to js
RUN npm run build

# Run app.py when the container launches
CMD ["node", "./dist/index.js"]