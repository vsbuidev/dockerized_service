# Dockerized Service Deployment with Node.js and GitHub Actions

This project demonstrates deploying a Node.js service using Docker, an EC2 instance, and GitHub Actions for continuous integration and deployment.

---

## Features

1. **Node.js Application**:

   - A simple Node.js service built with environment variables (`.env` file).
   - Includes a `/secret` route secured with Basic Authentication.

2. **Dockerized Service**:

   - The application is containerized with a `Dockerfile` for portability.

3. **Remote Server Setup**:

   - An EC2 instance is provisioned for hosting the service.
   - The SSH public key is added to the server for secure access.

4. **CI/CD with GitHub Actions**:
   - Automated deployment workflow:
     - Builds the Docker image.
     - Pushes the image to DockerHub.
     - Pulls and deploys the image on the EC2 instance.

---

## Prerequisites

1. **Node.js Installed**:

   - [Node.js](https://nodejs.org/) must be installed locally to develop the service.

2. **AWS EC2 Instance**:

   - An EC2 instance with your SSH public key added to `~/.ssh/authorized_keys`.

3. **DockerHub Account**:

   - A valid DockerHub account to store and retrieve Docker images.

4. **GitHub Repository**:
   - Secrets for deployment must be configured in the repository.

---

## Steps

### 1. Create the Node.js Service

1. Build a simple Node.js service with two routes:
   - `/`: Returns "Hello, World!".
   - `/secret`: Returns a protected message using Basic Auth.
2. Add a `.env` file with:
   ```env
   SECRET_MESSAGE=YourSecretMessage
   USERNAME=YourUsername
   PASSWORD=YourPassword
   PORT=3000
   ```
3. Test the service locally before proceeding.

### 2. Write a Dockerfile

1. Create a `Dockerfile` for the Node.js service:
   ```dockerfile
    FROM node:16-alpine
    WORKDIR /node-app
    COPY package*.json ./
    RUN npm install
    COPY . .
    EXPOSE 3000
    CMD ["node", "index.js"]
   ```
2. Build and test the Docker image locally:
   ```bash
   docker build -t node-app-service .
   docker run -p 3000:3000 node-app-service
   ```

### 3. Set Up the EC2 Instance

1. Launch an EC2 instance on AWS.
2. Add your public SSH key to `~/.ssh/authorized_keys` on the server:
   ```bash
   echo "your-public-key" >> ~/.ssh/authorized_keys
   ```

### 4. Configure GitHub Secrets

1. Add the following secrets in your GitHub repository:
   - `DOCKER_USERNAME`: Your DockerHub username.
   - `DOCKER_PASSWORD`: Your DockerHub password.
   - `SERVER_IP`: Public IP or hostname of the EC2 instance.
   - `SERVER_PRIVATE_KEY`: Your private SSH key (used to access the EC2 instance).

### 5. Create the GitHub Actions Workflow

1. Add the following workflow file (`.github/workflows/deploy.yml`) to your repository:

   ```yaml
   name: Deploy Dockerized Node.js Service

    on:
    push:
        branches:
        - main

    jobs:
    build:
        runs-on: ubuntu-latest

        steps:
        - name: Checkout code
            uses: actions/checkout@v3

        - name: Log in to DockerHub
            uses: docker/login-action@v2
            with:
            username: ${{ secrets.DOCKER_USERNAME }}
            password: ${{ secrets.DOCKER_PASSWORD }}

        - name: Build and push Docker image
            run: |
            docker build -t ${{ secrets.DOCKER_USERNAME }}/dockerized_service:latest .
            docker push ${{ secrets.DOCKER_USERNAME }}/dockerized_service:latest

    deploy:
        needs: build
        runs-on: ubuntu-latest

        steps:
        - name: SSH to server and deploy
            uses: appleboy/ssh-action@v0.1.8
            with:
            host: ${{ secrets.SERVER_IP }}
            username: ubuntu
            key: ${{ secrets.SERVER_PRIVATE_KEY }}
            script: |
                docker pull ${{ secrets.DOCKER_USERNAME }}/dockerized_service:latest
                docker stop dockerized_service || true
                docker rm dockerized_service || true
                docker run -d --name dockerized_service -p 3000:3000 --env-file ~/secrets_node/.env ${{ secrets.DOCKER_USERNAME }}/dockerized_service:latest
             EOF
   ```

2. Commit and push the workflow to your repository:
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow for deployment"
   git push origin main
   ```

---

## Deployment Workflow

1. Push any code changes to the `main` branch of your repository.
2. GitHub Actions will:

   - Build and push the Docker image to DockerHub.
   - SSH into the EC2 instance.
   - Pull and deploy the updated Docker image.

3. Access the Node.js service at:
   ```
   http://<REMOTE_HOST>:3000
   ```

### Screenshot

## ![screenshot](/screenshot.png)

This project is part of [vsbuidev's Roadmap](https://roadmap.sh/projects/dockerized-service-deployment) DevOps projects.
