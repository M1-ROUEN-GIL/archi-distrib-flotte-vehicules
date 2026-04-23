import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, getAuthToken } from '../utils/config.js';
import { smokeOptions, loadOptions, stressOptions } from '../scenarios/options.js';

const scenarios = {
    smoke: smokeOptions,
    load: loadOptions,
    stress: stressOptions,
};

export const options = scenarios[__ENV.SCENARIO] || smokeOptions;

export function setup() {
    return { token: getAuthToken() };
}

export default function (data) {
    const params = {
        headers: {
            Authorization: `Bearer ${data.token}`,
        },
    };
    const res = http.get(`${BASE_URL}/api/alerts`, params);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'is array': (r) => Array.isArray(JSON.parse(r.body)),
    });

    sleep(1);
}
