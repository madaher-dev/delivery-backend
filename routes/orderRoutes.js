const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');
const authController = require('./../controllers/authController');

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    orderController.getAllOrders
  )
  .post(
    authController.protect,

    orderController.uploadOrderImages,
    orderController.resizeOrderImages,
    orderController.createOrder
  );
router.route('/myOrders').get(authController.protect, orderController.myOrders);
router
  .route('/driverOrders')
  .get(authController.protect, orderController.driverOrders);
router
  .route('/:id/:optional?')
  .get(orderController.getOrder)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'driver'),
    orderController.updateOrder
  )
  .delete(orderController.deleteOrder);

module.exports = router;
