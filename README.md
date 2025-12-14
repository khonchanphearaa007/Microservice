# Microservice (Node.js + RabbitMQ +  Docker)

This project Microservice for architecture using language for build use:
- Node.js
- MogoDB
- RabbitMQ
- Mobile App (Kotlin: Next Feature comming soon...)

Include the system it have:
* User service for verity name, email into (MogoDB)
* Task service handles and task process working with title, description, userId event into (RabbitMQ)
* Notification service -Listions service when Taske service it must be create event it to message broker in docker with RabbitMQ 
* product service handles of process (Name, Price, Quantity) into alert (RabbitMQ)
* API-Gateway for router requests to Microservice

# Teach Stack
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-0095D5?style=for-the-badge&logo=kotlin&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Microservices](https://img.shields.io/badge/Microservices-F5A623?style=for-the-badge&logo=containerd&logoColor=white)
## Folder Stack
```bash
your-project/
├── api-gateway/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── user-service/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── task-service/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── notification-service/
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── product-service/
|   ├── index.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml

```
## Prerequisites
- Docker compose installed
- Node.js
- npm 

## Service Overivew 
### MogoDB
- Container: mongo
- port: 27017
- Version: docker-compose '3.8'

### RabbitMQ
- Container: rabbitmq_node
- port: 
    - 5672 -> messaging 
    - 15672 -> management UI

### API Gateway
- Container: api-gateway
- Port: 3000
    - endPoint: (product, tasks, users)
    - localhost: http://localhost:3000/endPoint
- Routes: 
    - http://localhost:3001/users -> User service
    - http://localhost:3002/tasks -> Task service
    - http://localhost:3004/product -> Product service


