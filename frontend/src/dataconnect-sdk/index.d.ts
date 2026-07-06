import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Company_Key {
  id: UUIDString;
  __typename?: 'Company_Key';
}

export interface CreateCompanyData {
  company_insert: Company_Key;
}

export interface CreateCompanyVariables {
  name: string;
  slug: string;
  logoUrl?: string | null;
  brandingPrimaryColor?: string | null;
  subscriptionPlan?: string | null;
}

export interface CreateDriverData {
  driver_insert: Driver_Key;
}

export interface CreateDriverVariables {
  companyId: UUIDString;
  name: string;
  email: string;
  vehicleType?: string | null;
  vehiclePlate?: string | null;
  userId?: UUIDString | null;
}

export interface CreateOrderData {
  order_insert: Order_Key;
}

export interface CreateOrderVariables {
  companyId: UUIDString;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string | null;
  customerLat?: number | null;
  customerLng?: number | null;
  priority?: string | null;
  items?: string | null;
  notes?: string | null;
  estimatedDelivery?: TimestampString | null;
}

export interface CreateUserProfileData {
  user_insert: User_Key;
}

export interface CreateUserProfileVariables {
  uid: string;
  name: string;
  email: string;
  role: string;
  companyId?: UUIDString | null;
}

export interface DeleteCompanyData {
  company_delete?: Company_Key | null;
}

export interface DeleteCompanyVariables {
  id: UUIDString;
}

export interface DeleteDriverData {
  driver_delete?: Driver_Key | null;
}

export interface DeleteDriverVariables {
  id: UUIDString;
}

export interface DeleteOrderData {
  order_delete?: Order_Key | null;
}

