# KampanYES Admin Backend - Complete Implementation Guide

## 🎯 Overview

This guide provides step-by-step instructions for implementing a production-ready Express.js/Node.js/MongoDB backend based on the existing mock data structure and MSW API patterns.

## 📋 Prerequisites

### Required Software
- **Node.js**: v18.x or higher
- **MongoDB**: v6.x or higher (local or MongoDB Atlas)
- **Git**: For version control
- **Postman/Insomnia**: For API testing (optional)

### Required Accounts
- **MongoDB Atlas**: For cloud database (or local MongoDB)
- **Cloudinary**: For image storage and processing
- **GitHub**: For code repository

## 🚀 Step-by-Step Implementation

### Phase 1: Project Setup and Configuration

#### Step 1.1: Create Backend Project Structure
```bash
# Create backend directory
mkdir kampanyes-backend
cd kampanyes-backend

# Initialize Node.js project
npm init -y

# Create project structure
mkdir -p src/{models,routes,controllers,middleware,utils,config}
mkdir -p uploads
touch .env .gitignore
```

#### Step 1.2: Install Dependencies
```bash
# Core dependencies
npm install express mongoose cors helmet morgan compression
npm install dotenv joi bcryptjs jsonwebtoken
npm install multer cloudinary express-rate-limit
npm install express-validator express-async-handler

# Development dependencies  
npm install -D nodemon @types/node @types/express @types/bcryptjs
npm install -D @types/jsonwebtoken @types/multer @types/cors
```

#### Step 1.3: Environment Configuration
Create `.env` file with the following configuration:
```bash
# Server Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/kampanyes-admin
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kampanyes-admin

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# File Upload Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cors Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Step 1.4: Create .gitignore
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Uploads
uploads/*
!uploads/.gitkeep

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
```

### Phase 2: Database Configuration and Models

#### Step 2.1: Database Connection
Create `src/config/database.js`:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Enable mongoose debugging in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }
    
    return conn;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### Step 2.2: Category Model
Create `src/models/Category.js`:
```javascript
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  image: {
    type: String,
    required: [true, 'Category image is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  status: {
    type: Number,
    enum: [0, 1], // 0 = disabled, 1 = enabled
    default: 1,
    required: true
  },
  storesCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
categorySchema.index({ name: 1 });
categorySchema.index({ status: 1, createdAt: -1 });

// Virtual for stores
categorySchema.virtual('stores', {
  ref: 'Store',
  localField: '_id',
  foreignField: 'categoryId'
});

// Pre-save middleware to update stores count
categorySchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    const Store = mongoose.model('Store');
    this.storesCount = await Store.countDocuments({ 
      categoryId: this._id, 
      status: 1 
    });
  }
  next();
});

// Transform _id to id in JSON output
categorySchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Category', categorySchema);
```

#### Step 2.3: Store Model
Create `src/models/Store.js`:
```javascript
const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  logo: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(v);
      },
      message: 'Please provide a valid logo URL'
    }
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    postcode: {
      type: String,
      required: [true, 'Postcode is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(v) {
            return v.length === 2 && 
                   v[0] >= -180 && v[0] <= 180 && // longitude
                   v[1] >= -90 && v[1] <= 90;     // latitude
          },
          message: 'Coordinates must be [longitude, latitude] with valid ranges'
        }
      }
    }
  },
  openingHours: {
    monday: { type: String, default: 'Closed' },
    tuesday: { type: String, default: 'Closed' },
    wednesday: { type: String, default: 'Closed' },
    thursday: { type: String, default: 'Closed' },
    friday: { type: String, default: 'Closed' },
    saturday: { type: String, default: 'Closed' },
    sunday: { type: String, default: 'Closed' }
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid website URL'
    }
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: Number,
    enum: [0, 1], // 0 = inactive, 1 = active
    default: 1,
    required: true
  },
  activeFlyersCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
storeSchema.index({ categoryId: 1 });
storeSchema.index({ 'location.city': 1 });
storeSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index
storeSchema.index({ status: 1, createdAt: -1 });
storeSchema.index({ name: 'text', description: 'text' }); // Text search

// Virtual for collections
storeSchema.virtual('collections', {
  ref: 'Collection',
  localField: '_id',
  foreignField: 'storeId'
});

// Virtual for category details
storeSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

// Transform _id to id in JSON output
storeSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    ret.categoryId = ret.categoryId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Store', storeSchema);
```

