const { idPrefixPlugin } = require('../services/database/plugins.database');
const mongoose = require('mongoose');

const base_model = {
  name: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail_url: { type: String, required: false },
  kind: {
    type: String,
    required: true,
    enum: [
      'orgresources:organization',
      'orgresources:project',
      'orgresources:user',
      'product:pdv',
      'product:ingredient',
      'knowledge:recipe',
    ],
  },
  metadata: {
    created_at: { type: Date, default: Date.now },
    last_modified: { type: Date, default: Date.now },
    modified_by: { type: String, required: false },
  },
};

const organization_model = {
  ...base_model,
  id: {
    type: String,
    required: true,
    default: idPrefixPlugin({ prefix: 'org_' }),
    unique: true,
  },
  resource_data: {
    iam: {
      // read_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      read_users: [{ type: String, ref: 'User' }],
      write_users: [{ type: String, ref: 'User' }],
      owner_user: { type: String, ref: 'User' },
    },
    business_category: { type: String },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Projects' }],
  },
};

const user_model = {
  ...base_model,
  id: {
    type: String,
    required: true,
    default: idPrefixPlugin({ prefix: 'usr_' }),
    unique: true,
  },
  resource_data: {
    idp_uuid: { type: String, required: true, unique: true },
    default_org: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    account_status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'disabled'],
    },
  },
};

const resource_model = {
  ...base_model,
  id: {
    type: String,
    required: true,
    default: idPrefixPlugin({ prefix: 'res_' }),
    unique: true,
  },
  resource_data: {
    medium_cost: { type: Number },
    currency: { type: String, enum: ['BRL', 'USD'] },
    inventory_quantity: { type: Number },
    last_restock_date: { type: Date },
    unit_of_measure: { type: String },
    quantity_value: { type: Number },
    image_gallery: { type: [String] },
    product_rating: { type: Number },
    price: { type: Number },
    product_ingredients: { type: [String] },
    instructions: { type: String },
  },
};

const project_model = {
  ...base_model,
  id: {
    type: String,
    required: true,
    default: idPrefixPlugin({ prefix: 'prj_' }),
    unique: true,
  },
  resource_data: {
    org_id: { type: String, ref: 'Organization' },
    apis_enabled: [{ type: String }],
    iam: {
      owner_user: { type: String, ref: 'User' },
      read_users: [{ type: String, ref: 'User' }],
      write_users: [{ type: String, ref: 'User' }],
    },
    resources: [{ type: String, ref: 'Resource' }],
  },
};

module.exports = {
  base_model,
  user_model,
  project_model,
  resource_model,
  organization_model,
};