export interface DeleteOrderVariables {
  id: UUIDString;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface DeleteUserVariables {
  id: UUIDString;
}

export interface Driver_Key {
  id: UUIDString;
  __typename?: 'Driver_Key';
}

export interface GetBillingPlanData {
  company?: {
    subscriptionPlan?: string | null;
    subscriptionStatus?: string | null;
    subscriptionStartDate?: DateString | null;
    subscriptionEndDate?: DateString | null;
    mpSubscriptionId?: string | null;
  };
}

export interface GetBillingPlanVariables {
  companyId: UUIDString;
}

export interface GetDriverData {
  driver?: {
    id: UUIDString;
    name: string;
    email: string;
    vehicleType?: string | null;
    vehiclePlate?: string | null;
    status?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    rating?: number | null;
    totalDeliveries?: number | null;
    avatar?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Driver_Key;
}

export interface GetDriverLocationHistoryData {
  locationHistories: ({
    id: UUIDString;
    date: string;
    path: string;
    createdAt?: TimestampString | null;
  } & LocationHistory_Key)[];
}

export interface GetDriverLocationHistoryVariables {
  driverId: UUIDString;
  date: string;
}

export interface GetDriverVariables {
  id: UUIDString;
  companyId: UUIDString;
}

export interface GetMyCompanyData {
  company?: {
    id: UUIDString;
    name: string;
    slug: string;
    logoUrl?: string | null;
    brandingPrimaryColor?: string | null;
    brandingSecondaryColor?: string | null;
    maxDrivers?: number | null;
    subscriptionPlan?: string | null;
    subscriptionStatus?: string | null;
    subscriptionStartDate?: DateString | null;
    subscriptionEndDate?: DateString | null;
    mpSubscriptionId?: string | null;
    active?: boolean | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Company_Key;
}

export interface GetMyCompanyVariables {
  id: UUIDString;
}

export interface GetMyDriverOrdersData {
  users: ({
    id: UUIDString;
    name: string;
    role: string;
  } & User_Key)[];
}

export interface GetMyDriverOrdersVariables {
  uid: string;
}

export interface GetMyProfileData {
  users: ({
    id: UUIDString;
    uid: string;
    name: string;
    email: string;
    role: string;
    active?: boolean | null;
    company?: {
      id: UUIDString;
      name: string;
      slug: string;
      logoUrl?: string | null;
      brandingPrimaryColor?: string | null;
      brandingSecondaryColor?: string | null;
      maxDrivers?: number | null;
      subscriptionPlan?: string | null;
      subscriptionStatus?: string | null;
      subscriptionStartDate?: DateString | null;
      subscriptionEndDate?: DateString | null;
    } & Company_Key;
  } & User_Key)[];
}

export interface GetMyProfileVariables {
  uid: string;
}

export interface GetOrderData {
  order?: {
    id: UUIDString;
    orderNumber: string;
    customerName: string;
    customerAddress: string;
    customerPhone?: string | null;
    customerLat?: number | null;
    customerLng?: number | null;
    status?: string | null;
    priority?: string | null;
    items?: string | null;
    notes?: string | null;
    estimatedDelivery?: TimestampString | null;
    assignedAt?: TimestampString | null;
    transitStartedAt?: TimestampString | null;
    deliveredAt?: TimestampString | null;
    evidenceSignature?: string | null;
    evidencePhoto?: string | null;
    evidenceRecipientName?: string | null;
    evidenceDeliveredLat?: number | null;
    evidenceDeliveredLng?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
    company: {
      id: UUIDString;
      name: string;
      logoUrl?: string | null;
      brandingPrimaryColor?: string | null;
      brandingSecondaryColor?: string | null;
    } & Company_Key;
    driver?: {
      id: UUIDString;
      name: string;
      status?: string | null;
      vehicleType?: string | null;
      vehiclePlate?: string | null;
      locationLat?: number | null;
      locationLng?: number | null;
    } & Driver_Key;
  } & Order_Key;
}

export interface GetOrderVariables {
  id: UUIDString;
  companyId: UUIDString;
}

export interface GetStatsSummaryData {
  orders: ({
    id: UUIDString;
    status?: string | null;
  } & Order_Key)[];
  drivers: ({
    id: UUIDString;
    status?: string | null;
  } & Driver_Key)[];
}

export interface GetStatsSummaryVariables {
  companyId: UUIDString;
}

export interface ListCompaniesData {
  companies: ({
    id: UUIDString;
    name: string;
    slug: string;
    logoUrl?: string | null;
    brandingPrimaryColor?: string | null;
    subscriptionPlan?: string | null;
    subscriptionStatus?: string | null;
    active?: boolean | null;
    createdAt?: TimestampString | null;
  } & Company_Key)[];
}

export interface ListDriversByStatusData {
  drivers: ({
    id: UUIDString;
    name: string;
    email: string;
    vehicleType?: string | null;
    vehiclePlate?: string | null;
    status?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    rating?: number | null;
    totalDeliveries?: number | null;
    avatar?: string | null;
  } & Driver_Key)[];
}

export interface ListDriversByStatusVariables {
  companyId: UUIDString;
  status: string;
}

export interface ListDriversData {
  drivers: ({
    id: UUIDString;
    name: string;
    email: string;
    vehicleType?: string | null;
    vehiclePlate?: string | null;
    status?: string | null;
    locationLat?: number | null;
    locationLng?: number | null;
    rating?: number | null;
    totalDeliveries?: number | null;
    avatar?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Driver_Key)[];
}

export interface ListDriversVariables {
  companyId: UUIDString;
}

export interface ListOrdersAllData {
  orders: ({
    id: UUIDString;
    orderNumber: string;
    customerName: string;
    customerAddress: string;
    customerPhone?: string | null;
    customerLat?: number | null;
    customerLng?: number | null;
    status?: string | null;
    priority?: string | null;
    items?: string | null;
    notes?: string | null;
    estimatedDelivery?: TimestampString | null;
    assignedAt?: TimestampString | null;
    transitStartedAt?: TimestampString | null;
    deliveredAt?: TimestampString | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
    driver?: {
      id: UUIDString;
      name: string;
      status?: string | null;
      vehicleType?: string | null;
      vehiclePlate?: string | null;
    } & Driver_Key;
  } & Order_Key)[];
}

export interface ListOrdersAllVariables {
  companyId: UUIDString;
  limit: number;
  offset: number;
}

export interface ListOrdersData {
  orders: ({
    id: UUIDString;
    orderNumber: string;
    customerName: string;
    customerAddress: string;
    customerPhone?: string | null;
    customerLat?: number | null;
    customerLng?: number | null;
    status?: string | null;
    priority?: string | null;
    items?: string | null;
    notes?: string | null;
    estimatedDelivery?: TimestampString | null;
    assignedAt?: TimestampString | null;
    transitStartedAt?: TimestampString | null;
    deliveredAt?: TimestampString | null;
    evidenceSignature?: string | null;
    evidencePhoto?: string | null;
    evidenceRecipientName?: string | null;
    evidenceDeliveredLat?: number | null;
    evidenceDeliveredLng?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
    driver?: {
      id: UUIDString;
      name: string;
      status?: string | null;
      vehicleType?: string | null;
      vehiclePlate?: string | null;
      locationLat?: number | null;
      locationLng?: number | null;
    } & Driver_Key;
  } & Order_Key)[];
}

export interface ListOrdersVariables {
  companyId: UUIDString;
  status?: string | null;
  limit: number;
  offset: number;
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    uid: string;
    name: string;
    email: string;
    role: string;
    active?: boolean | null;
    createdAt?: TimestampString | null;
  } & User_Key)[];
}

export interface ListUsersVariables {
  companyId: UUIDString;
}

export interface LocationHistory_Key {
  id: UUIDString;
  __typename?: 'LocationHistory_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface RegisterCompanyData {
  company_insert: Company_Key;
}

export interface RegisterCompanyVariables {
  uid: string;
  name: string;
  email: string;
  companyName: string;
  slug: string;
}

export interface TrackOrderData {
  orders: ({
    id: UUIDString;
    orderNumber: string;
    customerName: string;
    customerAddress: string;
    customerPhone?: string | null;
    customerLat?: number | null;
    customerLng?: number | null;
    status?: string | null;
    items?: string | null;
    updatedAt?: TimestampString | null;
    company: {
      id: UUIDString;
      name: string;
      logoUrl?: string | null;
      brandingPrimaryColor?: string | null;
    } & Company_Key;
    driver?: {
      id: UUIDString;
      name: string;
      status?: string | null;
      locationLat?: number | null;
      locationLng?: number | null;
    } & Driver_Key;
  } & Order_Key)[];
}

export interface TrackOrderVariables {
  orderNumber: string;
}

export interface UpdateCompanyData {
  company_update?: Company_Key | null;
}

export interface UpdateCompanySubscriptionData {
  company_update?: Company_Key | null;
}

export interface UpdateCompanySubscriptionVariables {
  id: UUIDString;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: DateString;
  subscriptionEndDate: DateString;
  mpSubscriptionId?: string | null;
  mpCustomerId?: string | null;
}

export interface UpdateCompanyVariables {
  id: UUIDString;
  name?: string | null;
  logoUrl?: string | null;
  brandingPrimaryColor?: string | null;
  brandingSecondaryColor?: string | null;
  maxDrivers?: number | null;
}

export interface UpdateDriverData {
  driver_update?: Driver_Key | null;
}

export interface UpdateDriverLocationData {
  driver_update?: Driver_Key | null;
}

export interface UpdateDriverLocationVariables {
  id: UUIDString;
  locationLat: number;
  locationLng: number;
  status?: string | null;
}

export interface UpdateDriverStatusData {
  driver_update?: Driver_Key | null;
}

export interface UpdateDriverStatusVariables {
  id: UUIDString;
  status: string;
}

export interface UpdateDriverVariables {
  id: UUIDString;
  name?: string | null;
  email?: string | null;
  vehicleType?: string | null;
  vehiclePlate?: string | null;
  status?: string | null;
  rating?: number | null;
  avatar?: string | null;
}

export interface UpdateOrderData {
  order_update?: Order_Key | null;
}

export interface UpdateOrderEvidenceData {
  order_update?: Order_Key | null;
}

export interface UpdateOrderEvidenceVariables {
  id: UUIDString;
  status: string;
  deliveredAt: TimestampString;
  evidenceSignature?: string | null;
  evidencePhoto?: string | null;
  evidenceRecipientName?: string | null;
  evidenceDeliveredLat?: number | null;
  evidenceDeliveredLng?: number | null;
}

export interface UpdateOrderVariables {
  id: UUIDString;
  status?: string | null;
  priority?: string | null;
  driverId?: UUIDString | null;
  customerName?: string | null;
  customerAddress?: string | null;
  customerPhone?: string | null;
  customerLat?: number | null;
  customerLng?: number | null;
  items?: string | null;
  notes?: string | null;
  estimatedDelivery?: TimestampString | null;
  assignedAt?: TimestampString | null;
  transitStartedAt?: TimestampString | null;
  deliveredAt?: TimestampString | null;
}

export interface UpdateUserActiveData {
  user_update?: User_Key | null;
}

export interface UpdateUserActiveVariables {
  id: UUIDString;
  active: boolean;
}

export interface UpsertLocationHistoryData {
  locationHistory_upsert: LocationHistory_Key;
}

export interface UpsertLocationHistoryVariables {
  id: UUIDString;
  driverId: UUIDString;
  companyId: UUIDString;
  date: string;
  path: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface RegisterCompanyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RegisterCompanyVariables): MutationRef<RegisterCompanyData, RegisterCompanyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RegisterCompanyVariables): MutationRef<RegisterCompanyData, RegisterCompanyVariables>;
  operationName: string;
}
export const registerCompanyRef: RegisterCompanyRef;