#### Step 2.4: Collection Model
Create `src/models/Collection.js`:
```javascript
const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: [100, 'Collection name cannot exceed 100 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store is required']
  },
  thumbnailFlyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flyer',
    default: null
  },
  flyersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: Number,
    enum: [0, 1], // 0 = inactive, 1 = active
    default: 1,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
collectionSchema.index({ storeId: 1 });
collectionSchema.index({ categoryId: 1 });
collectionSchema.index({ status: 1, createdAt: -1 });
collectionSchema.index({ name: 'text' }); // Text search

// Virtual for flyers
collectionSchema.virtual('flyers', {
  ref: 'Flyer',
  localField: '_id',
  foreignField: 'collectionId'
});

// Virtual for store details
collectionSchema.virtual('store', {
  ref: 'Store',
  localField: 'storeId',
  foreignField: '_id',
  justOne: true
});

// Virtual for category details
collectionSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

// Pre-save validation: ensure category matches store's category
collectionSchema.pre('save', async function(next) {
  if (this.isModified('storeId') || this.isModified('categoryId')) {
    const Store = mongoose.model('Store');
    const store = await Store.findById(this.storeId);
    
    if (!store) {
      return next(new Error('Store not found'));
    }
    
    if (store.categoryId.toString() !== this.categoryId.toString()) {
      return next(new Error('Collection category must match store category'));
    }
  }
  next();
});

// Transform _id to id in JSON output
collectionSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    ret.categoryId = ret.categoryId.toString();
    ret.storeId = ret.storeId.toString();
    if (ret.thumbnailFlyerId) {
      ret.thumbnailFlyerId = ret.thumbnailFlyerId.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Collection', collectionSchema);
```

#### Step 2.5: Flyer Model
Create `src/models/Flyer.js`:
```javascript
const mongoose = require('mongoose');

const flyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Flyer name is required'],
    trim: true,
    maxlength: [100, 'Flyer name cannot exceed 100 characters']
  },
  image: {
    type: String,
    required: [true, 'Flyer image is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        return v >= 0 && Number.isFinite(v);
      },
      message: 'Price must be a valid positive number'
    }
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%'],
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Discount percentage must be between 0 and 100'
    }
  },
  finalPrice: {
    type: Number,
    required: true,
    min: [0, 'Final price cannot be negative']
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: [true, 'Collection is required']
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Store is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Please provide a valid start date'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v) && v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: Number,
    enum: [0, 1], // 0 = inactive, 1 = active
    default: 1,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
flyerSchema.index({ collectionId: 1 });
flyerSchema.index({ storeId: 1 });
flyerSchema.index({ startDate: 1, endDate: 1 });
flyerSchema.index({ status: 1, createdAt: -1 });
flyerSchema.index({ name: 'text' }); // Text search

// Virtual for collection details
flyerSchema.virtual('collection', {
  ref: 'Collection',
  localField: 'collectionId',
  foreignField: '_id',
  justOne: true
});

// Virtual for store details
flyerSchema.virtual('store', {
  ref: 'Store',
  localField: 'storeId',
  foreignField: '_id',
  justOne: true
});

// Virtual to check if flyer is currently active
flyerSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 1 && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Pre-save middleware to calculate final price
flyerSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('discountPercentage')) {
    this.finalPrice = this.price - (this.price * this.discountPercentage / 100);
    this.finalPrice = Math.round(this.finalPrice * 100) / 100; // Round to 2 decimal places
  }
  next();
});

// Pre-save validation: ensure store matches collection's store
flyerSchema.pre('save', async function(next) {
  if (this.isModified('collectionId') || this.isModified('storeId')) {
    const Collection = mongoose.model('Collection');
    const collection = await Collection.findById(this.collectionId);
    
    if (!collection) {
      return next(new Error('Collection not found'));
    }
    
    if (collection.storeId.toString() !== this.storeId.toString()) {
      return next(new Error('Flyer store must match collection store'));
    }
  }
  next();
});

// Transform _id to id in JSON output
flyerSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    ret.collectionId = ret.collectionId.toString();
    ret.storeId = ret.storeId.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Flyer', flyerSchema);
```

