const db = require('../db/connect');
const { StatusCodes } = require('http-status-codes')
const { v4: uuidv4 } = require('uuid');

const postQuestion = async (req, res,) => {
    const { title, description } = req.body
    if (!title || !description) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'all fields required' })
    }
    try {
        const questionid = uuidv4()

        await db.query('insert into questions (questionid,title, description,userid) values (?, ?,?,?)', [questionid, title, description, req.user.id])
        return res.status(StatusCodes.OK).json({ msg: 'Question added successfully' })
    } catch (error) {
        console.log(error.message)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Some error occurred. Please try again" })
    }
}

const allQuestions = async (req, res) => {
    try {
        const [questions] = await db.query('SELECT  title,description,questionid,username FROM questions JOIN users ON users.userid = questions.userid ORDER BY id DESC ');
        return res.status(StatusCodes.OK).json({ questions });
    } catch (error) {
        console.log(error.message)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Some error occurred. Please try again" })
    }

}
const sigleQuestion = async (req, res) => {
    const id = req.params.id
    try {

        const [question] = await db.query('SELECT * FROM questions WHERE questionid =?', [id]);
        if (question.length == 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'question not found' })
        }
        return res.status(StatusCodes.OK).json({ question });
    } catch (error) {
        console.log(error.message)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Some error occurred. Please try again" })
    }
}
module.exports = { allQuestions, sigleQuestion, postQuestion }