const express = require('express');
const { getCommentsByReport, createComment, deleteComment } = require('../controllers/commentController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/report/:reportId', getCommentsByReport);
router.post('/report/:reportId', createComment);
router.delete('/:id', deleteComment);

module.exports = router;