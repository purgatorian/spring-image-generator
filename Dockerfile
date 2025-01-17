# Use the official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma
COPY .env .env
RUN npm install

# Copy the rest of the project
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port and start app
EXPOSE 3000
CMD ["npm", "run", "dev"]
