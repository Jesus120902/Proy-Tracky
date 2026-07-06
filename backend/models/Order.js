const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    defaultValue: () => `ORD-${Date.now()}`,
    field: 'order_number',
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'company_id',
    references: { model: 'companies', key: 'id' },
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'driver_id',
    references: { model: 'drivers', key: 'id' },
  },
  // Customer fields (flat)
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'customer_name',
  },
  customerAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'customer_address',
  },
  customerPhone: {
    type: DataTypes.STRING,
    defaultValue: '',
    field: 'customer_phone',
  },
  customerLat: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'customer_lat',
  },
  customerLng: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'customer_lng',
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in-transit', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
  },
  items: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'estimated_delivery',
  },
  assignedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'assigned_at',
  },
  transitStartedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'transit_started_at',
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at',
  },
  // Evidence fields (flat)
  evidenceSignature: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'evidence_signature',
  },
  evidencePhoto: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'evidence_photo',
  },
  evidenceRecipientName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'evidence_recipient_name',
  },
  evidenceDeliveredLat: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'evidence_delivered_lat',
  },
  evidenceDeliveredLng: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'evidence_delivered_lng',
  },
}, {
  tableName: 'orders',
  underscored: true,
  timestamps: true,
});

/**
 * Serializa al formato MongoDB-like que espera el frontend.
 * Reconstruye los objetos anidados `customer` y `evidence`.
 */
Order.prototype.toClientJSON = function (driverData) {
  const plain = this.get({ plain: true });
  const driver = driverData || this.Driver;
  return {
    _id: plain.id,
    orderNumber: plain.orderNumber,
    company: plain.companyId,
    driver: driver ? (driver.toClientJSON ? driver.toClientJSON() : driver) : null,
    customer: {
      name: plain.customerName,
      address: plain.customerAddress,
      phone: plain.customerPhone,
      coordinates: {
        lat: plain.customerLat,
        lng: plain.customerLng,
      },
    },
    status: plain.status,
    priority: plain.priority,
    items: plain.items,
    notes: plain.notes,
    estimatedDelivery: plain.estimatedDelivery,
    assignedAt: plain.assignedAt,
    transitStartedAt: plain.transitStartedAt,
    deliveredAt: plain.deliveredAt,
    evidence: {
      signature: plain.evidenceSignature,
      photo: plain.evidencePhoto,
      recipientName: plain.evidenceRecipientName,
      deliveredLocation: {
        lat: plain.evidenceDeliveredLat,
        lng: plain.evidenceDeliveredLng,
      },
    },
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
};

module.exports = Order;
