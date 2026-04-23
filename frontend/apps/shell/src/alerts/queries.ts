import { gql } from '@apollo/client';

export const GET_ALERTS = gql`
  query GetAlerts($status: AlertStatus, $severity: AlertSeverity, $limit: Int, $offset: Int) {
    alerts(status: $status, severity: $severity, limit: $limit, offset: $offset) {
      total_count
      items {
        id
        type
        severity
        status
        message
        created_at
        acknowledged_at
        resolved_at
        vehicle { id plate_number }
        driver  { id first_name last_name }
      }
    }
  }
`;

export const ACKNOWLEDGE_ALERT = gql`
  mutation AcknowledgeAlert($id: ID!) {
    acknowledgeAlert(id: $id) { id status acknowledged_at }
  }
`;

export const RESOLVE_ALERT = gql`
  mutation ResolveAlert($id: ID!) {
    resolveAlert(id: $id) { id status resolved_at }
  }
`;

export const ALERT_CREATED_SUB = gql`
  subscription OnAlertCreated {
    alertCreated {
      id type severity message created_at
      vehicle { plate_number }
    }
  }
`;
