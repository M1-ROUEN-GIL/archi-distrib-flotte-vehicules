import { gql } from '@apollo/client';

export const GET_MAINTENANCES = gql`
  query GetMaintenances {
    maintenanceRecords {
      total_count
      items {
        id
        vehicle {
          id
          plate_number
        }
        type
        status
        priority
        scheduled_date
        completed_date
        cost_eur
        description
        notes
      }
    }
  }
`;

export const CREATE_MAINTENANCE = gql`
  # 👇 Correction ici : On utilise MaintenanceType! et MaintenancePriority
  mutation CreateMaintenance($vehicle_id: ID!, $type: MaintenanceType!, $priority: MaintenancePriority, $scheduled_date: String!, $description: String) {
    createMaintenanceRecord(vehicle_id: $vehicle_id, type: $type, priority: $priority, scheduled_date: $scheduled_date, description: $description) {
      id
      status
    }
  }
`;

export const UPDATE_MAINTENANCE_STATUS = gql`
  # 👇 Correction ici : On utilise MaintenanceStatus!
  mutation UpdateMaintenanceStatus($id: ID!, $status: MaintenanceStatus!, $cost_eur: Float, $notes: String) {
    updateMaintenanceStatus(id: $id, status: $status, cost_eur: $cost_eur, notes: $notes) {
      id
      status
      cost_eur
    }
  }
`;

export const UPDATE_MAINTENANCE_RECORD = gql`
  # 👇 Correction ici : On utilise les types Enum de ton schéma
  mutation UpdateMaintenanceRecord(
    $id: ID!
    $technician_id: ID
    $type: MaintenanceType
    $priority: MaintenancePriority
    $scheduled_date: String
    $completed_date: String
    $cost_eur: Float
    $mileage_at_service: Int
    $next_service_km: Int
    $parts_used: [String!]
    $description: String
    $notes: String
  ) {
    updateMaintenanceRecord(
      id: $id
      technician_id: $technician_id
      type: $type
      priority: $priority
      scheduled_date: $scheduled_date
      completed_date: $completed_date
      cost_eur: $cost_eur
      mileage_at_service: $mileage_at_service
      next_service_km: $next_service_km
      parts_used: $parts_used
      description: $description
      notes: $notes
    ) {
      id
      status
    }
  }
`;