const express = require('express');
const {
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    getStatusCount
} = require('../controllers/reportController');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllReports);
router.get('/status/count', getStatusCount);
router.get('/:id', getReportById);
router.post('/', upload.single('image'), createReport);
router.put('/:id', upload.single('image'), updateReport);
router.delete('/:id', deleteReport);

module.exports = router;