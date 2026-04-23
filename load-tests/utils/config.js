export const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
export const GRPC_URL = __ENV.GRPC_URL || 'localhost:50051';
export const KEYCLOAK_URL = __ENV.KEYCLOAK_URL || 'http://localhost:8180/auth/realms/gestion-flotte/protocol/openid-connect/token';

export const COMMON_HEADERS = {
    'Content-Type': 'application/json',
};

import http from 'k6/http';

export function getAuthToken() {
    const payload = {
        grant_type: 'password',
        client_id: 'admin-cli',
        username: 'admin',
        password: 'admin',
    };

    const res = http.post(KEYCLOAK_URL, payload);
    if (res.status !== 200) {
        console.error('Failed to get auth token: ' + res.status + ' ' + res.body);
        return null;
    }
    return JSON.parse(res.body).access_token;
}