export function registerCompany(vars: RegisterCompanyVariables): MutationPromise<RegisterCompanyData, RegisterCompanyVariables>;
export function registerCompany(dc: DataConnect, vars: RegisterCompanyVariables): MutationPromise<RegisterCompanyData, RegisterCompanyVariables>;

interface CreateUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserProfileVariables): MutationRef<CreateUserProfileData, CreateUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserProfileVariables): MutationRef<CreateUserProfileData, CreateUserProfileVariables>;
  operationName: string;
}
export const createUserProfileRef: CreateUserProfileRef;

export function createUserProfile(vars: CreateUserProfileVariables): MutationPromise<CreateUserProfileData, CreateUserProfileVariables>;
export function createUserProfile(dc: DataConnect, vars: CreateUserProfileVariables): MutationPromise<CreateUserProfileData, CreateUserProfileVariables>;

interface CreateOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
  operationName: string;
}
export const createOrderRef: CreateOrderRef;

export function createOrder(vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;
export function createOrder(dc: DataConnect, vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface UpdateOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
  operationName: string;
}
export const updateOrderRef: UpdateOrderRef;

export function updateOrder(vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;
export function updateOrder(dc: DataConnect, vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;

interface UpdateOrderEvidenceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderEvidenceVariables): MutationRef<UpdateOrderEvidenceData, UpdateOrderEvidenceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateOrderEvidenceVariables): MutationRef<UpdateOrderEvidenceData, UpdateOrderEvidenceVariables>;
  operationName: string;
}
export const updateOrderEvidenceRef: UpdateOrderEvidenceRef;

