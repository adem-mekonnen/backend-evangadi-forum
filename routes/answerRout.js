const express = require('express');
const router = require('./userRout');

const { postAnswer, getAnswers } = require('../controllers/answerCont')

// get answers for a Question
router.get("/:questionid", getAnswers)

// post answer for a Question
router.post("/", postAnswer)


module.exports = router