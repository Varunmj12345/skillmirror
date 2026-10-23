FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies deterministically
RUN npm ci

# Copy the rest of the application code
COPY --chown=node:node . .

# Build the Next.js application
RUN npm run build

USER node

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]