export function updateOrderEvidence(vars: UpdateOrderEvidenceVariables): MutationPromise<UpdateOrderEvidenceData, UpdateOrderEvidenceVariables>;
export function updateOrderEvidence(dc: DataConnect, vars: UpdateOrderEvidenceVariables): MutationPromise<UpdateOrderEvidenceData, UpdateOrderEvidenceVariables>;

interface DeleteOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteOrderVariables): MutationRef<DeleteOrderData, DeleteOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteOrderVariables): MutationRef<DeleteOrderData, DeleteOrderVariables>;
  operationName: string;
}
export const deleteOrderRef: DeleteOrderRef;

export function deleteOrder(vars: DeleteOrderVariables): MutationPromise<DeleteOrderData, DeleteOrderVariables>;
export function deleteOrder(dc: DataConnect, vars: DeleteOrderVariables): MutationPromise<DeleteOrderData, DeleteOrderVariables>;

interface CreateDriverRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDriverVariables): MutationRef<CreateDriverData, CreateDriverVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDriverVariables): MutationRef<CreateDriverData, CreateDriverVariables>;
  operationName: string;
}
export const createDriverRef: CreateDriverRef;

export function createDriver(vars: CreateDriverVariables): MutationPromise<CreateDriverData, CreateDriverVariables>;
export function createDriver(dc: DataConnect, vars: CreateDriverVariables): MutationPromise<CreateDriverData, CreateDriverVariables>;

