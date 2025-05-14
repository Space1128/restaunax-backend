FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose app port
EXPOSE 5001

# Run the compiled app PROD
# CMD ["node", "dist/index.js"] 

# Run the compiled app DEV
CMD ["npm", "run", "dev"]