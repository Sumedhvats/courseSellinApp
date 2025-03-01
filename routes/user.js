const { Router } = require("express")
const userRouter = Router()
const {userModel}=require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { z, string } = require("zod")
const JWT_USER_TOKEN = process.env.JWT_USER_TOKEN
userRouter.post("/signup", async (req, res) => {
    const bodySchema = z.object({
        email: string().email(),
        password: string(),
        firstName: string(),
        lastName: string()
    })
    const isSafe = bodySchema.safeParse(req.body)
    if (!isSafe.success) {
        return res.status(400).json({
            message: "wrong input type"
        })
    }
    const existing = await userModel.exists({ email })
    if (existing) {
        res.status(405).json({
            "message": "user already exists"
        })
    }
    try {
        const email = req.body.email
        const password = req.body.password
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const encPassword = await bcrypt.hash(password, 5)
        await userModel.create({
            email: email,
            password: encPassword,
            firstName: firstName,
            lastName: lastName
        })
        res.json({
            message: "successfully signed up"
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }

})
userRouter.post("/signin", async (req, res) => {
    const bodySchema = z.object({
        email: string().email(),
        password: string()
    })
    const isSafe = bodySchema.safeParse(req.body)
    if (!isSafe) {
        return res.status(400).json({
            message: "wrong input type"
        })
    }
    try {
        const email = req.body.email
        const password = req.body.password
        const user = await userModel.findOne({
            email: email
        })
        if (!user) {
            return res.status(400).json({
                message: "unauthorised access"
            })
        }
        const comparePassword = await bcrypt.compare(password, user.password)
        if (!comparePassword) {
            return res.status(400).json({
                message: "unauthorised access"
            })
        }
        const token = jwt.sign({ userId: user._id }, JWT_USER_TOKEN)
        res.setHeader("Authorization", `Bearer ${token}`);
        res.json({ message: "successfully logged in", token });
        
        
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
})
userRouter.get("/myCourses", async (req, res) => {
    try {
        const userId = req.userId
        const courses = await courseModel.find({
            creatorId: userId
        })
        if (!courses.length) {
            return res.status(404).json({ message: "No courses found for this user." });
        }
        coursesOfuser = []
        courses.forEach(course => {
            coursesOfuser.push(course.title)
        })
        res.status(200).json({
            message: "course found",
            courses: coursesOfuser
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }

})
module.exports = {
    userRouter: userRouter
}