interface UpdateDriverRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDriverVariables): MutationRef<UpdateDriverData, UpdateDriverVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateDriverVariables): MutationRef<UpdateDriverData, UpdateDriverVariables>;
  operationName: string;
}
export const updateDriverRef: UpdateDriverRef;

export function updateDriver(vars: UpdateDriverVariables): MutationPromise<UpdateDriverData, UpdateDriverVariables>;
export function updateDriver(dc: DataConnect, vars: UpdateDriverVariables): MutationPromise<UpdateDriverData, UpdateDriverVariables>;

interface UpdateDriverLocationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDriverLocationVariables): MutationRef<UpdateDriverLocationData, UpdateDriverLocationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateDriverLocationVariables): MutationRef<UpdateDriverLocationData, UpdateDriverLocationVariables>;
  operationName: string;
}
export const updateDriverLocationRef: UpdateDriverLocationRef;

export function updateDriverLocation(vars: UpdateDriverLocationVariables): MutationPromise<UpdateDriverLocationData, UpdateDriverLocationVariables>;
export function updateDriverLocation(dc: DataConnect, vars: UpdateDriverLocationVariables): MutationPromise<UpdateDriverLocationData, UpdateDriverLocationVariables>;

interface UpdateDriverStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDriverStatusVariables): MutationRef<UpdateDriverStatusData, UpdateDriverStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateDriverStatusVariables): MutationRef<UpdateDriverStatusData, UpdateDriverStatusVariables>;
  operationName: string;
}
export const updateDriverStatusRef: UpdateDriverStatusRef;

export function updateDriverStatus(vars: UpdateDriverStatusVariables): MutationPromise<UpdateDriverStatusData, UpdateDriverStatusVariables>;
export function updateDriverStatus(dc: DataConnect, vars: UpdateDriverStatusVariables): MutationPromise<UpdateDriverStatusData, UpdateDriverStatusVariables>;

interface DeleteDriverRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteDriverVariables): MutationRef<DeleteDriverData, DeleteDriverVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteDriverVariables): MutationRef<DeleteDriverData, DeleteDriverVariables>;
  operationName: string;
}
export const deleteDriverRef: DeleteDriverRef;

export function deleteDriver(vars: DeleteDriverVariables): MutationPromise<DeleteDriverData, DeleteDriverVariables>;
export function deleteDriver(dc: DataConnect, vars: DeleteDriverVariables): MutationPromise<DeleteDriverData, DeleteDriverVariables>;

interface UpsertLocationHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertLocationHistoryVariables): MutationRef<UpsertLocationHistoryData, UpsertLocationHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertLocationHistoryVariables): MutationRef<UpsertLocationHistoryData, UpsertLocationHistoryVariables>;
  operationName: string;
}
export const upsertLocationHistoryRef: UpsertLocationHistoryRef;

