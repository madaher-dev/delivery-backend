const multer = require('multer');
const sharp = require('sharp');
const Order = require('./../models/orderModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/APIFeatures');

const multerStorage = multer.memoryStorage(); //image will be available at req.file.buffer , req.files for many

const upload = multer({
  storage: multerStorage
  // fileFilter: multerFilter,
});

//exports.uploadOrderImages = upload.array('imageUris', 3); //max number of images
exports.uploadOrderImages = upload.single('imageUri');
exports.resizeOrderImages = async (req, res, next) => {
  try {
    //console.log(req.file);
    //console.log(req.body);
    //console.log(`1-${req.file}`);
    if (!req.file) {
      return next();
    }

    // Images

    //req.body.images = [];
    let fName = req.body.title;
    fName = fName.split(' ');
    const fileName = `order-${fName[0]}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`assets/images/orders/${fileName}`);

    req.body.imageUri = fileName;

    next();
  } catch (error) {
    console.log(error);
  }
};
//CRUD

exports.getAllOrders = factory.getAll(Order);
//exports.getOrder = factory.getOne(Order, { path: 'reviews' }); //reviews is populate option
exports.getOrder = factory.getOne(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);

exports.createOrder = catchAsync(async (req, res, next) => {
  //console.log(req.body.destinationLocation)

  //Build destinationLocation Object
  if (!req.body.lng) {
    const coordinates = [];
    coordinates[0] = req.body.lng;
    coordinates[1] = req.body.lat;
    const destinationLocation = {};
    destinationLocation.type = 'Point';
    destinationLocation.coordinates = coordinates;
    destinationLocation.address = req.body.destinationAddress;
    req.body.destinationLocation = destinationLocation;
  }
  //set startLocation to user default location
  const user = await User.findById(req.user);

  req.body.user = req.user;

  if (user.location) {
    const address = user.location;
    req.body.startLocation = address;
  }

  if (req.body.amount) {
    req.body.amount = parseInt(req.body.amount);
  }
  const newOrder = await Order.create(req.body);

  res.status(201).json({
    status: 'success',
    timestamp: req.requestTime,
    data: {
      order: newOrder
    }
  });
});

exports.myOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), { user: req.user })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const filteredOrders = await features.query; //7ikmet rabina

  // Send responce
  res.status(200).json({
    status: 'success',
    results: filteredOrders.length,
    data: {
      orders: filteredOrders
    }
  });
});
