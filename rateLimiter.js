


const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const client = new Redis();

const MAX_REQUEST_LIMIT = 20; 
const MAX_REQUEST_WINDOW = 60; 
const TOO_MANY_REQUESTS_MESSAGE = "Too many requests";

const options = {
    storeClient: client, 
    points: MAX_REQUEST_LIMIT, 
    duration: MAX_REQUEST_WINDOW, 
    keyPrefix: 'rate-limiter', 
    execEvenly: false, 
};

const rateLimiter = new RateLimiterRedis(options);

const rateLimiterMiddleware = (req, res, next) => {
    const userId = req.ip; 

    rateLimiter
        .consume(userId) 
        .then((rateLimiterRes) => {
            res.setHeader("Retry-After", rateLimiterRes.msBeforeNext / 1000); 
            res.setHeader("X-RateLimit-Limit", options.points);
            res.setHeader("X-RateLimit-Remaining", rateLimiterRes.remainingPoints);
            res.setHeader("X-RateLimit-Reset", new Date(Date.now() + rateLimiterRes.msBeforeNext));
            next();
        })
        .catch(() => {
            console.warn(`Rate limit exceeded for user ${userId}`); 
            res.status(429).json({ success: false, message: TOO_MANY_REQUESTS_MESSAGE });
        });
};

const limitTaskRate = async (userId) => {
    try {
        await rateLimiter.consume(userId);
        return true;
    } catch (rejRes) {
        return false; 
    }
};

module.exports = {
    rateLimiterMiddleware,
    limitTaskRate,
};
