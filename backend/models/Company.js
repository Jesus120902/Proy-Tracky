const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  logoUrl: {
    type: DataTypes.TEXT,
    defaultValue: '',
    field: 'logo_url',
  },
  brandingPrimaryColor: {
    type: DataTypes.STRING,
    defaultValue: '#3b82f6',
    field: 'branding_primary_color',
  },
  brandingSecondaryColor: {
    type: DataTypes.STRING,
    defaultValue: '#0f172a',
    field: 'branding_secondary_color',
  },
  maxDrivers: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'max_drivers',
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('free', 'pro', 'business'),
    defaultValue: 'free',
    field: 'subscription_plan',
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('active', 'canceled', 'past_due', 'trialing'),
    defaultValue: 'trialing',
    field: 'subscription_status',
  },
  subscriptionStartDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'subscription_start_date',
  },
  subscriptionEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'subscription_end_date',
  },
  mpSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mp_subscription_id',
  },
  mpCustomerId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mp_customer_id',
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'companies',
  underscored: true,
  timestamps: true,
});

// Helper para serializar como el frontend espera
Company.prototype.toClientJSON = function () {
  return {
    _id: this.id,
    name: this.name,
    slug: this.slug,
    logoUrl: this.logoUrl,
    branding: {
      primaryColor: this.brandingPrimaryColor,
      secondaryColor: this.brandingSecondaryColor,
    },
    settings: { maxDrivers: this.maxDrivers },
    subscription: {
      plan: this.subscriptionPlan,
      status: this.subscriptionStatus,
      startDate: this.subscriptionStartDate,
      endDate: this.subscriptionEndDate,
      mpSubscriptionId: this.mpSubscriptionId,
      mpCustomerId: this.mpCustomerId,
    },
    active: this.active,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = Company;
