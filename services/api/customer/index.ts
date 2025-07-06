// Export all customer API interfaces and functions
export {
  customerProfileAPI,
  type User,
  type CustomerProfile,
  type UpdateCustomerProfileRequest,
  type CustomerProfileResponse,
  type UpdateCustomerProfileResponse,
} from './profile';

export {
  wasteDropRequestAPI,
  type LocationRequest,
  type LocationResponse,
  type WasteDropRequestItems,
  type WasteDropRequestRequest,
  type WasteDropRequestSimpleResponse,
  type WasteDropRequestResponse,
  type CreateWasteDropRequestResponse,
} from './waste-drop-request';