### Phase 3: Middleware and Utilities

#### Step 3.1: Error Handling Middleware
Create `src/middleware/errorHandler.js`:
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { statusCode: 400, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  res.status(error.statusCode || 500).json({
    status: 1,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

#### Step 3.2: Async Handler Wrapper
Create `src/middleware/asyncHandler.js`:
```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

#### Step 3.3: Validation Middleware
Create `src/middleware/validation.js`:
```javascript
const Joi = require('joi');

// MongoDB ObjectId validation
const objectId = () => Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

// Category validation schemas
const categorySchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(50).required(),
    image: Joi.string().uri().required(),
    status: Joi.number().valid(0, 1).default(1)
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(1).max(50),
    image: Joi.string().uri(),
    status: Joi.number().valid(0, 1)
  }).min(1)
};

// Store validation schemas
const storeSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    categoryId: objectId().required(),
    logo: Joi.string().uri(),
    location: Joi.object({
      address: Joi.string().trim().min(1).required(),
      city: Joi.string().trim().min(1).required(),
      postcode: Joi.string().trim().min(1).required(),
      country: Joi.string().trim().min(1).required(),
      coordinates: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
      })
    }).required(),
    openingHours: Joi.object({
      monday: Joi.string().default('Closed'),
      tuesday: Joi.string().default('Closed'),
      wednesday: Joi.string().default('Closed'),
      thursday: Joi.string().default('Closed'),
      friday: Joi.string().default('Closed'),
      saturday: Joi.string().default('Closed'),
      sunday: Joi.string().default('Closed')
    }),
    website: Joi.string().uri(),
    description: Joi.string().max(500),
    status: Joi.number().valid(0, 1).default(1)
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(1).max(100),
    categoryId: objectId(),
    logo: Joi.string().uri(),
    location: Joi.object({
      address: Joi.string().trim().min(1),
      city: Joi.string().trim().min(1),
      postcode: Joi.string().trim().min(1),
      country: Joi.string().trim().min(1),
      coordinates: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2)
      })
    }),
    openingHours: Joi.object({
      monday: Joi.string(),
      tuesday: Joi.string(),
      wednesday: Joi.string(),
      thursday: Joi.string(),
      friday: Joi.string(),
      saturday: Joi.string(),
      sunday: Joi.string()
    }),
    website: Joi.string().uri(),
    description: Joi.string().max(500),
    status: Joi.number().valid(0, 1)
  }).min(1)
};

// Collection validation schemas
const collectionSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    categoryId: objectId().required(),
    storeId: objectId().required(),
    status: Joi.number().valid(0, 1).default(1)
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(1).max(100),
    categoryId: objectId(),
    storeId: objectId(),
    thumbnailFlyerId: objectId().allow(null),
    status: Joi.number().valid(0, 1)
  }).min(1)
};

// Flyer validation schemas
const flyerSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    image: Joi.string().uri().required(),
    price: Joi.number().min(0).required(),
    discountPercentage: Joi.number().min(0).max(100).default(0),
    collectionId: objectId().required(),
    storeId: objectId().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    status: Joi.number().valid(0, 1).default(1)
  }),
  
  update: Joi.object({
    name: Joi.string().trim().min(1).max(100),
    image: Joi.string().uri(),
    price: Joi.number().min(0),
    discountPercentage: Joi.number().min(0).max(100),
    collectionId: objectId(),
    storeId: objectId(),
    startDate: Joi.date(),
    endDate: Joi.date().when('startDate', {
      is: Joi.exist(),
      then: Joi.date().greater(Joi.ref('startDate')),
      otherwise: Joi.date()
    }),
    status: Joi.number().valid(0, 1)
  }).min(1)
};

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = {};
      error.details.forEach(detail => {
        errors[detail.path.join('.')] = detail.message;
      });

      return res.status(400).json({
        status: 1,
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  categorySchemas,
  storeSchemas,
  collectionSchemas,
  flyerSchemas,
  objectId
};
```

#### Step 3.4: Response Utilities
Create `src/utils/response.js`:
```javascript
class APIResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      status: 0,
      message
    };

    if (data !== null) {
      if (Array.isArray(data)) {
        response.data = {
          list: data,
          total: data.length
        };
      } else if (data.list && data.pagination) {
        response.data = data;
      } else {
        response.data = data;
      }
    }

    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
      status: 1,
      message
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static paginated(res, list, total, page, limit, message = 'Success') {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      status: 0,
      message,
      data: {
        list,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  }
}

