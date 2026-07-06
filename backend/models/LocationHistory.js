const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const LocationHistory = sequelize.define('LocationHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'driver_id',
    references: { model: 'drivers', key: 'id' },
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'company_id',
    references: { model: 'companies', key: 'id' },
  },
  date: {
    type: DataTypes.DATEONLY, // YYYY-MM-DD
    allowNull: false,
  },
  path: {
    type: DataTypes.JSONB, // Array de { lat, lng, timestamp }
    defaultValue: [],
  },
}, {
  tableName: 'location_history',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['driver_id', 'date'],
      name: 'location_history_driver_date_unique',
    },
  ],
});

module.exports = LocationHistory;
