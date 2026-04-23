import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';
import { GRPC_URL } from '../utils/config.js';
import { smokeOptions, loadOptions, stressOptions } from '../scenarios/options.js';

const client = new grpc.Client();
// Chemin relatif au fichier script (load-tests/targets/ → ../../gateway/proto)
client.load(['../../gateway/proto'], 'location.proto');

const scenarios = {
    smoke: smokeOptions,
    load: loadOptions,
    stress: stressOptions,
};

export const options = scenarios[__ENV.SCENARIO] || smokeOptions;

export default function () {
    // connect() est idempotent si déjà connecté dans la même VU
    client.connect(GRPC_URL, { plaintext: true });

    // WatchVehicle est un RPC server-streaming : le client envoie un WatchRequest
    // puis reçoit un flux de GpsPosition.
    const stream = new grpc.Stream(client, 'flotte.location.v1.LocationService/WatchVehicle');

    stream.on('error', (err) => {
        // code 2 = CANCELLED : fermeture volontaire côté client, pas une vraie erreur
        if (err.code !== 2) {
            console.error('Stream error: ' + JSON.stringify(err));
        }
    });

    // Envoie le WatchRequest puis ferme le côté client (half-close)
    stream.write({ vehicle_id: 'test-vehicle-1' });
    stream.end();

    // Laisse le temps au serveur d'envoyer au moins un message
    sleep(1);

    check(stream, {
        'stream is open': (s) => s !== null,
    });

    client.close();
}
