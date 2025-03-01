const { Router } = require("express")
const coursesRouter = Router()
const  {courseModel}  = require("../db")
coursesRouter.post("/courses/purchase", async (req, res) => {

})
coursesRouter.get("/courses", async (req, res) => {

})
module.exports = {
    coursesRouter: coursesRouter
}