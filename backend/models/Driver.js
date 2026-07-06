const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: { model: 'users', key: 'id' },
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'company_id',
    references: { model: 'companies', key: 'id' },
  },
  vehicleType: {
    type: DataTypes.STRING,
    defaultValue: 'Van',
    field: 'vehicle_type',
  },
  vehiclePlate: {
    type: DataTypes.STRING,
    defaultValue: '',
    field: 'vehicle_plate',
  },
  status: {
    type: DataTypes.ENUM('available', 'on-delivery', 'offline'),
    defaultValue: 'available',
  },
  locationLat: {
    type: DataTypes.FLOAT,
    defaultValue: -12.0464,
    field: 'location_lat',
  },
  locationLng: {
    type: DataTypes.FLOAT,
    defaultValue: -74.006,
    field: 'location_lng',
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.5,
  },
  totalDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_deliveries',
  },
  avatar: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'drivers',
  underscored: true,
  timestamps: true,
});

// Serializar al formato que espera el frontend (MongoDB-like)
Driver.prototype.toClientJSON = function () {
  const plain = this.get({ plain: true });
  return {
    _id: plain.id,
    name: plain.name,
    email: plain.email,
    user: plain.userId,
    company: plain.companyId,
    vehicle: {
      type: plain.vehicleType,
      plate: plain.vehiclePlate,
    },
    status: plain.status,
    location: {
      lat: plain.locationLat,
      lng: plain.locationLng,
    },
    rating: plain.rating,
    totalDeliveries: plain.totalDeliveries,
    avatar: plain.avatar,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
};

module.exports = Driver;