export function upsertLocationHistory(vars: UpsertLocationHistoryVariables): MutationPromise<UpsertLocationHistoryData, UpsertLocationHistoryVariables>;
export function upsertLocationHistory(dc: DataConnect, vars: UpsertLocationHistoryVariables): MutationPromise<UpsertLocationHistoryData, UpsertLocationHistoryVariables>;

interface UpdateCompanyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCompanyVariables): MutationRef<UpdateCompanyData, UpdateCompanyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCompanyVariables): MutationRef<UpdateCompanyData, UpdateCompanyVariables>;
  operationName: string;
}
export const updateCompanyRef: UpdateCompanyRef;

export function updateCompany(vars: UpdateCompanyVariables): MutationPromise<UpdateCompanyData, UpdateCompanyVariables>;
export function updateCompany(dc: DataConnect, vars: UpdateCompanyVariables): MutationPromise<UpdateCompanyData, UpdateCompanyVariables>;

interface UpdateCompanySubscriptionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCompanySubscriptionVariables): MutationRef<UpdateCompanySubscriptionData, UpdateCompanySubscriptionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCompanySubscriptionVariables): MutationRef<UpdateCompanySubscriptionData, UpdateCompanySubscriptionVariables>;
  operationName: string;
}
export const updateCompanySubscriptionRef: UpdateCompanySubscriptionRef;

export function updateCompanySubscription(vars: UpdateCompanySubscriptionVariables): MutationPromise<UpdateCompanySubscriptionData, UpdateCompanySubscriptionVariables>;
export function updateCompanySubscription(dc: DataConnect, vars: UpdateCompanySubscriptionVariables): MutationPromise<UpdateCompanySubscriptionData, UpdateCompanySubscriptionVariables>;

interface CreateCompanyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCompanyVariables): MutationRef<CreateCompanyData, CreateCompanyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCompanyVariables): MutationRef<CreateCompanyData, CreateCompanyVariables>;
  operationName: string;
}
export const createCompanyRef: CreateCompanyRef;

export function createCompany(vars: CreateCompanyVariables): MutationPromise<CreateCompanyData, CreateCompanyVariables>;
export function createCompany(dc: DataConnect, vars: CreateCompanyVariables): MutationPromise<CreateCompanyData, CreateCompanyVariables>;

interface DeleteCompanyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCompanyVariables): MutationRef<DeleteCompanyData, DeleteCompanyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCompanyVariables): MutationRef<DeleteCompanyData, DeleteCompanyVariables>;
  operationName: string;
}
export const deleteCompanyRef: DeleteCompanyRef;

export function deleteCompany(vars: DeleteCompanyVariables): MutationPromise<DeleteCompanyData, DeleteCompanyVariables>;
export function deleteCompany(dc: DataConnect, vars: DeleteCompanyVariables): MutationPromise<DeleteCompanyData, DeleteCompanyVariables>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;
export function deleteUser(dc: DataConnect, vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;

interface UpdateUserActiveRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserActiveVariables): MutationRef<UpdateUserActiveData, UpdateUserActiveVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserActiveVariables): MutationRef<UpdateUserActiveData, UpdateUserActiveVariables>;
  operationName: string;
}
export const updateUserActiveRef: UpdateUserActiveRef;

export function updateUserActive(vars: UpdateUserActiveVariables): MutationPromise<UpdateUserActiveData, UpdateUserActiveVariables>;
export function updateUserActive(dc: DataConnect, vars: UpdateUserActiveVariables): MutationPromise<UpdateUserActiveData, UpdateUserActiveVariables>;

interface GetMyCompanyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyCompanyVariables): QueryRef<GetMyCompanyData, GetMyCompanyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMyCompanyVariables): QueryRef<GetMyCompanyData, GetMyCompanyVariables>;
  operationName: string;
}
export const getMyCompanyRef: GetMyCompanyRef;

