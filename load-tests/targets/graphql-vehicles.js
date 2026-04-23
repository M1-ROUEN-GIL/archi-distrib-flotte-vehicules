import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, COMMON_HEADERS, getAuthToken } from '../utils/config.js';
import { smokeOptions, loadOptions, stressOptions } from '../scenarios/options.js';

// On choisit le scénario via une variable d'environnement, par défaut 'smoke'
const scenarios = {
    smoke: smokeOptions,
    load: loadOptions,
    stress: stressOptions,
};

export const options = scenarios[__ENV.SCENARIO] || smokeOptions;

export function setup() {
    return { token: getAuthToken() };
}

const QUERY = `
  query {
    vehicles {
      id
      plate_number
      brand
      model
      status
    }
  }
`;

export default function (data) {
    const params = {
        headers: Object.assign({}, COMMON_HEADERS, {
            Authorization: `Bearer ${data.token}`,
        }),
    };

    const res = http.post(
        `${BASE_URL}/graphql`,
        JSON.stringify({ query: QUERY }),
        params
    );

    check(res, {
        'is status 200': (r) => r.status === 200,
        'has no graphql errors': (r) => {
            const body = JSON.parse(r.body);
            return !body.errors;
        },
        'has vehicles': (r) => {
            const body = JSON.parse(r.body);
            return body.data && body.data.vehicles && body.data.vehicles.length >= 0;
        },
    });

    sleep(1);
}
