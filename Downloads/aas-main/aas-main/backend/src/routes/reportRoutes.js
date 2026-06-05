const express = require('express');
const {
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    getStatusCount,
    updateReportStatus   // ← pastikan diimport
} = require('../controllers/reportController');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllReports);
router.get('/status/count', getStatusCount);
router.get('/:id', getReportById);
router.post('/', upload.array('images', 5), createReport);
router.put('/:id', upload.single('image'), updateReport);
router.patch('/:id/status', updateReportStatus);   // ← route wajib ada
router.delete('/:id', deleteReport);

module.exports = router;