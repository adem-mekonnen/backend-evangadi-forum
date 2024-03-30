const express = require('express');
const router = express.Router()

const { postQuestion, allQuestions, sigleQuestion } = require('../controllers/questionCont')

router.get('/', allQuestions)
router.get('/:id', sigleQuestion)
router.post("/", postQuestion)

module.exports = router