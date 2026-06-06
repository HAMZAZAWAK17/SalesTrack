FROM node:18-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (including devDependencies for prisma build step)
RUN npm install

# Copy configuration and source code
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "start"]
