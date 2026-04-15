import { gql } from '@apollo/client';

export const GET_DRIVERS = gql`
  query GetDrivers {
    drivers {
      total_count
      items {
        id
        keycloak_user_id
        first_name
        last_name
        email
        phone
        status
        license {
          license_number
        }
      }
    }
  }
`;

export const CREATE_DRIVER = gql`
  mutation CreateDriver($keycloak_user_id: ID!, $first_name: String!, $last_name: String!, $email: String!, $phone: String, $employee_id: String) {
    createDriver(keycloak_user_id: $keycloak_user_id, first_name: $first_name, last_name: $last_name, email: $email, phone: $phone, employee_id: $employee_id) {
      id
      first_name
      last_name
      status
    }
  }
`;

export const UPDATE_DRIVER_STATUS = gql`
  mutation UpdateDriverStatus($id: ID!, $status: DriverStatus!) {
    updateDriverStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_DRIVER = gql`
  mutation UpdateDriver($id: ID!, $keycloak_user_id: ID!, $first_name: String, $last_name: String, $email: String, $phone: String, $employee_id: String) {
    updateDriver(id: $id, keycloak_user_id: $keycloak_user_id, first_name: $first_name, last_name: $last_name, email: $email, phone: $phone, employee_id: $employee_id) {
      id
      first_name
      last_name
      email
      phone
      employee_id
    }
  }
`;

export const DELETE_DRIVER = gql`
  mutation DeleteDriver($id: ID!) {
    deleteDriver(id: $id)
  }
`;