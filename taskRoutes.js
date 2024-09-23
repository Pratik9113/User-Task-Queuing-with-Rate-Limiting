

const express = require('express');
const router = express.Router();
const taskQueue = require('./taskQueue');
const { limitTaskRate } = require('./rateLimiter');
const { completeTask } = require('./completeTask'); 

router.post('/', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID and Task Data are required.' });
    }

    const isAllowed = await limitTaskRate(userId);

    if (isAllowed) {
        try {
            await completeTask(userId);
            return res.status(200).json({ success: true, message: 'Task processed' });
        } catch (error) {
            console.error(`Error processing task for user ${userId}:`, error);
            return res.status(500).json({ success: false, message: 'Error processing task' });
        }
    } else {
        try {
            await taskQueue.add({ userId });
            console.log(`Task queued for user ${userId} due to rate limit.`);
            return res.status(202).json({ success: true, message: 'Rate limit exceeded. Task queued for later processing.' });
        } catch (error) {
            console.error(`Error queuing task for user ${userId}:`, error);
            return res.status(500).json({ success: false, message: 'Error queuing task.' });
        }
    }
});

module.exports = router;
