const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes')
const { v4: uuidv4 } = require('uuid');

const postAnswer = async (req, res) => {
    const { questionid, answer } = req.body

    const userid = req.user.id

    if (!questionid || !answer) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            error: 'Please provide answer'
        })
    }

    try {
        const answerid = uuidv4()

        await db.query('INSERT INTO answers (answerid,questionid, answer, userid) VALUES (?, ?, ?,?)', [answerid, questionid, answer, userid])
        return res.status(StatusCodes.CREATED).json({ msg: 'answer posted successfully' })
    } catch (error) {
        console.log(error.message)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Some error occurred. Please try again" })
    }
}

const getAnswers = async (req, res) => {
    const { questionid } = req.params
    try {
        const allAnswersForQuestion = `
        SELECT username, answer FROM 
            answers JOIN users 
                ON
            answers.userid = users.userid 
            WHERE answers.questionid = ?`

        const [answers] = await db.query(allAnswersForQuestion, [questionid])

        return res.status(StatusCodes.OK).json({ answers })

    } catch (error) {
        console.log(error.message)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Some error occurred. Please try again" })
    }
}

module.exports = { postAnswer, getAnswers }