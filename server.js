const cluster = require('node:cluster');
const os = require('os');
const express = require('express');
const { rateLimiterMiddleware } = require('./rateLimiter');
// User Task
// Queuing with Rate Limiting
const numCPUs = 2;

if (cluster.isPrimary) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new one.`);
        cluster.fork();
    });
} else {
    const taskRoutes = require('./taskRoutes.js');
    const app = express();

    app.use(rateLimiterMiddleware);
    app.use(express.json());
    app.use('/task', taskRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} is listening on port ${PORT}`);
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });
}