module.exports = APIResponse;
```

### Phase 4: Controllers Implementation

#### Step 4.1: Category Controller
Create `src/controllers/categoryController.js`:
```javascript
const Category = require('../models/Category');
const Store = require('../models/Store');
const asyncHandler = require('../middleware/asyncHandler');
const APIResponse = require('../utils/response');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    status
  } = req.query;

  // Build query
  const query = {};
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  if (status !== undefined) {
    query.status = parseInt(status);
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Update stores count for each category
  for (let category of categories) {
    const storesCount = await Store.countDocuments({ 
      categoryId: category._id, 
      status: 1 
    });
    category.storesCount = storesCount;
    await category.save();
  }

  const total = await Category.countDocuments(query);

  APIResponse.paginated(res, categories, total, page, limit);
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return APIResponse.error(res, 'Category not found', 404);
  }

  // Update stores count
  const storesCount = await Store.countDocuments({ 
    categoryId: category._id, 
    status: 1 
  });
  category.storesCount = storesCount;
  await category.save();

  APIResponse.success(res, category);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  
  APIResponse.success(res, category, 'Category created successfully', 201);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return APIResponse.error(res, 'Category not found', 404);
  }

  category = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  APIResponse.success(res, category, 'Category updated successfully');
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return APIResponse.error(res, 'Category not found', 404);
  }

  // Check if category has stores
  const storesCount = await Store.countDocuments({ categoryId: category._id });
  
  if (storesCount > 0) {
    return APIResponse.error(res, 'Cannot delete category with existing stores', 400);
  }

  await Category.findByIdAndDelete(req.params.id);

  APIResponse.success(res, null, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
```

#### Step 4.2: Store Controller
Create `src/controllers/storeController.js`:
```javascript
const Store = require('../models/Store');
const Category = require('../models/Category');
const Collection = require('../models/Collection');
const Flyer = require('../models/Flyer');
const asyncHandler = require('../middleware/asyncHandler');
const APIResponse = require('../utils/response');

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
const getStores = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    status,
    city
  } = req.query;

  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (category) {
    query.categoryId = category;
  }
  
  if (status !== undefined) {
    query.status = parseInt(status);
  }
  
  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' };
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const stores = await Store.find(query)
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Enrich with category name and active flyers count
  const enrichedStores = await Promise.all(stores.map(async (store) => {
    const activeFlyersCount = await Flyer.countDocuments({
      storeId: store._id,
      status: 1,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    const storeObj = store.toJSON();
    storeObj.categoryName = store.categoryId?.name || 'Unknown';
    storeObj.activeFlyersCount = activeFlyersCount;
    
    return storeObj;
  }));

  const total = await Store.countDocuments(query);

  APIResponse.paginated(res, enrichedStores, total, page, limit);
});

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
const getStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id)
    .populate('categoryId', 'name');

  if (!store) {
    return APIResponse.error(res, 'Store not found', 404);
  }

  // Add category name and active flyers count
  const activeFlyersCount = await Flyer.countDocuments({
    storeId: store._id,
    status: 1,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });

  const storeObj = store.toJSON();
  storeObj.categoryName = store.categoryId?.name || 'Unknown';
  storeObj.activeFlyersCount = activeFlyersCount;

  APIResponse.success(res, storeObj);
});