export function getMyCompany(vars: GetMyCompanyVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyCompanyData, GetMyCompanyVariables>;
export function getMyCompany(dc: DataConnect, vars: GetMyCompanyVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyCompanyData, GetMyCompanyVariables>;

interface GetMyProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyProfileVariables): QueryRef<GetMyProfileData, GetMyProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMyProfileVariables): QueryRef<GetMyProfileData, GetMyProfileVariables>;
  operationName: string;
}
export const getMyProfileRef: GetMyProfileRef;

export function getMyProfile(vars: GetMyProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyProfileData, GetMyProfileVariables>;
export function getMyProfile(dc: DataConnect, vars: GetMyProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyProfileData, GetMyProfileVariables>;

interface ListOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListOrdersVariables): QueryRef<ListOrdersData, ListOrdersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListOrdersVariables): QueryRef<ListOrdersData, ListOrdersVariables>;
  operationName: string;
}
export const listOrdersRef: ListOrdersRef;

export function listOrders(vars: ListOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersData, ListOrdersVariables>;
export function listOrders(dc: DataConnect, vars: ListOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersData, ListOrdersVariables>;

interface ListOrdersAllRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListOrdersAllVariables): QueryRef<ListOrdersAllData, ListOrdersAllVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListOrdersAllVariables): QueryRef<ListOrdersAllData, ListOrdersAllVariables>;
  operationName: string;
}
export const listOrdersAllRef: ListOrdersAllRef;

export function listOrdersAll(vars: ListOrdersAllVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersAllData, ListOrdersAllVariables>;
export function listOrdersAll(dc: DataConnect, vars: ListOrdersAllVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersAllData, ListOrdersAllVariables>;

interface GetOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrderVariables): QueryRef<GetOrderData, GetOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetOrderVariables): QueryRef<GetOrderData, GetOrderVariables>;
  operationName: string;
}
export const getOrderRef: GetOrderRef;

export function getOrder(vars: GetOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrderData, GetOrderVariables>;
export function getOrder(dc: DataConnect, vars: GetOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrderData, GetOrderVariables>;

interface TrackOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: TrackOrderVariables): QueryRef<TrackOrderData, TrackOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: TrackOrderVariables): QueryRef<TrackOrderData, TrackOrderVariables>;
  operationName: string;
}
export const trackOrderRef: TrackOrderRef;

export function trackOrder(vars: TrackOrderVariables, options?: ExecuteQueryOptions): QueryPromise<TrackOrderData, TrackOrderVariables>;
export function trackOrder(dc: DataConnect, vars: TrackOrderVariables, options?: ExecuteQueryOptions): QueryPromise<TrackOrderData, TrackOrderVariables>;

interface ListDriversRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDriversVariables): QueryRef<ListDriversData, ListDriversVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListDriversVariables): QueryRef<ListDriversData, ListDriversVariables>;
  operationName: string;
}
export const listDriversRef: ListDriversRef;

export function listDrivers(vars: ListDriversVariables, options?: ExecuteQueryOptions): QueryPromise<ListDriversData, ListDriversVariables>;
export function listDrivers(dc: DataConnect, vars: ListDriversVariables, options?: ExecuteQueryOptions): QueryPromise<ListDriversData, ListDriversVariables>;

interface ListDriversByStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDriversByStatusVariables): QueryRef<ListDriversByStatusData, ListDriversByStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListDriversByStatusVariables): QueryRef<ListDriversByStatusData, ListDriversByStatusVariables>;
  operationName: string;
}
export const listDriversByStatusRef: ListDriversByStatusRef;

export function listDriversByStatus(vars: ListDriversByStatusVariables, options?: ExecuteQueryOptions): QueryPromise<ListDriversByStatusData, ListDriversByStatusVariables>;
export function listDriversByStatus(dc: DataConnect, vars: ListDriversByStatusVariables, options?: ExecuteQueryOptions): QueryPromise<ListDriversByStatusData, ListDriversByStatusVariables>;

