import { GraphQLError } from 'graphql';
import { Kafka } from 'kafkajs';
import { EventEmitter, on } from 'events'; // 👈 On utilise le natif de Node.js !

import { vehicleResolvers } from './vehicleResolvers.js';
import { maintenanceResolvers } from './maintenanceResolvers.js';
import { driverResolvers } from './driverResolvers.js';
import { alertResolvers } from './alertResolvers.js';
import { locationResolvers } from './locationResolvers.js';

// 1. Notre tuyau de communication temps réel 100% robuste
const ee = new EventEmitter();

// 2. Connecter la Gateway à Kafka
const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: [process.env.KAFKA_BROKER || 'kafka:9092']
});
const consumer = kafka.consumer({ groupId: 'gateway-websockets-group' });

const startKafkaConsumer = async () => {
  let subscribed = false;
  while (!subscribed) {
    try {
      await consumer.connect();
      await consumer.subscribe({ topic: 'flotte.localisation.gps', fromBeginning: false });
      await consumer.subscribe({ topic: 'flotte.alerts.created', fromBeginning: false });
      subscribed = true;
      console.log('✅ Gateway : Écouteur Kafka branché sur flotte.localisation.gps et flotte.alerts.created !');
    } catch (err) {
      console.error('⚠️ Attente des topics Kafka (nouvel essai dans 5s)...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  try {
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;
        const data = JSON.parse(message.value.toString());

        if (topic === 'flotte.localisation.gps') {
          // 🛡️ FILET DE SÉCURITÉ : On s'adapte aux différents noms de variables possibles
          const positionPourReact = {
            ...data.payload,
            latitude: data.payload.latitude ?? data.payload.lat,
            longitude: data.payload.longitude ?? data.payload.lng ?? data.payload.lon,
            speed_kmh: data.payload.speed_kmh ?? data.payload.speed ?? 0,
            heading_deg: data.payload.heading_deg ?? data.payload.heading ?? 0,
            recorded_at: data.timestamp
          };

          console.log("🔍 DONNÉES GPS ENVOYÉES :", positionPourReact.vehicle_id);

          if (positionPourReact.latitude !== undefined && positionPourReact.latitude !== null) {
            ee.emit('VEHICLE_LOCATION_UPDATED', { vehicleLocationUpdated: positionPourReact });
          }
        } else if (topic === 'flotte.alerts.created') {
          console.log("🚨 ALERTE KAFKA REÇUE :", data.id);

          // 🛠️ MAPPING STRICT : On convertit tout au format attendu par le schéma GraphQL
          const alert = {
            ...data,
            id: data.id,
            type: data.type,
            severity: data.severity,
            status: data.status || 'ACTIVE',
            message: data.message,
            vehicle_id: data.vehicleId || data.vehicle_id,
            driver_id: data.driverId || data.driver_id,
            // Conversion du timestamp Java (secondes) en String ISO pour le front
            created_at: data.createdAt 
              ? new Date(data.createdAt * 1000).toISOString() 
              : new Date().toISOString()
          };

          console.log("📣 EMISSION ALERT_CREATED — ID:", alert.id, "VEHICLE:", alert.vehicle_id);
          ee.emit('ALERT_CREATED', { alertCreated: alert });
          ee.emit('ALERT_CREATED_SEVERITY', { alertCreatedBySeverity: alert });
        }

      },
    });
    console.log('✅ Gateway : Écouteur Kafka branché sur flotte.localisation.gps !');
  } catch (err) {
    console.error('❌ Erreur de connexion Kafka sur la Gateway:', err);
  }
};
startKafkaConsumer();

// 4. Les Resolvers
export const resolvers = {
  Query: {
    ...vehicleResolvers.Query,
    ...maintenanceResolvers.Query,
    ...driverResolvers.Query,
    ...alertResolvers.Query,
    ...locationResolvers.Query,
  },
  Mutation: {
    ...vehicleResolvers.Mutation,
    ...maintenanceResolvers.Mutation,
    ...driverResolvers.Mutation,
    ...alertResolvers.Mutation,
  },
  Subscription: {
    vehicleLocationUpdated: {
      subscribe: async function* (_: any, args: { vehicle_id: string }) {
        for await (const [payload] of on(ee, 'VEHICLE_LOCATION_UPDATED')) {
          // 🎯 TRÈS IMPORTANT : On ne transmet au navigateur QUE les infos du camion sélectionné !
          if (payload.vehicleLocationUpdated.vehicle_id === args.vehicle_id) {
            yield payload;
          }
        }
      },
    },
    // Bouchons silencieux pour éviter les crashs sur les autres écrans
    vehicleStatusChanged: {
      subscribe: async function* () { for await (const [payload] of on(ee, 'VEHICLE_STATUS_CHANGED')) yield payload; }
    },
    alertCreated: {
      subscribe: async function* () { for await (const [payload] of on(ee, 'ALERT_CREATED')) yield payload; }
    },
    alertCreatedBySeverity: {
      subscribe: async function* (_: any, args: { severity: string }) {
        for await (const [payload] of on(ee, 'ALERT_CREATED_SEVERITY')) {
          if (payload.alertCreatedBySeverity.severity === args.severity) {
            yield payload;
          }
        }
      }
    },
  },
  Vehicle: vehicleResolvers.Vehicle,
  MaintenanceRecord: maintenanceResolvers.MaintenanceRecord,
  Assignment: vehicleResolvers.Assignment,
  Alert: alertResolvers.Alert,
  Driver: {
    ...vehicleResolvers.Driver,
    ...driverResolvers.Driver,
  },
};