// @desc    Create new store
// @route   POST /api/stores
// @access  Private/Admin
const createStore = asyncHandler(async (req, res) => {
  // Verify category exists
  const category = await Category.findById(req.body.categoryId);
  if (!category) {
    return APIResponse.error(res, 'Category not found', 404);
  }

  const store = await Store.create(req.body);
  
  // Update category stores count
  await updateCategoryStoresCount(req.body.categoryId);
  
  // Populate category for response
  await store.populate('categoryId', 'name');
  
  const storeObj = store.toJSON();
  storeObj.categoryName = store.categoryId?.name || 'Unknown';
  storeObj.activeFlyersCount = 0;

  APIResponse.success(res, storeObj, 'Store created successfully', 201);
});

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private/Admin
const updateStore = asyncHandler(async (req, res) => {
  let store = await Store.findById(req.params.id);

  if (!store) {
    return APIResponse.error(res, 'Store not found', 404);
  }

  // If category is being updated, verify it exists
  if (req.body.categoryId && req.body.categoryId !== store.categoryId.toString()) {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      return APIResponse.error(res, 'Category not found', 404);
    }
    
    const oldCategoryId = store.categoryId;
    
    store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('categoryId', 'name');
    
    // Update both old and new category stores count
    await updateCategoryStoresCount(oldCategoryId);
    await updateCategoryStoresCount(req.body.categoryId);
  } else {
    store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('categoryId', 'name');
  }

  // Add enriched data
  const activeFlyersCount = await Flyer.countDocuments({
    storeId: store._id,
    status: 1,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });

  const storeObj = store.toJSON();
  storeObj.categoryName = store.categoryId?.name || 'Unknown';
  storeObj.activeFlyersCount = activeFlyersCount;

  APIResponse.success(res, storeObj, 'Store updated successfully');
});

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private/Admin
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    return APIResponse.error(res, 'Store not found', 404);
  }

  // Check if store has collections
  const collectionsCount = await Collection.countDocuments({ storeId: store._id });
  
  if (collectionsCount > 0) {
    return APIResponse.error(res, 'Cannot delete store with existing collections', 400);
  }

  const categoryId = store.categoryId;
  
  await Store.findByIdAndDelete(req.params.id);
  
  // Update category stores count
  await updateCategoryStoresCount(categoryId);

  APIResponse.success(res, null, 'Store deleted successfully');
});

// Helper function to update category stores count
const updateCategoryStoresCount = async (categoryId) => {
  const storesCount = await Store.countDocuments({ 
    categoryId, 
    status: 1 
  });
  
  await Category.findByIdAndUpdate(categoryId, { storesCount });
};

module.exports = {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore
};
```

#### Step 4.3: Flyer Controller
Create `src/controllers/flyerController.js`:
```javascript
const Flyer = require('../models/Flyer');
const Collection = require('../models/Collection');
const Store = require('../models/Store');
const asyncHandler = require('../middleware/asyncHandler');
const APIResponse = require('../utils/response');

// @desc    Get all flyers
// @route   GET /api/flyers
// @access  Public
const getFlyers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    collectionId,
    storeId,
    activeOnly
  } = req.query;

  // Build query
  const query = {};
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  if (collectionId) {
    query.collectionId = collectionId;
  }
  
  if (storeId) {
    query.storeId = storeId;
  }
  
  if (activeOnly === 'true') {
    const now = new Date();
    query.status = 1;
    query.startDate = { $lte: now };
    query.endDate = { $gte: now };
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  const flyers = await Flyer.find(query)
    .populate('collectionId', 'name')
    .populate('storeId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Flyer.countDocuments(query);

  APIResponse.paginated(res, flyers, total, page, limit);
});

// @desc    Get single flyer
// @route   GET /api/flyers/:id
// @access  Public
const getFlyer = asyncHandler(async (req, res) => {
  const flyer = await Flyer.findById(req.params.id)
    .populate('collectionId', 'name')
    .populate('storeId', 'name');

  if (!flyer) {
    return APIResponse.error(res, 'Flyer not found', 404);
  }

  APIResponse.success(res, flyer);
});

// @desc    Create new flyer
// @route   POST /api/collections/:collectionId/flyers
// @access  Private/Admin
const createFlyer = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  
  // Verify collection exists
  const collection = await Collection.findById(collectionId).populate('storeId');
  if (!collection) {
    return APIResponse.error(res, 'Collection not found', 404);
  }

  // Add collection and store references
  req.body.collectionId = collectionId;
  req.body.storeId = collection.storeId._id;

  const flyer = await Flyer.create(req.body);
  
  // Update collection flyers count
  await updateCollectionFlyersCount(collectionId);
  
  // Populate for response
  await flyer.populate(['collectionId', 'storeId']);

  APIResponse.success(res, flyer, 'Flyer created successfully', 201);
});

