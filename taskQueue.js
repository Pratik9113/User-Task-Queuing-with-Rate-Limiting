const Queue = require('bull');
const { completeTask } = require('./completeTask'); 
const taskQueue = new Queue('task-queue', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

taskQueue.process(async (job, done) => {
    const { userId } = job.data;

    try {
        await completeTask(userId);
        done(); 
    } catch (error) {
        console.error(`Error processing job for user ${userId}:`, error);
        done(new Error('Task processing failed')); 
    }
});

module.exports = taskQueue;
