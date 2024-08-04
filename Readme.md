## Fleet Management System

### Assumptions

- All modern vehicles are equipped with an ECU(Electronic Control Unit) board that communicates with sensors and the server.
- For IoT real-time status, IoT gateways like ThingsBoard are typically used, with inputs in specific hardware code. 
- In this simulation service, **Kafka** is used for publishing and consuming messages to update data, simplifying real-time status updates.
- This assignment is a simplified simulation and does not cover all aspects required for a production environment, such as database optimization for writes and querying.


### Prerequisites

Please ensure the following ports are free to run the whole system.

- MongoDB: `27017`
- Zookeeper: `2181`
- Kafka: `9092`, `29092`
- Backend: `3000`
- Frontend: `3001`

## Running the Application

To build and run the Docker containers. I'd recommend to not run daemon mode so that you can be sure of the server is running.

```bash
docker-compose up --build
```


#### Backend Stack


- **Routing Controllers**: For defining and handling routes in a structured manner.
- **Dependency Injection**: To manage dependencies and improve code modularity and testability.
- **Class Validator**: For validating request payloads to ensure data integrity.
- **Mongoose**: For interacting with MongoDB and managing data models.

I've also custom middlewares and json formatted logger in place to track each request individually. This setup is useful in production for tracing API calls in services like ELK or Datadog.

I've added a couple of unit tests and one integration test. Writing tests for the full application requires significant effort, but these examples demonstrate my capability in this area.



### Frontend Stack

The frontend is built with the following technologies:

Used Next.js 14 with app router. Basic plain setup with tailwind css. no statement management library. only useStates and hooks.

Views are pretty basic. vehicle realtime status page is showing flickering everytime there's an update happening.

## Technical Choices and Rationale

**Server-Sent Events (SSE) over WebSockets** - Client/browser have no control over how vehicle sensor data is changed, thus no use of opening bi-directional(websocket) connection

**Hybrid approach for Maintenance record** - Mixing denormalization for quick access to the latest maintenance record in the vehicle collection which might be useful from Product UX view. and normalization for keeping a full chain of history with its full details.

Thanks for reading till the end :). I'd appreciate getting a feedback over email
