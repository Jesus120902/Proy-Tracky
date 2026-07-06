# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { registerCompany, createUserProfile, createOrder, updateOrder, updateOrderEvidence, deleteOrder, createDriver, updateDriver, updateDriverLocation, updateDriverStatus } from '@tracky/dataconnect';


// Operation RegisterCompany:  For variables, look at type RegisterCompanyVars in ../index.d.ts
const { data } = await RegisterCompany(dataConnect, registerCompanyVars);

// Operation CreateUserProfile:  For variables, look at type CreateUserProfileVars in ../index.d.ts
const { data } = await CreateUserProfile(dataConnect, createUserProfileVars);

// Operation CreateOrder:  For variables, look at type CreateOrderVars in ../index.d.ts
const { data } = await CreateOrder(dataConnect, createOrderVars);

// Operation UpdateOrder:  For variables, look at type UpdateOrderVars in ../index.d.ts
const { data } = await UpdateOrder(dataConnect, updateOrderVars);

// Operation UpdateOrderEvidence:  For variables, look at type UpdateOrderEvidenceVars in ../index.d.ts
const { data } = await UpdateOrderEvidence(dataConnect, updateOrderEvidenceVars);

// Operation DeleteOrder:  For variables, look at type DeleteOrderVars in ../index.d.ts
const { data } = await DeleteOrder(dataConnect, deleteOrderVars);

// Operation CreateDriver:  For variables, look at type CreateDriverVars in ../index.d.ts
const { data } = await CreateDriver(dataConnect, createDriverVars);

// Operation UpdateDriver:  For variables, look at type UpdateDriverVars in ../index.d.ts
const { data } = await UpdateDriver(dataConnect, updateDriverVars);

// Operation UpdateDriverLocation:  For variables, look at type UpdateDriverLocationVars in ../index.d.ts
const { data } = await UpdateDriverLocation(dataConnect, updateDriverLocationVars);

// Operation UpdateDriverStatus:  For variables, look at type UpdateDriverStatusVars in ../index.d.ts
const { data } = await UpdateDriverStatus(dataConnect, updateDriverStatusVars);


```