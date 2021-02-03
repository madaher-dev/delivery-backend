const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const orderSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'An order must have a title'],
      maxlength: [40, 'An order title must be less than 40 characters!'],
      minlength: [5, 'An order title must have more than 5 characters!']
    },
    description: {
      type: String,
      trim: true //remove white space in beg and end
    },
    createdAt: {
      type: Date,
      default: Date.now()
      //select: false //does not return field in select query
    },
    amount: Number,
    status: {
      type: String,
      default: 'pending',
      enum: {
        values: [
          'canceled',
          'pending',
          'approved',
          'collected',
          'delivered',
          'deleted'
        ],
        message: 'Invalid status'
      }
    },
    deliveryDate: [Date],
    slug: String,
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    destinationLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },

    receiver: String,
    receiverPhone: String,
    imageUri: String
  },
  {
    toJson: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Document Middleware runs before .save() and .create() commands but not on .insertMany()
orderSchema.pre('save', function(next) {
  //pre save hook
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Query middlewre
orderSchema.pre(/^find/, function(next) {
  //resourceSchema.pre('find', function(next) {
  //runs before find queries
  this.find({ status: { $ne: 'deleted' } });

  next();
});

orderSchema.pre('save', function(next) {
  //pre save can be used more than once
  console.log('Will Save Document!');
  next();
});

orderSchema.index({ title: 1 });

orderSchema.post('save', function(doc, next) {
  //access to finished document
  console.log(doc);
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
