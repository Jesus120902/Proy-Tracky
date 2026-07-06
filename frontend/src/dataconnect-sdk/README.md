# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `tracky-connector`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetMyCompany*](#getmycompany)
  - [*GetMyProfile*](#getmyprofile)
  - [*ListOrders*](#listorders)
  - [*ListOrdersAll*](#listordersall)
  - [*GetOrder*](#getorder)
  - [*TrackOrder*](#trackorder)
  - [*ListDrivers*](#listdrivers)
  - [*ListDriversByStatus*](#listdriversbystatus)
  - [*GetDriver*](#getdriver)
  - [*GetMyDriverOrders*](#getmydriverorders)
  - [*GetStatsSummary*](#getstatssummary)
  - [*GetDriverLocationHistory*](#getdriverlocationhistory)
  - [*GetBillingPlan*](#getbillingplan)
  - [*ListUsers*](#listusers)
  - [*ListCompanies*](#listcompanies)
- [**Mutations**](#mutations)
  - [*RegisterCompany*](#registercompany)
  - [*CreateUserProfile*](#createuserprofile)
  - [*CreateOrder*](#createorder)
  - [*UpdateOrder*](#updateorder)
  - [*UpdateOrderEvidence*](#updateorderevidence)
  - [*DeleteOrder*](#deleteorder)
  - [*CreateDriver*](#createdriver)
  - [*UpdateDriver*](#updatedriver)
  - [*UpdateDriverLocation*](#updatedriverlocation)
  - [*UpdateDriverStatus*](#updatedriverstatus)
  - [*DeleteDriver*](#deletedriver)
  - [*UpsertLocationHistory*](#upsertlocationhistory)
  - [*UpdateCompany*](#updatecompany)
  - [*UpdateCompanySubscription*](#updatecompanysubscription)
  - [*CreateCompany*](#createcompany)
  - [*DeleteCompany*](#deletecompany)
  - [*DeleteUser*](#deleteuser)
  - [*UpdateUserActive*](#updateuseractive)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `tracky-connector`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@tracky/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@tracky/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@tracky/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `tracky-connector` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetMyCompany
You can execute the `GetMyCompany` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getMyCompany(vars: GetMyCompanyVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyCompanyData, GetMyCompanyVariables>;

interface GetMyCompanyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyCompanyVariables): QueryRef<GetMyCompanyData, GetMyCompanyVariables>;
}
export const getMyCompanyRef: GetMyCompanyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyCompany(dc: DataConnect, vars: GetMyCompanyVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyCompanyData, GetMyCompanyVariables>;

interface GetMyCompanyRef {
  ...
  (dc: DataConnect, vars: GetMyCompanyVariables): QueryRef<GetMyCompanyData, GetMyCompanyVariables>;
}
export const getMyCompanyRef: GetMyCompanyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyCompanyRef:
```typescript
const name = getMyCompanyRef.operationName;
console.log(name);
```

### Variables
The `GetMyCompany` query requires an argument of type `GetMyCompanyVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMyCompanyVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetMyCompany` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyCompanyData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyCompany`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyCompany, GetMyCompanyVariables } from '@tracky/dataconnect';

// The `GetMyCompany` query requires an argument of type `GetMyCompanyVariables`:
const getMyCompanyVars: GetMyCompanyVariables = {
  id: ..., 
};

// Call the `getMyCompany()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyCompany(getMyCompanyVars);
// Variables can be defined inline as well.
const { data } = await getMyCompany({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyCompany(dataConnect, getMyCompanyVars);

console.log(data.company);

// Or, you can use the `Promise` API.
getMyCompany(getMyCompanyVars).then((response) => {
  const data = response.data;
  console.log(data.company);
});
```

### Using `GetMyCompany`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyCompanyRef, GetMyCompanyVariables } from '@tracky/dataconnect';

// The `GetMyCompany` query requires an argument of type `GetMyCompanyVariables`:
const getMyCompanyVars: GetMyCompanyVariables = {
  id: ..., 
};

// Call the `getMyCompanyRef()` function to get a reference to the query.
const ref = getMyCompanyRef(getMyCompanyVars);
// Variables can be defined inline as well.
const ref = getMyCompanyRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyCompanyRef(dataConnect, getMyCompanyVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.company);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.company);
});
```

## GetMyProfile
You can execute the `GetMyProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getMyProfile(vars: GetMyProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyProfileData, GetMyProfileVariables>;

interface GetMyProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyProfileVariables): QueryRef<GetMyProfileData, GetMyProfileVariables>;
}
export const getMyProfileRef: GetMyProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyProfile(dc: DataConnect, vars: GetMyProfileVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyProfileData, GetMyProfileVariables>;

interface GetMyProfileRef {
  ...
  (dc: DataConnect, vars: GetMyProfileVariables): QueryRef<GetMyProfileData, GetMyProfileVariables>;
}
export const getMyProfileRef: GetMyProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyProfileRef:
```typescript
const name = getMyProfileRef.operationName;
console.log(name);
```

### Variables
The `GetMyProfile` query requires an argument of type `GetMyProfileVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMyProfileVariables {
  uid: string;
}
```
### Return Type
Recall that executing the `GetMyProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyProfileData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyProfile, GetMyProfileVariables } from '@tracky/dataconnect';

// The `GetMyProfile` query requires an argument of type `GetMyProfileVariables`:
const getMyProfileVars: GetMyProfileVariables = {
  uid: ..., 
};

// Call the `getMyProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyProfile(getMyProfileVars);
// Variables can be defined inline as well.
const { data } = await getMyProfile({ uid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyProfile(dataConnect, getMyProfileVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getMyProfile(getMyProfileVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetMyProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyProfileRef, GetMyProfileVariables } from '@tracky/dataconnect';

// The `GetMyProfile` query requires an argument of type `GetMyProfileVariables`:
const getMyProfileVars: GetMyProfileVariables = {
  uid: ..., 
};

// Call the `getMyProfileRef()` function to get a reference to the query.
const ref = getMyProfileRef(getMyProfileVars);
// Variables can be defined inline as well.
const ref = getMyProfileRef({ uid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyProfileRef(dataConnect, getMyProfileVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListOrders
You can execute the `ListOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
listOrders(vars: ListOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersData, ListOrdersVariables>;

interface ListOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListOrdersVariables): QueryRef<ListOrdersData, ListOrdersVariables>;
}
export const listOrdersRef: ListOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOrders(dc: DataConnect, vars: ListOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersData, ListOrdersVariables>;

interface ListOrdersRef {
  ...
  (dc: DataConnect, vars: ListOrdersVariables): QueryRef<ListOrdersData, ListOrdersVariables>;
}
export const listOrdersRef: ListOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOrdersRef:
```typescript
const name = listOrdersRef.operationName;
console.log(name);
```

### Variables
The `ListOrders` query requires an argument of type `ListOrdersVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListOrdersVariables {
  companyId: UUIDString;
  status?: string | null;
  limit: number;
  offset: number;
}
```
### Return Type
Recall that executing the `ListOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOrdersData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOrders, ListOrdersVariables } from '@tracky/dataconnect';

// The `ListOrders` query requires an argument of type `ListOrdersVariables`:
const listOrdersVars: ListOrdersVariables = {
  companyId: ..., 
  status: ..., // optional
  limit: ..., 
  offset: ..., 
};

// Call the `listOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOrders(listOrdersVars);
// Variables can be defined inline as well.
const { data } = await listOrders({ companyId: ..., status: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOrders(dataConnect, listOrdersVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
listOrders(listOrdersVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `ListOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOrdersRef, ListOrdersVariables } from '@tracky/dataconnect';

// The `ListOrders` query requires an argument of type `ListOrdersVariables`:
const listOrdersVars: ListOrdersVariables = {
  companyId: ..., 
  status: ..., // optional
  limit: ..., 
  offset: ..., 
};

// Call the `listOrdersRef()` function to get a reference to the query.
const ref = listOrdersRef(listOrdersVars);
// Variables can be defined inline as well.
const ref = listOrdersRef({ companyId: ..., status: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOrdersRef(dataConnect, listOrdersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## ListOrdersAll
You can execute the `ListOrdersAll` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
listOrdersAll(vars: ListOrdersAllVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersAllData, ListOrdersAllVariables>;

interface ListOrdersAllRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListOrdersAllVariables): QueryRef<ListOrdersAllData, ListOrdersAllVariables>;
}
export const listOrdersAllRef: ListOrdersAllRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOrdersAll(dc: DataConnect, vars: ListOrdersAllVariables, options?: ExecuteQueryOptions): QueryPromise<ListOrdersAllData, ListOrdersAllVariables>;

interface ListOrdersAllRef {
  ...
  (dc: DataConnect, vars: ListOrdersAllVariables): QueryRef<ListOrdersAllData, ListOrdersAllVariables>;
}
export const listOrdersAllRef: ListOrdersAllRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOrdersAllRef:
```typescript
const name = listOrdersAllRef.operationName;
console.log(name);
```

### Variables
The `ListOrdersAll` query requires an argument of type `ListOrdersAllVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListOrdersAllVariables {
  companyId: UUIDString;
  limit: number;
  offset: number;
}
```
### Return Type
Recall that executing the `ListOrdersAll` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOrdersAllData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListOrdersAll`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOrdersAll, ListOrdersAllVariables } from '@tracky/dataconnect';

// The `ListOrdersAll` query requires an argument of type `ListOrdersAllVariables`:
const listOrdersAllVars: ListOrdersAllVariables = {
  companyId: ..., 
  limit: ..., 
  offset: ..., 
};

// Call the `listOrdersAll()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOrdersAll(listOrdersAllVars);
// Variables can be defined inline as well.
const { data } = await listOrdersAll({ companyId: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOrdersAll(dataConnect, listOrdersAllVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
listOrdersAll(listOrdersAllVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `ListOrdersAll`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOrdersAllRef, ListOrdersAllVariables } from '@tracky/dataconnect';

// The `ListOrdersAll` query requires an argument of type `ListOrdersAllVariables`:
const listOrdersAllVars: ListOrdersAllVariables = {
  companyId: ..., 
  limit: ..., 
  offset: ..., 
};

// Call the `listOrdersAllRef()` function to get a reference to the query.
const ref = listOrdersAllRef(listOrdersAllVars);
// Variables can be defined inline as well.
const ref = listOrdersAllRef({ companyId: ..., limit: ..., offset: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOrdersAllRef(dataConnect, listOrdersAllVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## GetOrder
You can execute the `GetOrder` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getOrder(vars: GetOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrderData, GetOrderVariables>;

interface GetOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrderVariables): QueryRef<GetOrderData, GetOrderVariables>;
}
export const getOrderRef: GetOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getOrder(dc: DataConnect, vars: GetOrderVariables, options?: ExecuteQueryOptions): QueryPromise<GetOrderData, GetOrderVariables>;

interface GetOrderRef {
  ...
  (dc: DataConnect, vars: GetOrderVariables): QueryRef<GetOrderData, GetOrderVariables>;
}
export const getOrderRef: GetOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getOrderRef:
```typescript
const name = getOrderRef.operationName;
console.log(name);
```

### Variables
The `GetOrder` query requires an argument of type `GetOrderVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetOrderVariables {
  id: UUIDString;
  companyId: UUIDString;
}
```
### Return Type
Recall that executing the `GetOrder` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetOrderData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getOrder, GetOrderVariables } from '@tracky/dataconnect';

// The `GetOrder` query requires an argument of type `GetOrderVariables`:
const getOrderVars: GetOrderVariables = {
  id: ..., 
  companyId: ..., 
};

// Call the `getOrder()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getOrder(getOrderVars);
// Variables can be defined inline as well.
const { data } = await getOrder({ id: ..., companyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getOrder(dataConnect, getOrderVars);

console.log(data.order);

// Or, you can use the `Promise` API.
getOrder(getOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order);
});
```

### Using `GetOrder`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getOrderRef, GetOrderVariables } from '@tracky/dataconnect';

// The `GetOrder` query requires an argument of type `GetOrderVariables`:
const getOrderVars: GetOrderVariables = {
  id: ..., 
  companyId: ..., 
};

// Call the `getOrderRef()` function to get a reference to the query.
const ref = getOrderRef(getOrderVars);
// Variables can be defined inline as well.
const ref = getOrderRef({ id: ..., companyId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getOrderRef(dataConnect, getOrderVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.order);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.order);
});
```

## TrackOrder
You can execute the `TrackOrder` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
trackOrder(vars: TrackOrderVariables, options?: ExecuteQueryOptions): QueryPromise<TrackOrderData, TrackOrderVariables>;

interface TrackOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: TrackOrderVariables): QueryRef<TrackOrderData, TrackOrderVariables>;
}
export const trackOrderRef: TrackOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
trackOrder(dc: DataConnect, vars: TrackOrderVariables, options?: ExecuteQueryOptions): QueryPromise<TrackOrderData, TrackOrderVariables>;

interface TrackOrderRef {
  ...
  (dc: DataConnect, vars: TrackOrderVariables): QueryRef<TrackOrderData, TrackOrderVariables>;
}
export const trackOrderRef: TrackOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the trackOrderRef:
```typescript
const name = trackOrderRef.operationName;
console.log(name);
```

### Variables
The `TrackOrder` query requires an argument of type `TrackOrderVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface TrackOrderVariables {
  orderNumber: string;
}
```
### Return Type
Recall that executing the `TrackOrder` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `TrackOrderData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `TrackOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, trackOrder, TrackOrderVariables } from '@tracky/dataconnect';

// The `TrackOrder` query requires an argument of type `TrackOrderVariables`:
const trackOrderVars: TrackOrderVariables = {
  orderNumber: ..., 
};

// Call the `trackOrder()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await trackOrder(trackOrderVars);
// Variables can be defined inline as well.
const { data } = await trackOrder({ orderNumber: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await trackOrder(dataConnect, trackOrderVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
trackOrder(trackOrderVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `TrackOrder`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, trackOrderRef, TrackOrderVariables } from '@tracky/dataconnect';

// The `TrackOrder` query requires an argument of type `TrackOrderVariables`:
const trackOrderVars: TrackOrderVariables = {
  orderNumber: ..., 
};

// Call the `trackOrderRef()` function to get a reference to the query.
const ref = trackOrderRef(trackOrderVars);
// Variables can be defined inline as well.
const ref = trackOrderRef({ orderNumber: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = trackOrderRef(dataConnect, trackOrderVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## ListDrivers
You can execute the `ListDrivers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
listDrivers(vars: ListDriversVariables, options?: ExecuteQueryOptions): QueryPromise<ListDriversData, ListDriversVariables>;

interface ListDriversRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDriversVariables): QueryRef<ListDriversData, ListDriversVariables>;
}
export const listDriversRef: ListDriversRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDrivers(dc: DataConnect, vars: ListDriversVariables, options?: ExecuteQueryOptions): QueryPromise<ListDriversData, ListDriversVariables>;

interface ListDriversRef {
  ...
  (dc: DataConnect, vars: ListDriversVariables): QueryRef<ListDriversData, ListDriversVariables>;
}
export const listDriversRef: ListDriversRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDriversRef:
```typescript
const name = listDriversRef.operationName;
console.log(name);
```

### Variables
The `ListDrivers` query requires an argument of type `ListDriversVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListDriversVariables {
  companyId: UUIDString;
}
```
### Return Type
Recall that executing the `ListDrivers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDriversData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListDrivers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDrivers, ListDriversVariables } from '@tracky/dataconnect';

// The `ListDrivers` query requires an argument of type `ListDriversVariables`:
const listDriversVars: ListDriversVariables = {
  companyId: ..., 
};

// Call the `listDrivers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDrivers(listDriversVars);
// Variables can be defined inline as well.
const { data } = await listDrivers({ companyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDrivers(dataConnect, listDriversVars);

console.log(data.drivers);

// Or, you can use the `Promise` API.
listDrivers(listDriversVars).then((response) => {
  const data = response.data;
  console.log(data.drivers);
});
```

### Using `ListDrivers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDriversRef, ListDriversVariables } from '@tracky/dataconnect';

// The `ListDrivers` query requires an argument of type `ListDriversVariables`:
const listDriversVars: ListDriversVariables = {
  companyId: ..., 
};

// Call the `listDriversRef()` function to get a reference to the query.
const ref = listDriversRef(listDriversVars);
// Variables can be defined inline as well.
const ref = listDriversRef({ companyId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDriversRef(dataConnect, listDriversVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.drivers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.drivers);
});
```

## ListDriversByStatus
You can execute the `ListDriversByStatus` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
listDriversByStatus(vars: ListDriversByStatusVariables, options?: ExecuteQueryOptions): QueryPromise<ListDriversByStatusData, ListDriversByStatusVariables>;

interface ListDriversByStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDriversByStatusVariables): QueryRef<ListDriversByStatusData, ListDriversByStatusVariables>;
}
export const listDriversByStatusRef: ListDriversByStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDriversByStatus(dc: DataConnect, vars: ListDriversByStatusVariables, options?: ExecuteQueryOptions): QueryPromise<ListDriversByStatusData, ListDriversByStatusVariables>;

interface ListDriversByStatusRef {
  ...
  (dc: DataConnect, vars: ListDriversByStatusVariables): QueryRef<ListDriversByStatusData, ListDriversByStatusVariables>;
}
export const listDriversByStatusRef: ListDriversByStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDriversByStatusRef:
```typescript
const name = listDriversByStatusRef.operationName;
console.log(name);
```

### Variables
The `ListDriversByStatus` query requires an argument of type `ListDriversByStatusVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListDriversByStatusVariables {
  companyId: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `ListDriversByStatus` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDriversByStatusData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListDriversByStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDriversByStatus, ListDriversByStatusVariables } from '@tracky/dataconnect';

// The `ListDriversByStatus` query requires an argument of type `ListDriversByStatusVariables`:
const listDriversByStatusVars: ListDriversByStatusVariables = {
  companyId: ..., 
  status: ..., 
};

// Call the `listDriversByStatus()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDriversByStatus(listDriversByStatusVars);
// Variables can be defined inline as well.
const { data } = await listDriversByStatus({ companyId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDriversByStatus(dataConnect, listDriversByStatusVars);

console.log(data.drivers);

// Or, you can use the `Promise` API.
listDriversByStatus(listDriversByStatusVars).then((response) => {
  const data = response.data;
  console.log(data.drivers);
});
```

### Using `ListDriversByStatus`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDriversByStatusRef, ListDriversByStatusVariables } from '@tracky/dataconnect';

// The `ListDriversByStatus` query requires an argument of type `ListDriversByStatusVariables`:
const listDriversByStatusVars: ListDriversByStatusVariables = {
  companyId: ..., 
  status: ..., 
};

// Call the `listDriversByStatusRef()` function to get a reference to the query.
const ref = listDriversByStatusRef(listDriversByStatusVars);
// Variables can be defined inline as well.
const ref = listDriversByStatusRef({ companyId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDriversByStatusRef(dataConnect, listDriversByStatusVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.drivers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.drivers);
});
```

## GetDriver
You can execute the `GetDriver` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getDriver(vars: GetDriverVariables, options?: ExecuteQueryOptions): QueryPromise<GetDriverData, GetDriverVariables>;

interface GetDriverRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDriverVariables): QueryRef<GetDriverData, GetDriverVariables>;
}
export const getDriverRef: GetDriverRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDriver(dc: DataConnect, vars: GetDriverVariables, options?: ExecuteQueryOptions): QueryPromise<GetDriverData, GetDriverVariables>;

interface GetDriverRef {
  ...
  (dc: DataConnect, vars: GetDriverVariables): QueryRef<GetDriverData, GetDriverVariables>;
}
export const getDriverRef: GetDriverRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDriverRef:
```typescript
const name = getDriverRef.operationName;
console.log(name);
```

### Variables
The `GetDriver` query requires an argument of type `GetDriverVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetDriverVariables {
  id: UUIDString;
  companyId: UUIDString;
}
```
### Return Type
Recall that executing the `GetDriver` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDriverData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetDriver`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDriver, GetDriverVariables } from '@tracky/dataconnect';

// The `GetDriver` query requires an argument of type `GetDriverVariables`:
const getDriverVars: GetDriverVariables = {
  id: ..., 
  companyId: ..., 
};

// Call the `getDriver()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDriver(getDriverVars);
// Variables can be defined inline as well.
const { data } = await getDriver({ id: ..., companyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDriver(dataConnect, getDriverVars);

console.log(data.driver);

// Or, you can use the `Promise` API.
getDriver(getDriverVars).then((response) => {
  const data = response.data;
  console.log(data.driver);
});
```

### Using `GetDriver`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDriverRef, GetDriverVariables } from '@tracky/dataconnect';

// The `GetDriver` query requires an argument of type `GetDriverVariables`:
const getDriverVars: GetDriverVariables = {
  id: ..., 
  companyId: ..., 
};

// Call the `getDriverRef()` function to get a reference to the query.
const ref = getDriverRef(getDriverVars);
// Variables can be defined inline as well.
const ref = getDriverRef({ id: ..., companyId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDriverRef(dataConnect, getDriverVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.driver);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.driver);
});
```

## GetMyDriverOrders
You can execute the `GetMyDriverOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getMyDriverOrders(vars: GetMyDriverOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyDriverOrdersData, GetMyDriverOrdersVariables>;

interface GetMyDriverOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMyDriverOrdersVariables): QueryRef<GetMyDriverOrdersData, GetMyDriverOrdersVariables>;
}
export const getMyDriverOrdersRef: GetMyDriverOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyDriverOrders(dc: DataConnect, vars: GetMyDriverOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<GetMyDriverOrdersData, GetMyDriverOrdersVariables>;

interface GetMyDriverOrdersRef {
  ...
  (dc: DataConnect, vars: GetMyDriverOrdersVariables): QueryRef<GetMyDriverOrdersData, GetMyDriverOrdersVariables>;
}
export const getMyDriverOrdersRef: GetMyDriverOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyDriverOrdersRef:
```typescript
const name = getMyDriverOrdersRef.operationName;
console.log(name);
```

### Variables
The `GetMyDriverOrders` query requires an argument of type `GetMyDriverOrdersVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMyDriverOrdersVariables {
  uid: string;
}
```
### Return Type
Recall that executing the `GetMyDriverOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyDriverOrdersData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyDriverOrdersData {
  users: ({
    id: UUIDString;
    name: string;
    role: string;
  } & User_Key)[];
}
```
### Using `GetMyDriverOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyDriverOrders, GetMyDriverOrdersVariables } from '@tracky/dataconnect';

// The `GetMyDriverOrders` query requires an argument of type `GetMyDriverOrdersVariables`:
const getMyDriverOrdersVars: GetMyDriverOrdersVariables = {
  uid: ..., 
};

// Call the `getMyDriverOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyDriverOrders(getMyDriverOrdersVars);
// Variables can be defined inline as well.
const { data } = await getMyDriverOrders({ uid: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyDriverOrders(dataConnect, getMyDriverOrdersVars);

console.log(data.users);

// Or, you can use the `Promise` API.
getMyDriverOrders(getMyDriverOrdersVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `GetMyDriverOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyDriverOrdersRef, GetMyDriverOrdersVariables } from '@tracky/dataconnect';

// The `GetMyDriverOrders` query requires an argument of type `GetMyDriverOrdersVariables`:
const getMyDriverOrdersVars: GetMyDriverOrdersVariables = {
  uid: ..., 
};

// Call the `getMyDriverOrdersRef()` function to get a reference to the query.
const ref = getMyDriverOrdersRef(getMyDriverOrdersVars);
// Variables can be defined inline as well.
const ref = getMyDriverOrdersRef({ uid: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyDriverOrdersRef(dataConnect, getMyDriverOrdersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetStatsSummary
You can execute the `GetStatsSummary` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getStatsSummary(vars: GetStatsSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<GetStatsSummaryData, GetStatsSummaryVariables>;

interface GetStatsSummaryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetStatsSummaryVariables): QueryRef<GetStatsSummaryData, GetStatsSummaryVariables>;
}
export const getStatsSummaryRef: GetStatsSummaryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getStatsSummary(dc: DataConnect, vars: GetStatsSummaryVariables, options?: ExecuteQueryOptions): QueryPromise<GetStatsSummaryData, GetStatsSummaryVariables>;

interface GetStatsSummaryRef {
  ...
  (dc: DataConnect, vars: GetStatsSummaryVariables): QueryRef<GetStatsSummaryData, GetStatsSummaryVariables>;
}
export const getStatsSummaryRef: GetStatsSummaryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getStatsSummaryRef:
```typescript
const name = getStatsSummaryRef.operationName;
console.log(name);
```

### Variables
The `GetStatsSummary` query requires an argument of type `GetStatsSummaryVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetStatsSummaryVariables {
  companyId: UUIDString;
}
```
### Return Type
Recall that executing the `GetStatsSummary` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetStatsSummaryData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetStatsSummary`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getStatsSummary, GetStatsSummaryVariables } from '@tracky/dataconnect';

// The `GetStatsSummary` query requires an argument of type `GetStatsSummaryVariables`:
const getStatsSummaryVars: GetStatsSummaryVariables = {
  companyId: ..., 
};

// Call the `getStatsSummary()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getStatsSummary(getStatsSummaryVars);
// Variables can be defined inline as well.
const { data } = await getStatsSummary({ companyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getStatsSummary(dataConnect, getStatsSummaryVars);

console.log(data.orders);
console.log(data.drivers);

// Or, you can use the `Promise` API.
getStatsSummary(getStatsSummaryVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
  console.log(data.drivers);
});
```

### Using `GetStatsSummary`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getStatsSummaryRef, GetStatsSummaryVariables } from '@tracky/dataconnect';

// The `GetStatsSummary` query requires an argument of type `GetStatsSummaryVariables`:
const getStatsSummaryVars: GetStatsSummaryVariables = {
  companyId: ..., 
};

// Call the `getStatsSummaryRef()` function to get a reference to the query.
const ref = getStatsSummaryRef(getStatsSummaryVars);
// Variables can be defined inline as well.
const ref = getStatsSummaryRef({ companyId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getStatsSummaryRef(dataConnect, getStatsSummaryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);
console.log(data.drivers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
  console.log(data.drivers);
});
```

## GetDriverLocationHistory
You can execute the `GetDriverLocationHistory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getDriverLocationHistory(vars: GetDriverLocationHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetDriverLocationHistoryData, GetDriverLocationHistoryVariables>;

interface GetDriverLocationHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDriverLocationHistoryVariables): QueryRef<GetDriverLocationHistoryData, GetDriverLocationHistoryVariables>;
}
export const getDriverLocationHistoryRef: GetDriverLocationHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDriverLocationHistory(dc: DataConnect, vars: GetDriverLocationHistoryVariables, options?: ExecuteQueryOptions): QueryPromise<GetDriverLocationHistoryData, GetDriverLocationHistoryVariables>;

interface GetDriverLocationHistoryRef {
  ...
  (dc: DataConnect, vars: GetDriverLocationHistoryVariables): QueryRef<GetDriverLocationHistoryData, GetDriverLocationHistoryVariables>;
}
export const getDriverLocationHistoryRef: GetDriverLocationHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDriverLocationHistoryRef:
```typescript
const name = getDriverLocationHistoryRef.operationName;
console.log(name);
```

### Variables
The `GetDriverLocationHistory` query requires an argument of type `GetDriverLocationHistoryVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetDriverLocationHistoryVariables {
  driverId: UUIDString;
  date: string;
}
```
### Return Type
Recall that executing the `GetDriverLocationHistory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDriverLocationHistoryData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetDriverLocationHistoryData {
  locationHistories: ({
    id: UUIDString;
    date: string;
    path: string;
    createdAt?: TimestampString | null;
  } & LocationHistory_Key)[];
}
```
### Using `GetDriverLocationHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDriverLocationHistory, GetDriverLocationHistoryVariables } from '@tracky/dataconnect';

// The `GetDriverLocationHistory` query requires an argument of type `GetDriverLocationHistoryVariables`:
const getDriverLocationHistoryVars: GetDriverLocationHistoryVariables = {
  driverId: ..., 
  date: ..., 
};

// Call the `getDriverLocationHistory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDriverLocationHistory(getDriverLocationHistoryVars);
// Variables can be defined inline as well.
const { data } = await getDriverLocationHistory({ driverId: ..., date: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDriverLocationHistory(dataConnect, getDriverLocationHistoryVars);

console.log(data.locationHistories);

// Or, you can use the `Promise` API.
getDriverLocationHistory(getDriverLocationHistoryVars).then((response) => {
  const data = response.data;
  console.log(data.locationHistories);
});
```

### Using `GetDriverLocationHistory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDriverLocationHistoryRef, GetDriverLocationHistoryVariables } from '@tracky/dataconnect';

// The `GetDriverLocationHistory` query requires an argument of type `GetDriverLocationHistoryVariables`:
const getDriverLocationHistoryVars: GetDriverLocationHistoryVariables = {
  driverId: ..., 
  date: ..., 
};

// Call the `getDriverLocationHistoryRef()` function to get a reference to the query.
const ref = getDriverLocationHistoryRef(getDriverLocationHistoryVars);
// Variables can be defined inline as well.
const ref = getDriverLocationHistoryRef({ driverId: ..., date: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDriverLocationHistoryRef(dataConnect, getDriverLocationHistoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.locationHistories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.locationHistories);
});
```

## GetBillingPlan
You can execute the `GetBillingPlan` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
getBillingPlan(vars: GetBillingPlanVariables, options?: ExecuteQueryOptions): QueryPromise<GetBillingPlanData, GetBillingPlanVariables>;

interface GetBillingPlanRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBillingPlanVariables): QueryRef<GetBillingPlanData, GetBillingPlanVariables>;
}
export const getBillingPlanRef: GetBillingPlanRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBillingPlan(dc: DataConnect, vars: GetBillingPlanVariables, options?: ExecuteQueryOptions): QueryPromise<GetBillingPlanData, GetBillingPlanVariables>;

interface GetBillingPlanRef {
  ...
  (dc: DataConnect, vars: GetBillingPlanVariables): QueryRef<GetBillingPlanData, GetBillingPlanVariables>;
}
export const getBillingPlanRef: GetBillingPlanRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBillingPlanRef:
```typescript
const name = getBillingPlanRef.operationName;
console.log(name);
```

### Variables
The `GetBillingPlan` query requires an argument of type `GetBillingPlanVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBillingPlanVariables {
  companyId: UUIDString;
}
```
### Return Type
Recall that executing the `GetBillingPlan` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBillingPlanData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetBillingPlanData {
  company?: {
    subscriptionPlan?: string | null;
    subscriptionStatus?: string | null;
    subscriptionStartDate?: DateString | null;
    subscriptionEndDate?: DateString | null;
    mpSubscriptionId?: string | null;
  };
}
```
### Using `GetBillingPlan`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBillingPlan, GetBillingPlanVariables } from '@tracky/dataconnect';

// The `GetBillingPlan` query requires an argument of type `GetBillingPlanVariables`:
const getBillingPlanVars: GetBillingPlanVariables = {
  companyId: ..., 
};

// Call the `getBillingPlan()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBillingPlan(getBillingPlanVars);
// Variables can be defined inline as well.
const { data } = await getBillingPlan({ companyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBillingPlan(dataConnect, getBillingPlanVars);

console.log(data.company);

// Or, you can use the `Promise` API.
getBillingPlan(getBillingPlanVars).then((response) => {
  const data = response.data;
  console.log(data.company);
});
```

### Using `GetBillingPlan`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBillingPlanRef, GetBillingPlanVariables } from '@tracky/dataconnect';

// The `GetBillingPlan` query requires an argument of type `GetBillingPlanVariables`:
const getBillingPlanVars: GetBillingPlanVariables = {
  companyId: ..., 
};

// Call the `getBillingPlanRef()` function to get a reference to the query.
const ref = getBillingPlanRef(getBillingPlanVars);
// Variables can be defined inline as well.
const ref = getBillingPlanRef({ companyId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBillingPlanRef(dataConnect, getBillingPlanVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.company);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.company);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
listUsers(vars: ListUsersVariables, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, ListUsersVariables>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListUsersVariables): QueryRef<ListUsersData, ListUsersVariables>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, vars: ListUsersVariables, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, ListUsersVariables>;

interface ListUsersRef {
  ...
  (dc: DataConnect, vars: ListUsersVariables): QueryRef<ListUsersData, ListUsersVariables>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query requires an argument of type `ListUsersVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListUsersVariables {
  companyId: UUIDString;
}
```
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers, ListUsersVariables } from '@tracky/dataconnect';

// The `ListUsers` query requires an argument of type `ListUsersVariables`:
const listUsersVars: ListUsersVariables = {
  companyId: ..., 
};

// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers(listUsersVars);
// Variables can be defined inline as well.
const { data } = await listUsers({ companyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect, listUsersVars);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers(listUsersVars).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef, ListUsersVariables } from '@tracky/dataconnect';

// The `ListUsers` query requires an argument of type `ListUsersVariables`:
const listUsersVars: ListUsersVariables = {
  companyId: ..., 
};

// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef(listUsersVars);
// Variables can be defined inline as well.
const ref = listUsersRef({ companyId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect, listUsersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListCompanies
You can execute the `ListCompanies` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
listCompanies(options?: ExecuteQueryOptions): QueryPromise<ListCompaniesData, undefined>;

interface ListCompaniesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCompaniesData, undefined>;
}
export const listCompaniesRef: ListCompaniesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCompanies(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCompaniesData, undefined>;

interface ListCompaniesRef {
  ...
  (dc: DataConnect): QueryRef<ListCompaniesData, undefined>;
}
export const listCompaniesRef: ListCompaniesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCompaniesRef:
```typescript
const name = listCompaniesRef.operationName;
console.log(name);
```

### Variables
The `ListCompanies` query has no variables.
### Return Type
Recall that executing the `ListCompanies` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCompaniesData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListCompanies`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCompanies } from '@tracky/dataconnect';


// Call the `listCompanies()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCompanies();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCompanies(dataConnect);

console.log(data.companies);

// Or, you can use the `Promise` API.
listCompanies().then((response) => {
  const data = response.data;
  console.log(data.companies);
});
```

### Using `ListCompanies`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCompaniesRef } from '@tracky/dataconnect';


// Call the `listCompaniesRef()` function to get a reference to the query.
const ref = listCompaniesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCompaniesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.companies);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.companies);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `tracky-connector` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## RegisterCompany
You can execute the `RegisterCompany` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
registerCompany(vars: RegisterCompanyVariables): MutationPromise<RegisterCompanyData, RegisterCompanyVariables>;

interface RegisterCompanyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RegisterCompanyVariables): MutationRef<RegisterCompanyData, RegisterCompanyVariables>;
}
export const registerCompanyRef: RegisterCompanyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
registerCompany(dc: DataConnect, vars: RegisterCompanyVariables): MutationPromise<RegisterCompanyData, RegisterCompanyVariables>;

interface RegisterCompanyRef {
  ...
  (dc: DataConnect, vars: RegisterCompanyVariables): MutationRef<RegisterCompanyData, RegisterCompanyVariables>;
}
export const registerCompanyRef: RegisterCompanyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the registerCompanyRef:
```typescript
const name = registerCompanyRef.operationName;
console.log(name);
```

### Variables
The `RegisterCompany` mutation requires an argument of type `RegisterCompanyVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RegisterCompanyVariables {
  uid: string;
  name: string;
  email: string;
  companyName: string;
  slug: string;
}
```
### Return Type
Recall that executing the `RegisterCompany` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RegisterCompanyData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RegisterCompanyData {
  company_insert: Company_Key;
}
```
### Using `RegisterCompany`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, registerCompany, RegisterCompanyVariables } from '@tracky/dataconnect';

// The `RegisterCompany` mutation requires an argument of type `RegisterCompanyVariables`:
const registerCompanyVars: RegisterCompanyVariables = {
  uid: ..., 
  name: ..., 
  email: ..., 
  companyName: ..., 
  slug: ..., 
};

// Call the `registerCompany()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await registerCompany(registerCompanyVars);
// Variables can be defined inline as well.
const { data } = await registerCompany({ uid: ..., name: ..., email: ..., companyName: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await registerCompany(dataConnect, registerCompanyVars);

console.log(data.company_insert);

// Or, you can use the `Promise` API.
registerCompany(registerCompanyVars).then((response) => {
  const data = response.data;
  console.log(data.company_insert);
});
```

### Using `RegisterCompany`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, registerCompanyRef, RegisterCompanyVariables } from '@tracky/dataconnect';

// The `RegisterCompany` mutation requires an argument of type `RegisterCompanyVariables`:
const registerCompanyVars: RegisterCompanyVariables = {
  uid: ..., 
  name: ..., 
  email: ..., 
  companyName: ..., 
  slug: ..., 
};

// Call the `registerCompanyRef()` function to get a reference to the mutation.
const ref = registerCompanyRef(registerCompanyVars);
// Variables can be defined inline as well.
const ref = registerCompanyRef({ uid: ..., name: ..., email: ..., companyName: ..., slug: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = registerCompanyRef(dataConnect, registerCompanyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.company_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.company_insert);
});
```

## CreateUserProfile
You can execute the `CreateUserProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
createUserProfile(vars: CreateUserProfileVariables): MutationPromise<CreateUserProfileData, CreateUserProfileVariables>;

interface CreateUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserProfileVariables): MutationRef<CreateUserProfileData, CreateUserProfileVariables>;
}
export const createUserProfileRef: CreateUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUserProfile(dc: DataConnect, vars: CreateUserProfileVariables): MutationPromise<CreateUserProfileData, CreateUserProfileVariables>;

interface CreateUserProfileRef {
  ...
  (dc: DataConnect, vars: CreateUserProfileVariables): MutationRef<CreateUserProfileData, CreateUserProfileVariables>;
}
export const createUserProfileRef: CreateUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserProfileRef:
```typescript
const name = createUserProfileRef.operationName;
console.log(name);
```

### Variables
The `CreateUserProfile` mutation requires an argument of type `CreateUserProfileVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserProfileVariables {
  uid: string;
  name: string;
  email: string;
  role: string;
  companyId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `CreateUserProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserProfileData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserProfileData {
  user_insert: User_Key;
}
```
### Using `CreateUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUserProfile, CreateUserProfileVariables } from '@tracky/dataconnect';

// The `CreateUserProfile` mutation requires an argument of type `CreateUserProfileVariables`:
const createUserProfileVars: CreateUserProfileVariables = {
  uid: ..., 
  name: ..., 
  email: ..., 
  role: ..., 
  companyId: ..., // optional
};

// Call the `createUserProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUserProfile(createUserProfileVars);
// Variables can be defined inline as well.
const { data } = await createUserProfile({ uid: ..., name: ..., email: ..., role: ..., companyId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUserProfile(dataConnect, createUserProfileVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUserProfile(createUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUserProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserProfileRef, CreateUserProfileVariables } from '@tracky/dataconnect';

// The `CreateUserProfile` mutation requires an argument of type `CreateUserProfileVariables`:
const createUserProfileVars: CreateUserProfileVariables = {
  uid: ..., 
  name: ..., 
  email: ..., 
  role: ..., 
  companyId: ..., // optional
};

// Call the `createUserProfileRef()` function to get a reference to the mutation.
const ref = createUserProfileRef(createUserProfileVars);
// Variables can be defined inline as well.
const ref = createUserProfileRef({ uid: ..., name: ..., email: ..., role: ..., companyId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserProfileRef(dataConnect, createUserProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## CreateOrder
You can execute the `CreateOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
createOrder(vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface CreateOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
}
export const createOrderRef: CreateOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createOrder(dc: DataConnect, vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface CreateOrderRef {
  ...
  (dc: DataConnect, vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
}
export const createOrderRef: CreateOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createOrderRef:
```typescript
const name = createOrderRef.operationName;
console.log(name);
```

### Variables
The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateOrderData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateOrderData {
  order_insert: Order_Key;
}
```
### Using `CreateOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createOrder, CreateOrderVariables } from '@tracky/dataconnect';

// The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`:
const createOrderVars: CreateOrderVariables = {
  companyId: ..., 
  orderNumber: ..., 
  customerName: ..., 
  customerAddress: ..., 
  customerPhone: ..., // optional
  customerLat: ..., // optional
  customerLng: ..., // optional
  priority: ..., // optional
  items: ..., // optional
  notes: ..., // optional
  estimatedDelivery: ..., // optional
};

// Call the `createOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createOrder(createOrderVars);
// Variables can be defined inline as well.
const { data } = await createOrder({ companyId: ..., orderNumber: ..., customerName: ..., customerAddress: ..., customerPhone: ..., customerLat: ..., customerLng: ..., priority: ..., items: ..., notes: ..., estimatedDelivery: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createOrder(dataConnect, createOrderVars);

console.log(data.order_insert);

// Or, you can use the `Promise` API.
createOrder(createOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_insert);
});
```

### Using `CreateOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createOrderRef, CreateOrderVariables } from '@tracky/dataconnect';

// The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`:
const createOrderVars: CreateOrderVariables = {
  companyId: ..., 
  orderNumber: ..., 
  customerName: ..., 
  customerAddress: ..., 
  customerPhone: ..., // optional
  customerLat: ..., // optional
  customerLng: ..., // optional
  priority: ..., // optional
  items: ..., // optional
  notes: ..., // optional
  estimatedDelivery: ..., // optional
};

// Call the `createOrderRef()` function to get a reference to the mutation.
const ref = createOrderRef(createOrderVars);
// Variables can be defined inline as well.
const ref = createOrderRef({ companyId: ..., orderNumber: ..., customerName: ..., customerAddress: ..., customerPhone: ..., customerLat: ..., customerLng: ..., priority: ..., items: ..., notes: ..., estimatedDelivery: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createOrderRef(dataConnect, createOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_insert);
});
```

## UpdateOrder
You can execute the `UpdateOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateOrder(vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;

interface UpdateOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
}
export const updateOrderRef: UpdateOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateOrder(dc: DataConnect, vars: UpdateOrderVariables): MutationPromise<UpdateOrderData, UpdateOrderVariables>;

interface UpdateOrderRef {
  ...
  (dc: DataConnect, vars: UpdateOrderVariables): MutationRef<UpdateOrderData, UpdateOrderVariables>;
}
export const updateOrderRef: UpdateOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateOrderRef:
```typescript
const name = updateOrderRef.operationName;
console.log(name);
```

### Variables
The `UpdateOrder` mutation requires an argument of type `UpdateOrderVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateOrderData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateOrderData {
  order_update?: Order_Key | null;
}
```
### Using `UpdateOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateOrder, UpdateOrderVariables } from '@tracky/dataconnect';

// The `UpdateOrder` mutation requires an argument of type `UpdateOrderVariables`:
const updateOrderVars: UpdateOrderVariables = {
  id: ..., 
  status: ..., // optional
  priority: ..., // optional
  driverId: ..., // optional
  customerName: ..., // optional
  customerAddress: ..., // optional
  customerPhone: ..., // optional
  customerLat: ..., // optional
  customerLng: ..., // optional
  items: ..., // optional
  notes: ..., // optional
  estimatedDelivery: ..., // optional
  assignedAt: ..., // optional
  transitStartedAt: ..., // optional
  deliveredAt: ..., // optional
};

// Call the `updateOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateOrder(updateOrderVars);
// Variables can be defined inline as well.
const { data } = await updateOrder({ id: ..., status: ..., priority: ..., driverId: ..., customerName: ..., customerAddress: ..., customerPhone: ..., customerLat: ..., customerLng: ..., items: ..., notes: ..., estimatedDelivery: ..., assignedAt: ..., transitStartedAt: ..., deliveredAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateOrder(dataConnect, updateOrderVars);

console.log(data.order_update);

// Or, you can use the `Promise` API.
updateOrder(updateOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_update);
});
```

### Using `UpdateOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateOrderRef, UpdateOrderVariables } from '@tracky/dataconnect';

// The `UpdateOrder` mutation requires an argument of type `UpdateOrderVariables`:
const updateOrderVars: UpdateOrderVariables = {
  id: ..., 
  status: ..., // optional
  priority: ..., // optional
  driverId: ..., // optional
  customerName: ..., // optional
  customerAddress: ..., // optional
  customerPhone: ..., // optional
  customerLat: ..., // optional
  customerLng: ..., // optional
  items: ..., // optional
  notes: ..., // optional
  estimatedDelivery: ..., // optional
  assignedAt: ..., // optional
  transitStartedAt: ..., // optional
  deliveredAt: ..., // optional
};

// Call the `updateOrderRef()` function to get a reference to the mutation.
const ref = updateOrderRef(updateOrderVars);
// Variables can be defined inline as well.
const ref = updateOrderRef({ id: ..., status: ..., priority: ..., driverId: ..., customerName: ..., customerAddress: ..., customerPhone: ..., customerLat: ..., customerLng: ..., items: ..., notes: ..., estimatedDelivery: ..., assignedAt: ..., transitStartedAt: ..., deliveredAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateOrderRef(dataConnect, updateOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_update);
});
```

## UpdateOrderEvidence
You can execute the `UpdateOrderEvidence` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateOrderEvidence(vars: UpdateOrderEvidenceVariables): MutationPromise<UpdateOrderEvidenceData, UpdateOrderEvidenceVariables>;

interface UpdateOrderEvidenceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderEvidenceVariables): MutationRef<UpdateOrderEvidenceData, UpdateOrderEvidenceVariables>;
}
export const updateOrderEvidenceRef: UpdateOrderEvidenceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateOrderEvidence(dc: DataConnect, vars: UpdateOrderEvidenceVariables): MutationPromise<UpdateOrderEvidenceData, UpdateOrderEvidenceVariables>;

interface UpdateOrderEvidenceRef {
  ...
  (dc: DataConnect, vars: UpdateOrderEvidenceVariables): MutationRef<UpdateOrderEvidenceData, UpdateOrderEvidenceVariables>;
}
export const updateOrderEvidenceRef: UpdateOrderEvidenceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateOrderEvidenceRef:
```typescript
const name = updateOrderEvidenceRef.operationName;
console.log(name);
```

### Variables
The `UpdateOrderEvidence` mutation requires an argument of type `UpdateOrderEvidenceVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateOrderEvidence` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateOrderEvidenceData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateOrderEvidenceData {
  order_update?: Order_Key | null;
}
```
### Using `UpdateOrderEvidence`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateOrderEvidence, UpdateOrderEvidenceVariables } from '@tracky/dataconnect';

// The `UpdateOrderEvidence` mutation requires an argument of type `UpdateOrderEvidenceVariables`:
const updateOrderEvidenceVars: UpdateOrderEvidenceVariables = {
  id: ..., 
  status: ..., 
  deliveredAt: ..., 
  evidenceSignature: ..., // optional
  evidencePhoto: ..., // optional
  evidenceRecipientName: ..., // optional
  evidenceDeliveredLat: ..., // optional
  evidenceDeliveredLng: ..., // optional
};

// Call the `updateOrderEvidence()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateOrderEvidence(updateOrderEvidenceVars);
// Variables can be defined inline as well.
const { data } = await updateOrderEvidence({ id: ..., status: ..., deliveredAt: ..., evidenceSignature: ..., evidencePhoto: ..., evidenceRecipientName: ..., evidenceDeliveredLat: ..., evidenceDeliveredLng: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateOrderEvidence(dataConnect, updateOrderEvidenceVars);

console.log(data.order_update);

// Or, you can use the `Promise` API.
updateOrderEvidence(updateOrderEvidenceVars).then((response) => {
  const data = response.data;
  console.log(data.order_update);
});
```

### Using `UpdateOrderEvidence`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateOrderEvidenceRef, UpdateOrderEvidenceVariables } from '@tracky/dataconnect';

// The `UpdateOrderEvidence` mutation requires an argument of type `UpdateOrderEvidenceVariables`:
const updateOrderEvidenceVars: UpdateOrderEvidenceVariables = {
  id: ..., 
  status: ..., 
  deliveredAt: ..., 
  evidenceSignature: ..., // optional
  evidencePhoto: ..., // optional
  evidenceRecipientName: ..., // optional
  evidenceDeliveredLat: ..., // optional
  evidenceDeliveredLng: ..., // optional
};

// Call the `updateOrderEvidenceRef()` function to get a reference to the mutation.
const ref = updateOrderEvidenceRef(updateOrderEvidenceVars);
// Variables can be defined inline as well.
const ref = updateOrderEvidenceRef({ id: ..., status: ..., deliveredAt: ..., evidenceSignature: ..., evidencePhoto: ..., evidenceRecipientName: ..., evidenceDeliveredLat: ..., evidenceDeliveredLng: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateOrderEvidenceRef(dataConnect, updateOrderEvidenceVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_update);
});
```

## DeleteOrder
You can execute the `DeleteOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
deleteOrder(vars: DeleteOrderVariables): MutationPromise<DeleteOrderData, DeleteOrderVariables>;

interface DeleteOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteOrderVariables): MutationRef<DeleteOrderData, DeleteOrderVariables>;
}
export const deleteOrderRef: DeleteOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteOrder(dc: DataConnect, vars: DeleteOrderVariables): MutationPromise<DeleteOrderData, DeleteOrderVariables>;

interface DeleteOrderRef {
  ...
  (dc: DataConnect, vars: DeleteOrderVariables): MutationRef<DeleteOrderData, DeleteOrderVariables>;
}
export const deleteOrderRef: DeleteOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteOrderRef:
```typescript
const name = deleteOrderRef.operationName;
console.log(name);
```

### Variables
The `DeleteOrder` mutation requires an argument of type `DeleteOrderVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteOrderVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteOrderData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteOrderData {
  order_delete?: Order_Key | null;
}
```
### Using `DeleteOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteOrder, DeleteOrderVariables } from '@tracky/dataconnect';

// The `DeleteOrder` mutation requires an argument of type `DeleteOrderVariables`:
const deleteOrderVars: DeleteOrderVariables = {
  id: ..., 
};

// Call the `deleteOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteOrder(deleteOrderVars);
// Variables can be defined inline as well.
const { data } = await deleteOrder({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteOrder(dataConnect, deleteOrderVars);

console.log(data.order_delete);

// Or, you can use the `Promise` API.
deleteOrder(deleteOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_delete);
});
```

### Using `DeleteOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteOrderRef, DeleteOrderVariables } from '@tracky/dataconnect';

// The `DeleteOrder` mutation requires an argument of type `DeleteOrderVariables`:
const deleteOrderVars: DeleteOrderVariables = {
  id: ..., 
};

// Call the `deleteOrderRef()` function to get a reference to the mutation.
const ref = deleteOrderRef(deleteOrderVars);
// Variables can be defined inline as well.
const ref = deleteOrderRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteOrderRef(dataConnect, deleteOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_delete);
});
```

## CreateDriver
You can execute the `CreateDriver` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
createDriver(vars: CreateDriverVariables): MutationPromise<CreateDriverData, CreateDriverVariables>;

interface CreateDriverRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDriverVariables): MutationRef<CreateDriverData, CreateDriverVariables>;
}
export const createDriverRef: CreateDriverRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDriver(dc: DataConnect, vars: CreateDriverVariables): MutationPromise<CreateDriverData, CreateDriverVariables>;

interface CreateDriverRef {
  ...
  (dc: DataConnect, vars: CreateDriverVariables): MutationRef<CreateDriverData, CreateDriverVariables>;
}
export const createDriverRef: CreateDriverRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDriverRef:
```typescript
const name = createDriverRef.operationName;
console.log(name);
```

### Variables
The `CreateDriver` mutation requires an argument of type `CreateDriverVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateDriverVariables {
  companyId: UUIDString;
  name: string;
  email: string;
  vehicleType?: string | null;
  vehiclePlate?: string | null;
  userId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `CreateDriver` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDriverData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDriverData {
  driver_insert: Driver_Key;
}
```
### Using `CreateDriver`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDriver, CreateDriverVariables } from '@tracky/dataconnect';

// The `CreateDriver` mutation requires an argument of type `CreateDriverVariables`:
const createDriverVars: CreateDriverVariables = {
  companyId: ..., 
  name: ..., 
  email: ..., 
  vehicleType: ..., // optional
  vehiclePlate: ..., // optional
  userId: ..., // optional
};

// Call the `createDriver()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDriver(createDriverVars);
// Variables can be defined inline as well.
const { data } = await createDriver({ companyId: ..., name: ..., email: ..., vehicleType: ..., vehiclePlate: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDriver(dataConnect, createDriverVars);

console.log(data.driver_insert);

// Or, you can use the `Promise` API.
createDriver(createDriverVars).then((response) => {
  const data = response.data;
  console.log(data.driver_insert);
});
```

### Using `CreateDriver`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDriverRef, CreateDriverVariables } from '@tracky/dataconnect';

// The `CreateDriver` mutation requires an argument of type `CreateDriverVariables`:
const createDriverVars: CreateDriverVariables = {
  companyId: ..., 
  name: ..., 
  email: ..., 
  vehicleType: ..., // optional
  vehiclePlate: ..., // optional
  userId: ..., // optional
};

// Call the `createDriverRef()` function to get a reference to the mutation.
const ref = createDriverRef(createDriverVars);
// Variables can be defined inline as well.
const ref = createDriverRef({ companyId: ..., name: ..., email: ..., vehicleType: ..., vehiclePlate: ..., userId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDriverRef(dataConnect, createDriverVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.driver_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.driver_insert);
});
```

## UpdateDriver
You can execute the `UpdateDriver` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateDriver(vars: UpdateDriverVariables): MutationPromise<UpdateDriverData, UpdateDriverVariables>;

interface UpdateDriverRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDriverVariables): MutationRef<UpdateDriverData, UpdateDriverVariables>;
}
export const updateDriverRef: UpdateDriverRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateDriver(dc: DataConnect, vars: UpdateDriverVariables): MutationPromise<UpdateDriverData, UpdateDriverVariables>;

interface UpdateDriverRef {
  ...
  (dc: DataConnect, vars: UpdateDriverVariables): MutationRef<UpdateDriverData, UpdateDriverVariables>;
}
export const updateDriverRef: UpdateDriverRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateDriverRef:
```typescript
const name = updateDriverRef.operationName;
console.log(name);
```

### Variables
The `UpdateDriver` mutation requires an argument of type `UpdateDriverVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateDriver` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateDriverData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateDriverData {
  driver_update?: Driver_Key | null;
}
```
### Using `UpdateDriver`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateDriver, UpdateDriverVariables } from '@tracky/dataconnect';

// The `UpdateDriver` mutation requires an argument of type `UpdateDriverVariables`:
const updateDriverVars: UpdateDriverVariables = {
  id: ..., 
  name: ..., // optional
  email: ..., // optional
  vehicleType: ..., // optional
  vehiclePlate: ..., // optional
  status: ..., // optional
  rating: ..., // optional
  avatar: ..., // optional
};

// Call the `updateDriver()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateDriver(updateDriverVars);
// Variables can be defined inline as well.
const { data } = await updateDriver({ id: ..., name: ..., email: ..., vehicleType: ..., vehiclePlate: ..., status: ..., rating: ..., avatar: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateDriver(dataConnect, updateDriverVars);

console.log(data.driver_update);

// Or, you can use the `Promise` API.
updateDriver(updateDriverVars).then((response) => {
  const data = response.data;
  console.log(data.driver_update);
});
```

### Using `UpdateDriver`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateDriverRef, UpdateDriverVariables } from '@tracky/dataconnect';

// The `UpdateDriver` mutation requires an argument of type `UpdateDriverVariables`:
const updateDriverVars: UpdateDriverVariables = {
  id: ..., 
  name: ..., // optional
  email: ..., // optional
  vehicleType: ..., // optional
  vehiclePlate: ..., // optional
  status: ..., // optional
  rating: ..., // optional
  avatar: ..., // optional
};

// Call the `updateDriverRef()` function to get a reference to the mutation.
const ref = updateDriverRef(updateDriverVars);
// Variables can be defined inline as well.
const ref = updateDriverRef({ id: ..., name: ..., email: ..., vehicleType: ..., vehiclePlate: ..., status: ..., rating: ..., avatar: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateDriverRef(dataConnect, updateDriverVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.driver_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.driver_update);
});
```

## UpdateDriverLocation
You can execute the `UpdateDriverLocation` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateDriverLocation(vars: UpdateDriverLocationVariables): MutationPromise<UpdateDriverLocationData, UpdateDriverLocationVariables>;

interface UpdateDriverLocationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDriverLocationVariables): MutationRef<UpdateDriverLocationData, UpdateDriverLocationVariables>;
}
export const updateDriverLocationRef: UpdateDriverLocationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateDriverLocation(dc: DataConnect, vars: UpdateDriverLocationVariables): MutationPromise<UpdateDriverLocationData, UpdateDriverLocationVariables>;

interface UpdateDriverLocationRef {
  ...
  (dc: DataConnect, vars: UpdateDriverLocationVariables): MutationRef<UpdateDriverLocationData, UpdateDriverLocationVariables>;
}
export const updateDriverLocationRef: UpdateDriverLocationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateDriverLocationRef:
```typescript
const name = updateDriverLocationRef.operationName;
console.log(name);
```

### Variables
The `UpdateDriverLocation` mutation requires an argument of type `UpdateDriverLocationVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateDriverLocationVariables {
  id: UUIDString;
  locationLat: number;
  locationLng: number;
  status?: string | null;
}
```
### Return Type
Recall that executing the `UpdateDriverLocation` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateDriverLocationData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateDriverLocationData {
  driver_update?: Driver_Key | null;
}
```
### Using `UpdateDriverLocation`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateDriverLocation, UpdateDriverLocationVariables } from '@tracky/dataconnect';

// The `UpdateDriverLocation` mutation requires an argument of type `UpdateDriverLocationVariables`:
const updateDriverLocationVars: UpdateDriverLocationVariables = {
  id: ..., 
  locationLat: ..., 
  locationLng: ..., 
  status: ..., // optional
};

// Call the `updateDriverLocation()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateDriverLocation(updateDriverLocationVars);
// Variables can be defined inline as well.
const { data } = await updateDriverLocation({ id: ..., locationLat: ..., locationLng: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateDriverLocation(dataConnect, updateDriverLocationVars);

console.log(data.driver_update);

// Or, you can use the `Promise` API.
updateDriverLocation(updateDriverLocationVars).then((response) => {
  const data = response.data;
  console.log(data.driver_update);
});
```

### Using `UpdateDriverLocation`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateDriverLocationRef, UpdateDriverLocationVariables } from '@tracky/dataconnect';

// The `UpdateDriverLocation` mutation requires an argument of type `UpdateDriverLocationVariables`:
const updateDriverLocationVars: UpdateDriverLocationVariables = {
  id: ..., 
  locationLat: ..., 
  locationLng: ..., 
  status: ..., // optional
};

// Call the `updateDriverLocationRef()` function to get a reference to the mutation.
const ref = updateDriverLocationRef(updateDriverLocationVars);
// Variables can be defined inline as well.
const ref = updateDriverLocationRef({ id: ..., locationLat: ..., locationLng: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateDriverLocationRef(dataConnect, updateDriverLocationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.driver_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.driver_update);
});
```

## UpdateDriverStatus
You can execute the `UpdateDriverStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateDriverStatus(vars: UpdateDriverStatusVariables): MutationPromise<UpdateDriverStatusData, UpdateDriverStatusVariables>;

interface UpdateDriverStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDriverStatusVariables): MutationRef<UpdateDriverStatusData, UpdateDriverStatusVariables>;
}
export const updateDriverStatusRef: UpdateDriverStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateDriverStatus(dc: DataConnect, vars: UpdateDriverStatusVariables): MutationPromise<UpdateDriverStatusData, UpdateDriverStatusVariables>;

interface UpdateDriverStatusRef {
  ...
  (dc: DataConnect, vars: UpdateDriverStatusVariables): MutationRef<UpdateDriverStatusData, UpdateDriverStatusVariables>;
}
export const updateDriverStatusRef: UpdateDriverStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateDriverStatusRef:
```typescript
const name = updateDriverStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateDriverStatus` mutation requires an argument of type `UpdateDriverStatusVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateDriverStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateDriverStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateDriverStatusData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateDriverStatusData {
  driver_update?: Driver_Key | null;
}
```
### Using `UpdateDriverStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateDriverStatus, UpdateDriverStatusVariables } from '@tracky/dataconnect';

// The `UpdateDriverStatus` mutation requires an argument of type `UpdateDriverStatusVariables`:
const updateDriverStatusVars: UpdateDriverStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateDriverStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateDriverStatus(updateDriverStatusVars);
// Variables can be defined inline as well.
const { data } = await updateDriverStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateDriverStatus(dataConnect, updateDriverStatusVars);

console.log(data.driver_update);

// Or, you can use the `Promise` API.
updateDriverStatus(updateDriverStatusVars).then((response) => {
  const data = response.data;
  console.log(data.driver_update);
});
```

### Using `UpdateDriverStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateDriverStatusRef, UpdateDriverStatusVariables } from '@tracky/dataconnect';

// The `UpdateDriverStatus` mutation requires an argument of type `UpdateDriverStatusVariables`:
const updateDriverStatusVars: UpdateDriverStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateDriverStatusRef()` function to get a reference to the mutation.
const ref = updateDriverStatusRef(updateDriverStatusVars);
// Variables can be defined inline as well.
const ref = updateDriverStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateDriverStatusRef(dataConnect, updateDriverStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.driver_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.driver_update);
});
```

## DeleteDriver
You can execute the `DeleteDriver` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
deleteDriver(vars: DeleteDriverVariables): MutationPromise<DeleteDriverData, DeleteDriverVariables>;

interface DeleteDriverRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteDriverVariables): MutationRef<DeleteDriverData, DeleteDriverVariables>;
}
export const deleteDriverRef: DeleteDriverRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteDriver(dc: DataConnect, vars: DeleteDriverVariables): MutationPromise<DeleteDriverData, DeleteDriverVariables>;

interface DeleteDriverRef {
  ...
  (dc: DataConnect, vars: DeleteDriverVariables): MutationRef<DeleteDriverData, DeleteDriverVariables>;
}
export const deleteDriverRef: DeleteDriverRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteDriverRef:
```typescript
const name = deleteDriverRef.operationName;
console.log(name);
```

### Variables
The `DeleteDriver` mutation requires an argument of type `DeleteDriverVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteDriverVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteDriver` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteDriverData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteDriverData {
  driver_delete?: Driver_Key | null;
}
```
### Using `DeleteDriver`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteDriver, DeleteDriverVariables } from '@tracky/dataconnect';

// The `DeleteDriver` mutation requires an argument of type `DeleteDriverVariables`:
const deleteDriverVars: DeleteDriverVariables = {
  id: ..., 
};

// Call the `deleteDriver()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteDriver(deleteDriverVars);
// Variables can be defined inline as well.
const { data } = await deleteDriver({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteDriver(dataConnect, deleteDriverVars);

console.log(data.driver_delete);

// Or, you can use the `Promise` API.
deleteDriver(deleteDriverVars).then((response) => {
  const data = response.data;
  console.log(data.driver_delete);
});
```

### Using `DeleteDriver`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteDriverRef, DeleteDriverVariables } from '@tracky/dataconnect';

// The `DeleteDriver` mutation requires an argument of type `DeleteDriverVariables`:
const deleteDriverVars: DeleteDriverVariables = {
  id: ..., 
};

// Call the `deleteDriverRef()` function to get a reference to the mutation.
const ref = deleteDriverRef(deleteDriverVars);
// Variables can be defined inline as well.
const ref = deleteDriverRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteDriverRef(dataConnect, deleteDriverVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.driver_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.driver_delete);
});
```

## UpsertLocationHistory
You can execute the `UpsertLocationHistory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
upsertLocationHistory(vars: UpsertLocationHistoryVariables): MutationPromise<UpsertLocationHistoryData, UpsertLocationHistoryVariables>;

interface UpsertLocationHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertLocationHistoryVariables): MutationRef<UpsertLocationHistoryData, UpsertLocationHistoryVariables>;
}
export const upsertLocationHistoryRef: UpsertLocationHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertLocationHistory(dc: DataConnect, vars: UpsertLocationHistoryVariables): MutationPromise<UpsertLocationHistoryData, UpsertLocationHistoryVariables>;

interface UpsertLocationHistoryRef {
  ...
  (dc: DataConnect, vars: UpsertLocationHistoryVariables): MutationRef<UpsertLocationHistoryData, UpsertLocationHistoryVariables>;
}
export const upsertLocationHistoryRef: UpsertLocationHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertLocationHistoryRef:
```typescript
const name = upsertLocationHistoryRef.operationName;
console.log(name);
```

### Variables
The `UpsertLocationHistory` mutation requires an argument of type `UpsertLocationHistoryVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertLocationHistoryVariables {
  id: UUIDString;
  driverId: UUIDString;
  companyId: UUIDString;
  date: string;
  path: string;
}
```
### Return Type
Recall that executing the `UpsertLocationHistory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertLocationHistoryData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertLocationHistoryData {
  locationHistory_upsert: LocationHistory_Key;
}
```
### Using `UpsertLocationHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertLocationHistory, UpsertLocationHistoryVariables } from '@tracky/dataconnect';

// The `UpsertLocationHistory` mutation requires an argument of type `UpsertLocationHistoryVariables`:
const upsertLocationHistoryVars: UpsertLocationHistoryVariables = {
  id: ..., 
  driverId: ..., 
  companyId: ..., 
  date: ..., 
  path: ..., 
};

// Call the `upsertLocationHistory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertLocationHistory(upsertLocationHistoryVars);
// Variables can be defined inline as well.
const { data } = await upsertLocationHistory({ id: ..., driverId: ..., companyId: ..., date: ..., path: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertLocationHistory(dataConnect, upsertLocationHistoryVars);

console.log(data.locationHistory_upsert);

// Or, you can use the `Promise` API.
upsertLocationHistory(upsertLocationHistoryVars).then((response) => {
  const data = response.data;
  console.log(data.locationHistory_upsert);
});
```

### Using `UpsertLocationHistory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertLocationHistoryRef, UpsertLocationHistoryVariables } from '@tracky/dataconnect';

// The `UpsertLocationHistory` mutation requires an argument of type `UpsertLocationHistoryVariables`:
const upsertLocationHistoryVars: UpsertLocationHistoryVariables = {
  id: ..., 
  driverId: ..., 
  companyId: ..., 
  date: ..., 
  path: ..., 
};

// Call the `upsertLocationHistoryRef()` function to get a reference to the mutation.
const ref = upsertLocationHistoryRef(upsertLocationHistoryVars);
// Variables can be defined inline as well.
const ref = upsertLocationHistoryRef({ id: ..., driverId: ..., companyId: ..., date: ..., path: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertLocationHistoryRef(dataConnect, upsertLocationHistoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.locationHistory_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.locationHistory_upsert);
});
```

## UpdateCompany
You can execute the `UpdateCompany` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateCompany(vars: UpdateCompanyVariables): MutationPromise<UpdateCompanyData, UpdateCompanyVariables>;

interface UpdateCompanyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCompanyVariables): MutationRef<UpdateCompanyData, UpdateCompanyVariables>;
}
export const updateCompanyRef: UpdateCompanyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCompany(dc: DataConnect, vars: UpdateCompanyVariables): MutationPromise<UpdateCompanyData, UpdateCompanyVariables>;

interface UpdateCompanyRef {
  ...
  (dc: DataConnect, vars: UpdateCompanyVariables): MutationRef<UpdateCompanyData, UpdateCompanyVariables>;
}
export const updateCompanyRef: UpdateCompanyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCompanyRef:
```typescript
const name = updateCompanyRef.operationName;
console.log(name);
```

### Variables
The `UpdateCompany` mutation requires an argument of type `UpdateCompanyVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCompanyVariables {
  id: UUIDString;
  name?: string | null;
  logoUrl?: string | null;
  brandingPrimaryColor?: string | null;
  brandingSecondaryColor?: string | null;
  maxDrivers?: number | null;
}
```
### Return Type
Recall that executing the `UpdateCompany` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCompanyData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCompanyData {
  company_update?: Company_Key | null;
}
```
### Using `UpdateCompany`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCompany, UpdateCompanyVariables } from '@tracky/dataconnect';

// The `UpdateCompany` mutation requires an argument of type `UpdateCompanyVariables`:
const updateCompanyVars: UpdateCompanyVariables = {
  id: ..., 
  name: ..., // optional
  logoUrl: ..., // optional
  brandingPrimaryColor: ..., // optional
  brandingSecondaryColor: ..., // optional
  maxDrivers: ..., // optional
};

// Call the `updateCompany()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCompany(updateCompanyVars);
// Variables can be defined inline as well.
const { data } = await updateCompany({ id: ..., name: ..., logoUrl: ..., brandingPrimaryColor: ..., brandingSecondaryColor: ..., maxDrivers: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCompany(dataConnect, updateCompanyVars);

console.log(data.company_update);

// Or, you can use the `Promise` API.
updateCompany(updateCompanyVars).then((response) => {
  const data = response.data;
  console.log(data.company_update);
});
```

### Using `UpdateCompany`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCompanyRef, UpdateCompanyVariables } from '@tracky/dataconnect';

// The `UpdateCompany` mutation requires an argument of type `UpdateCompanyVariables`:
const updateCompanyVars: UpdateCompanyVariables = {
  id: ..., 
  name: ..., // optional
  logoUrl: ..., // optional
  brandingPrimaryColor: ..., // optional
  brandingSecondaryColor: ..., // optional
  maxDrivers: ..., // optional
};

// Call the `updateCompanyRef()` function to get a reference to the mutation.
const ref = updateCompanyRef(updateCompanyVars);
// Variables can be defined inline as well.
const ref = updateCompanyRef({ id: ..., name: ..., logoUrl: ..., brandingPrimaryColor: ..., brandingSecondaryColor: ..., maxDrivers: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCompanyRef(dataConnect, updateCompanyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.company_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.company_update);
});
```

## UpdateCompanySubscription
You can execute the `UpdateCompanySubscription` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateCompanySubscription(vars: UpdateCompanySubscriptionVariables): MutationPromise<UpdateCompanySubscriptionData, UpdateCompanySubscriptionVariables>;

interface UpdateCompanySubscriptionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCompanySubscriptionVariables): MutationRef<UpdateCompanySubscriptionData, UpdateCompanySubscriptionVariables>;
}
export const updateCompanySubscriptionRef: UpdateCompanySubscriptionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCompanySubscription(dc: DataConnect, vars: UpdateCompanySubscriptionVariables): MutationPromise<UpdateCompanySubscriptionData, UpdateCompanySubscriptionVariables>;

interface UpdateCompanySubscriptionRef {
  ...
  (dc: DataConnect, vars: UpdateCompanySubscriptionVariables): MutationRef<UpdateCompanySubscriptionData, UpdateCompanySubscriptionVariables>;
}
export const updateCompanySubscriptionRef: UpdateCompanySubscriptionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCompanySubscriptionRef:
```typescript
const name = updateCompanySubscriptionRef.operationName;
console.log(name);
```

### Variables
The `UpdateCompanySubscription` mutation requires an argument of type `UpdateCompanySubscriptionVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCompanySubscriptionVariables {
  id: UUIDString;
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: DateString;
  subscriptionEndDate: DateString;
  mpSubscriptionId?: string | null;
  mpCustomerId?: string | null;
}
```
### Return Type
Recall that executing the `UpdateCompanySubscription` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCompanySubscriptionData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCompanySubscriptionData {
  company_update?: Company_Key | null;
}
```
### Using `UpdateCompanySubscription`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCompanySubscription, UpdateCompanySubscriptionVariables } from '@tracky/dataconnect';

// The `UpdateCompanySubscription` mutation requires an argument of type `UpdateCompanySubscriptionVariables`:
const updateCompanySubscriptionVars: UpdateCompanySubscriptionVariables = {
  id: ..., 
  subscriptionPlan: ..., 
  subscriptionStatus: ..., 
  subscriptionStartDate: ..., 
  subscriptionEndDate: ..., 
  mpSubscriptionId: ..., // optional
  mpCustomerId: ..., // optional
};

// Call the `updateCompanySubscription()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCompanySubscription(updateCompanySubscriptionVars);
// Variables can be defined inline as well.
const { data } = await updateCompanySubscription({ id: ..., subscriptionPlan: ..., subscriptionStatus: ..., subscriptionStartDate: ..., subscriptionEndDate: ..., mpSubscriptionId: ..., mpCustomerId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCompanySubscription(dataConnect, updateCompanySubscriptionVars);

console.log(data.company_update);

// Or, you can use the `Promise` API.
updateCompanySubscription(updateCompanySubscriptionVars).then((response) => {
  const data = response.data;
  console.log(data.company_update);
});
```

### Using `UpdateCompanySubscription`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCompanySubscriptionRef, UpdateCompanySubscriptionVariables } from '@tracky/dataconnect';

// The `UpdateCompanySubscription` mutation requires an argument of type `UpdateCompanySubscriptionVariables`:
const updateCompanySubscriptionVars: UpdateCompanySubscriptionVariables = {
  id: ..., 
  subscriptionPlan: ..., 
  subscriptionStatus: ..., 
  subscriptionStartDate: ..., 
  subscriptionEndDate: ..., 
  mpSubscriptionId: ..., // optional
  mpCustomerId: ..., // optional
};

// Call the `updateCompanySubscriptionRef()` function to get a reference to the mutation.
const ref = updateCompanySubscriptionRef(updateCompanySubscriptionVars);
// Variables can be defined inline as well.
const ref = updateCompanySubscriptionRef({ id: ..., subscriptionPlan: ..., subscriptionStatus: ..., subscriptionStartDate: ..., subscriptionEndDate: ..., mpSubscriptionId: ..., mpCustomerId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCompanySubscriptionRef(dataConnect, updateCompanySubscriptionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.company_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.company_update);
});
```

## CreateCompany
You can execute the `CreateCompany` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
createCompany(vars: CreateCompanyVariables): MutationPromise<CreateCompanyData, CreateCompanyVariables>;

interface CreateCompanyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCompanyVariables): MutationRef<CreateCompanyData, CreateCompanyVariables>;
}
export const createCompanyRef: CreateCompanyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCompany(dc: DataConnect, vars: CreateCompanyVariables): MutationPromise<CreateCompanyData, CreateCompanyVariables>;

interface CreateCompanyRef {
  ...
  (dc: DataConnect, vars: CreateCompanyVariables): MutationRef<CreateCompanyData, CreateCompanyVariables>;
}
export const createCompanyRef: CreateCompanyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCompanyRef:
```typescript
const name = createCompanyRef.operationName;
console.log(name);
```

### Variables
The `CreateCompany` mutation requires an argument of type `CreateCompanyVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCompanyVariables {
  name: string;
  slug: string;
  logoUrl?: string | null;
  brandingPrimaryColor?: string | null;
  subscriptionPlan?: string | null;
}
```
### Return Type
Recall that executing the `CreateCompany` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCompanyData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCompanyData {
  company_insert: Company_Key;
}
```
### Using `CreateCompany`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCompany, CreateCompanyVariables } from '@tracky/dataconnect';

// The `CreateCompany` mutation requires an argument of type `CreateCompanyVariables`:
const createCompanyVars: CreateCompanyVariables = {
  name: ..., 
  slug: ..., 
  logoUrl: ..., // optional
  brandingPrimaryColor: ..., // optional
  subscriptionPlan: ..., // optional
};

// Call the `createCompany()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCompany(createCompanyVars);
// Variables can be defined inline as well.
const { data } = await createCompany({ name: ..., slug: ..., logoUrl: ..., brandingPrimaryColor: ..., subscriptionPlan: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCompany(dataConnect, createCompanyVars);

console.log(data.company_insert);

// Or, you can use the `Promise` API.
createCompany(createCompanyVars).then((response) => {
  const data = response.data;
  console.log(data.company_insert);
});
```

### Using `CreateCompany`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCompanyRef, CreateCompanyVariables } from '@tracky/dataconnect';

// The `CreateCompany` mutation requires an argument of type `CreateCompanyVariables`:
const createCompanyVars: CreateCompanyVariables = {
  name: ..., 
  slug: ..., 
  logoUrl: ..., // optional
  brandingPrimaryColor: ..., // optional
  subscriptionPlan: ..., // optional
};

// Call the `createCompanyRef()` function to get a reference to the mutation.
const ref = createCompanyRef(createCompanyVars);
// Variables can be defined inline as well.
const ref = createCompanyRef({ name: ..., slug: ..., logoUrl: ..., brandingPrimaryColor: ..., subscriptionPlan: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCompanyRef(dataConnect, createCompanyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.company_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.company_insert);
});
```

## DeleteCompany
You can execute the `DeleteCompany` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
deleteCompany(vars: DeleteCompanyVariables): MutationPromise<DeleteCompanyData, DeleteCompanyVariables>;

interface DeleteCompanyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCompanyVariables): MutationRef<DeleteCompanyData, DeleteCompanyVariables>;
}
export const deleteCompanyRef: DeleteCompanyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCompany(dc: DataConnect, vars: DeleteCompanyVariables): MutationPromise<DeleteCompanyData, DeleteCompanyVariables>;

interface DeleteCompanyRef {
  ...
  (dc: DataConnect, vars: DeleteCompanyVariables): MutationRef<DeleteCompanyData, DeleteCompanyVariables>;
}
export const deleteCompanyRef: DeleteCompanyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCompanyRef:
```typescript
const name = deleteCompanyRef.operationName;
console.log(name);
```

### Variables
The `DeleteCompany` mutation requires an argument of type `DeleteCompanyVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCompanyVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteCompany` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCompanyData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCompanyData {
  company_delete?: Company_Key | null;
}
```
### Using `DeleteCompany`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCompany, DeleteCompanyVariables } from '@tracky/dataconnect';

// The `DeleteCompany` mutation requires an argument of type `DeleteCompanyVariables`:
const deleteCompanyVars: DeleteCompanyVariables = {
  id: ..., 
};

// Call the `deleteCompany()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCompany(deleteCompanyVars);
// Variables can be defined inline as well.
const { data } = await deleteCompany({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCompany(dataConnect, deleteCompanyVars);

console.log(data.company_delete);

// Or, you can use the `Promise` API.
deleteCompany(deleteCompanyVars).then((response) => {
  const data = response.data;
  console.log(data.company_delete);
});
```

### Using `DeleteCompany`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCompanyRef, DeleteCompanyVariables } from '@tracky/dataconnect';

// The `DeleteCompany` mutation requires an argument of type `DeleteCompanyVariables`:
const deleteCompanyVars: DeleteCompanyVariables = {
  id: ..., 
};

// Call the `deleteCompanyRef()` function to get a reference to the mutation.
const ref = deleteCompanyRef(deleteCompanyVars);
// Variables can be defined inline as well.
const ref = deleteCompanyRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCompanyRef(dataConnect, deleteCompanyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.company_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.company_delete);
});
```

## DeleteUser
You can execute the `DeleteUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
deleteUser(vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;

interface DeleteUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
}
export const deleteUserRef: DeleteUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUser(dc: DataConnect, vars: DeleteUserVariables): MutationPromise<DeleteUserData, DeleteUserVariables>;

interface DeleteUserRef {
  ...
  (dc: DataConnect, vars: DeleteUserVariables): MutationRef<DeleteUserData, DeleteUserVariables>;
}
export const deleteUserRef: DeleteUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserRef:
```typescript
const name = deleteUserRef.operationName;
console.log(name);
```

### Variables
The `DeleteUser` mutation requires an argument of type `DeleteUserVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteUserVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserData {
  user_delete?: User_Key | null;
}
```
### Using `DeleteUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUser, DeleteUserVariables } from '@tracky/dataconnect';

// The `DeleteUser` mutation requires an argument of type `DeleteUserVariables`:
const deleteUserVars: DeleteUserVariables = {
  id: ..., 
};

// Call the `deleteUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUser(deleteUserVars);
// Variables can be defined inline as well.
const { data } = await deleteUser({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUser(dataConnect, deleteUserVars);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
deleteUser(deleteUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

### Using `DeleteUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserRef, DeleteUserVariables } from '@tracky/dataconnect';

// The `DeleteUser` mutation requires an argument of type `DeleteUserVariables`:
const deleteUserVars: DeleteUserVariables = {
  id: ..., 
};

// Call the `deleteUserRef()` function to get a reference to the mutation.
const ref = deleteUserRef(deleteUserVars);
// Variables can be defined inline as well.
const ref = deleteUserRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserRef(dataConnect, deleteUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

## UpdateUserActive
You can execute the `UpdateUserActive` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-sdk/index.d.ts](./index.d.ts):
```typescript
updateUserActive(vars: UpdateUserActiveVariables): MutationPromise<UpdateUserActiveData, UpdateUserActiveVariables>;

interface UpdateUserActiveRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserActiveVariables): MutationRef<UpdateUserActiveData, UpdateUserActiveVariables>;
}
export const updateUserActiveRef: UpdateUserActiveRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserActive(dc: DataConnect, vars: UpdateUserActiveVariables): MutationPromise<UpdateUserActiveData, UpdateUserActiveVariables>;

interface UpdateUserActiveRef {
  ...
  (dc: DataConnect, vars: UpdateUserActiveVariables): MutationRef<UpdateUserActiveData, UpdateUserActiveVariables>;
}
export const updateUserActiveRef: UpdateUserActiveRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserActiveRef:
```typescript
const name = updateUserActiveRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserActive` mutation requires an argument of type `UpdateUserActiveVariables`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserActiveVariables {
  id: UUIDString;
  active: boolean;
}
```
### Return Type
Recall that executing the `UpdateUserActive` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserActiveData`, which is defined in [dataconnect-sdk/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserActiveData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUserActive`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserActive, UpdateUserActiveVariables } from '@tracky/dataconnect';

// The `UpdateUserActive` mutation requires an argument of type `UpdateUserActiveVariables`:
const updateUserActiveVars: UpdateUserActiveVariables = {
  id: ..., 
  active: ..., 
};

// Call the `updateUserActive()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserActive(updateUserActiveVars);
// Variables can be defined inline as well.
const { data } = await updateUserActive({ id: ..., active: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserActive(dataConnect, updateUserActiveVars);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUserActive(updateUserActiveVars).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUserActive`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserActiveRef, UpdateUserActiveVariables } from '@tracky/dataconnect';

// The `UpdateUserActive` mutation requires an argument of type `UpdateUserActiveVariables`:
const updateUserActiveVars: UpdateUserActiveVariables = {
  id: ..., 
  active: ..., 
};

// Call the `updateUserActiveRef()` function to get a reference to the mutation.
const ref = updateUserActiveRef(updateUserActiveVars);
// Variables can be defined inline as well.
const ref = updateUserActiveRef({ id: ..., active: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserActiveRef(dataConnect, updateUserActiveVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

