const express = require('express');
const { getAllVouchers, getSingleVoucher } = require('../controllers/Voucher');
const router = express.Router();

router.route('/').get(getAllVouchers);
router.route('/:id').get(getSingleVoucher)

module.exports = router;