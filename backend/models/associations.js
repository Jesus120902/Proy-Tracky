/**
 * associations.js
 * Define las relaciones entre modelos Sequelize.
 * Importar DESPUÉS de que todos los modelos estén cargados.
 */
const Company = require('./Company');
const User = require('./User');
const Driver = require('./Driver');
const Order = require('./Order');
const LocationHistory = require('./LocationHistory');

// Company → Users, Drivers, Orders
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Company.hasMany(Driver, { foreignKey: 'company_id', as: 'drivers' });
Driver.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

Company.hasMany(Order, { foreignKey: 'company_id', as: 'orders' });
Order.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// Driver → Orders, LocationHistory
Driver.hasMany(Order, { foreignKey: 'driver_id', as: 'orders' });
Order.belongsTo(Driver, { foreignKey: 'driver_id', as: 'Driver' });

Driver.hasMany(LocationHistory, { foreignKey: 'driver_id', as: 'locationHistory' });
LocationHistory.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

// User ↔ Driver (opcional)
User.hasOne(Driver, { foreignKey: 'user_id', as: 'driverProfile' });
Driver.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { Company, User, Driver, Order, LocationHistory };