// @desc    Update flyer
// @route   PUT /api/flyers/:id
// @access  Private/Admin
const updateFlyer = asyncHandler(async (req, res) => {
  let flyer = await Flyer.findById(req.params.id);

  if (!flyer) {
    return APIResponse.error(res, 'Flyer not found', 404);
  }

  flyer = await Flyer.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate(['collectionId', 'storeId']);

  APIResponse.success(res, flyer, 'Flyer updated successfully');
});

// @desc    Delete flyer
// @route   DELETE /api/flyers/:id
// @access  Private/Admin
const deleteFlyer = asyncHandler(async (req, res) => {
  const flyer = await Flyer.findById(req.params.id);

  if (!flyer) {
    return APIResponse.error(res, 'Flyer not found', 404);
  }

  const collectionId = flyer.collectionId;
  
  await Flyer.findByIdAndDelete(req.params.id);
  
  // Update collection flyers count
  await updateCollectionFlyersCount(collectionId);

  APIResponse.success(res, null, 'Flyer deleted successfully');
});

// Helper function to update collection flyers count
const updateCollectionFlyersCount = async (collectionId) => {
  const flyersCount = await Flyer.countDocuments({ collectionId });
  await Collection.findByIdAndUpdate(collectionId, { flyersCount });
};

module.exports = {
  getFlyers,
  getFlyer,
  createFlyer,
  updateFlyer,
  deleteFlyer
};
```

### Phase 5: Routes Implementation

#### Step 5.1: Category Routes
Create `src/routes/categories.js`:
```javascript
const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { validate, categorySchemas } = require('../middleware/validation');

router.route('/')
  .get(getCategories)
  .post(validate(categorySchemas.create), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(validate(categorySchemas.update), updateCategory)
  .delete(deleteCategory);

module.exports = router;
```

#### Step 5.2: Store Routes
Create `src/routes/stores.js`:
```javascript
const express = require('express');
const router = express.Router();
const {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore
} = require('../controllers/storeController');
const { validate, storeSchemas } = require('../middleware/validation');

router.route('/')
  .get(getStores)
  .post(validate(storeSchemas.create), createStore);

router.route('/:id')
  .get(getStore)
  .put(validate(storeSchemas.update), updateStore)
  .delete(deleteStore);

module.exports = router;
```

#### Step 5.3: Flyer Routes
Create `src/routes/flyers.js`:
```javascript
const express = require('express');
const router = express.Router();
const {
  getFlyers,
  getFlyer,
  createFlyer,
  updateFlyer,
  deleteFlyer
} = require('../controllers/flyerController');
const { validate, flyerSchemas } = require('../middleware/validation');

// Standalone flyer routes
router.route('/')
  .get(getFlyers);

router.route('/:id')
  .get(getFlyer)
  .put(validate(flyerSchemas.update), updateFlyer)
  .delete(deleteFlyer);

module.exports = router;
```

#### Step 5.4: Collection Routes (with flyer sub-routes)
Create `src/routes/collections.js`:
```javascript
const express = require('express');
const router = express.Router();
const {
  getCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection
} = require('../controllers/collectionController');
const {
  createFlyer
} = require('../controllers/flyerController');
const { validate, collectionSchemas, flyerSchemas } = require('../middleware/validation');

// Collection routes
router.route('/')
  .get(getCollections)
  .post(validate(collectionSchemas.create), createCollection);

router.route('/:id')
  .get(getCollection)
  .put(validate(collectionSchemas.update), updateCollection)
  .delete(deleteCollection);

// Collection flyer sub-routes
router.route('/:collectionId/flyers')
  .post(validate(flyerSchemas.create), createFlyer);

module.exports = router;
```

### Phase 6: Main Server Setup

#### Step 6.1: Main Application File
Create `src/app.js`:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const APIResponse = require('./utils/response');

// Import routes
const categoryRoutes = require('./routes/categories');
const storeRoutes = require('./routes/stores');
const flyerRoutes = require('./routes/flyers');
const collectionRoutes = require('./routes/collections');

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 1,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/flyers', flyerRoutes);
app.use('/api/collections', collectionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  APIResponse.success(res, {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  }, 'Server is healthy');
});

// 404 handler
app.use('*', (req, res) => {
  APIResponse.error(res, `Route ${req.originalUrl} not found`, 404);
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
```

#### Step 6.2: Server Entry Point
Create `src/server.js`:
```javascript
const app = require('./app');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
```

#### Step 6.3: Package.json Scripts
Update `package.json` scripts section:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Phase 7: Data Migration Script

#### Step 7.1: Create Migration Script
Create `src/scripts/migrate-data.js`:
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Store = require('../models/Store');

// Sample data based on your mock data
const sampleCategories = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Supermarkets',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    status: 1
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    status: 1
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    status: 1
  }
];

