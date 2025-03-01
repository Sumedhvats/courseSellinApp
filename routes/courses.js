const { Router } = require("express")
const coursesRouter = Router()
const { userMiddleware } = require("../middlewares/userMiddleware")
const { courseModel, purchaseModel, userModel } = require("../db")

coursesRouter.post("/courses/purchase", userMiddleware, async (req, res) => {
    try {
        const userId = req.userId
        const courseId = req.body.courseId
        await purchaseModel.create({
            userId: userId,
            courseId: courseId
        })

    } catch (e) {

        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
})
coursesRouter.get("/courses", userMiddleware, async (req, res) => {
    const courses = await courseModel.find()
    coursesArray = []
    courses.forEach((course) => {
        coursesArray.push(course.title)
    })
    res.json({
        "courses": coursesArray
    })
})
module.exports = {
    coursesRouter: coursesRouter
}