interface GetDriverRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDriverVariables): QueryRef<GetDriverData, GetDriverVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDriverVariables): QueryRef<GetDriverData, GetDriverVariables>;
  operationName: string;
}
export const getDriverRef: GetDriverRef;

export function getDriver(vars: GetDriverVariables, options?: ExecuteQueryOptions): QueryPromise<GetDriverData, GetDriverVariables>;
export function getDriver(dc: DataConnect, vars: GetDriverVariables, options?: ExecuteQueryOptions): QueryPromise<GetDriverData, GetDriverVariables>;

interface GetMyDriverOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyDriverOrdersVariables): QueryRef<GetMyDriverOrdersData, GetMyDriverOrdersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMyDriverOrdersVariables): QueryRef<GetMyDriverOrdersData, GetMyDriverOrdersVariables>;
  operationName: string;
}
export const getMyDriverOrdersRef: GetMyDriverOrdersRef;

export function getMyDriverOrders(vars: GetMyDriverOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyDriverOrdersData, GetMyDriverOrdersVariables>;
export function getMyDriverOrders(dc: DataConnect, vars: GetMyDriverOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyDriverOrdersData, GetMyDriverOrdersVariables>;

interface GetStatsSummaryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStatsSummaryVariables): QueryRef<GetStatsSummaryData, GetStatsSummaryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetStatsSummaryVariables): QueryRef<GetStatsSummaryData, GetStatsSummaryVariables>;
  operationName: string;
}
export const getStatsSummaryRef: GetStatsSummaryRef;

export function getStatsSummary(vars: GetStatsSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<GetStatsSummaryData, GetStatsSummaryVariables>;
export function getStatsSummary(dc: DataConnect, vars: GetStatsSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<GetStatsSummaryData, GetStatsSummaryVariables>;

interface GetDriverLocationHistoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDriverLocationHistoryVariables): QueryRef<GetDriverLocationHistoryData, GetDriverLocationHistoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDriverLocationHistoryVariables): QueryRef<GetDriverLocationHistoryData, GetDriverLocationHistoryVariables>;
  operationName: string;
}
export const getDriverLocationHistoryRef: GetDriverLocationHistoryRef;

export function getDriverLocationHistory(vars: GetDriverLocationHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetDriverLocationHistoryData, GetDriverLocationHistoryVariables>;
export function getDriverLocationHistory(dc: DataConnect, vars: GetDriverLocationHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetDriverLocationHistoryData, GetDriverLocationHistoryVariables>;

interface GetBillingPlanRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBillingPlanVariables): QueryRef<GetBillingPlanData, GetBillingPlanVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBillingPlanVariables): QueryRef<GetBillingPlanData, GetBillingPlanVariables>;
  operationName: string;
}
export const getBillingPlanRef: GetBillingPlanRef;

export function getBillingPlan(vars: GetBillingPlanVariables, options?: ExecuteQueryOptions): QueryPromise<GetBillingPlanData, GetBillingPlanVariables>;
export function getBillingPlan(dc: DataConnect, vars: GetBillingPlanVariables, options?: ExecuteQueryOptions): QueryPromise<GetBillingPlanData, GetBillingPlanVariables>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListUsersVariables): QueryRef<ListUsersData, ListUsersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListUsersVariables): QueryRef<ListUsersData, ListUsersVariables>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(vars: ListUsersVariables, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, ListUsersVariables>;
export function listUsers(dc: DataConnect, vars: ListUsersVariables, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, ListUsersVariables>;

interface ListCompaniesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCompaniesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCompaniesData, undefined>;
  operationName: string;
}
export const listCompaniesRef: ListCompaniesRef;

export function listCompanies(options?: ExecuteQueryOptions): QueryPromise<ListCompaniesData, undefined>;
export function listCompanies(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCompaniesData, undefined>;