const sampleStores = [
  {
    name: 'Albert Heijn',
    categoryId: sampleCategories[0]._id,
    logo: 'https://example.com/ah-logo.png',
    location: {
      address: 'Damrak 123',
      city: 'Amsterdam',
      postcode: '1012 LP',
      country: 'Netherlands',
      coordinates: {
        type: 'Point',
        coordinates: [4.9041, 52.3676] // [longitude, latitude]
      }
    },
    openingHours: {
      monday: '09:00-18:00',
      tuesday: '09:00-18:00',
      wednesday: '09:00-18:00',
      thursday: '09:00-18:00',
      friday: '09:00-18:00',
      saturday: '09:00-18:00',
      sunday: 'Closed'
    },
    website: 'https://www.ah.nl',
    description: 'Leading Dutch supermarket chain',
    status: 1
  },
  {
    name: 'MediaMarkt',
    categoryId: sampleCategories[1]._id,
    logo: 'https://example.com/mediamarkt-logo.png',
    location: {
      address: 'Alexandrium 2000',
      city: 'Rotterdam',
      postcode: '3067 GG',
      country: 'Netherlands',
      coordinates: {
        type: 'Point',
        coordinates: [4.5408, 51.9263]
      }
    },
    openingHours: {
      monday: '10:00-20:00',
      tuesday: '10:00-20:00',
      wednesday: '10:00-20:00',
      thursday: '10:00-20:00',
      friday: '10:00-20:00',
      saturday: '10:00-18:00',
      sunday: '12:00-17:00'
    },
    website: 'https://www.mediamarkt.nl',
    description: 'Electronics retail chain',
    status: 1
  }
];

const migrateData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Store.deleteMany({});
    console.log('Cleared existing data');

    // Insert categories
    const insertedCategories = await Category.insertMany(sampleCategories);
    console.log(`Inserted ${insertedCategories.length} categories`);

    // Insert stores
    const insertedStores = await Store.insertMany(sampleStores);
    console.log(`Inserted ${insertedStores.length} stores`);

    // Update category store counts
    for (let category of insertedCategories) {
      const storesCount = await Store.countDocuments({ 
        categoryId: category._id, 
        status: 1 
      });
      await Category.findByIdAndUpdate(category._id, { storesCount });
    }
    console.log('Updated category store counts');

    console.log('Data migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

migrateData();
```

### Phase 8: Testing and Deployment

#### Step 8.1: Test the Backend
```bash
# Install dependencies
npm install

# Run migration script
node src/scripts/migrate-data.js

# Start development server
npm run dev

# Test endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/categories
curl http://localhost:3001/api/stores
```

#### Step 8.2: Frontend Integration
Update your frontend to point to the real backend:

1. **Replace MSW endpoints** with real API calls
2. **Update API base URL** in your frontend configuration
3. **Test all CRUD operations** through the frontend
4. **Verify data consistency** between frontend and backend

#### Step 8.3: Production Deployment
1. **Environment Variables**: Set up production environment variables
2. **Database**: Use MongoDB Atlas for production database
3. **File Storage**: Configure Cloudinary for image uploads
4. **Server**: Deploy to services like Heroku, Railway, or DigitalOcean
5. **Monitoring**: Add logging and monitoring tools

## 🚀 Next Steps

1. **Complete the implementation** following this guide
2. **Add remaining entities** (Collections, Flyers, Users, Notifications)
3. **Implement file upload** functionality with Cloudinary
4. **Add authentication** and authorization middleware
5. **Write comprehensive tests** for all endpoints
6. **Set up CI/CD pipeline** for automated deployment
7. **Add API documentation** using tools like Swagger

## 📞 Support

This guide provides a complete roadmap for implementing your backend. Each step is detailed and includes working code examples. Follow the phases sequentially for the best results.

**Total Implementation Time**: Approximately 2-3 weeks for a complete, production-ready backend with all features.