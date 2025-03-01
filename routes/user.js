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
        console.log(e);
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
        console.log(e);
    }
    
})
userRouter.get("/myCourses", async (req, res) => {
})
module.exports = {
    userRouter: userRouter
}