export const smokeOptions = {
    vus: 1,
    duration: '1m',
    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

export const loadOptions = {
    stages: [
        { duration: '1m', target: 10 }, // ramp up to 10 users
        { duration: '2m', target: 10 }, // stay at 10 users
        { duration: '1m', target: 0 },  // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete below 0.5s
    },
};

export const stressOptions = {
    stages: [
        { duration: '2m', target: 100 }, // heavy ramp up
        { duration: '1m', target: 100 }, // stay at peak
        { duration: '1m', target: 0 },   // ramp down
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],   // error rate should be less than 1%
    },
};
