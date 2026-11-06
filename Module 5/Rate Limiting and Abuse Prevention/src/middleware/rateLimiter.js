'use strict';


const rateLimit = require('express-rate-limit');


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,


    handler: (req, res) => {
        const retryAfter = req.rateLimit.resetTime
            ? Math.max(
                1,
                Math.ceil(
                    (req.rateLimit.resetTime.getTime() - Date.now()) / 1000
                )
            )
            : 900;


        res.setHeader('Retry-After', String(retryAfter));


        res.status(429).json({
            message: 'Too many requests. Please try again later.'
        });
    }
});


module.exports = authLimiter;


/*
In a multi-instance deployment, rate-limit-redis can be used
with express-rate-limit to maintain request counters in Redis.


The default in-memory store keeps separate counters on each
server instance. When requests are distributed by a load
balancer, users may get more attempts than the allowed limit.


Redis solves this by storing counters in one shared database
that all server instances can access.
*/