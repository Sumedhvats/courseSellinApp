const { Router } = require("express")
adminRouter = Router()
const { adminModel, courseModel } = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { z, string, number } = require("zod")
const JWT_ADMIN_TOKEN = process.env.JWT_ADMIN_TOKEN
const { adminMiddleware } = require("../middlewares/adminMiddleware")
const { default: mongoose } = require("mongoose")
adminRouter.post("/signup", async (req, res) => {
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
    const existing = await adminModel.exists({ email:req.body.email  })
    if (existing) {
        res.status(405).json({
            "message": "admin already exists"
        })
    }
    try {
        const email = req.body.email
        const password = req.body.password
        const firstName = req.body.firstName
        const lastName = req.body.lastName
        const encPassword = await bcrypt.hash(password, 5)
        await adminModel.create({
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
adminRouter.post("/signin", async (req, res) => {
    const bodySchema = z.object({
        email: string().email(),
        password: string()
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
        const admin = await adminModel.findOne({
            email: email
            
        })
        if (!admin) {
            return res.status(400).json({
                message: "unauthorised access"
            })
        }
        const comparePassword = await bcrypt.compare(password, admin.password)
        if (!comparePassword) {
            return res.status(400).json({
                message: "unauthorised access"
            })
        }
        const token = jwt.sign({ adminId: admin._id }, JWT_ADMIN_TOKEN)
        res.setHeader("Authorization", `Bearer ${token}`);
        res.json({ message: "successfully logged in", token });


    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }
})
adminRouter.use(adminMiddleware)
adminRouter.post("/course", async (req, res) => {
    const bodySchema = z.object({
        title: string(),
        description: string(),
        imageUrl: string(),
        price: number()
    })
    const isSafe = bodySchema.safeParse(req.body)
    if (!isSafe.success) {
        return res.status(400).json({
            message: "wrong input type"
        })
    }
    try {
        const adminId = req.adminId
        const { title, description, imageUrl, price } = req.body
        await courseModel.create({
            title: title,
            description: description,
            imageUrl: imageUrl,
            price: price,
            creatorId: adminId
        })
        res.status(200).json({
            message: "course created",
            creatorId: adminId
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }

})
adminRouter.put("/course", async (req, res) => {
    const bodySchema = z.object({
        title: string(),
        description: string(),
        imageUrl: string(),
        price: number(),
    })
    const isSafe = bodySchema.safeParse(req.body)
    if (!isSafe.success) {
        return res.status(400).json({
            message: "wrong input type"
        })
    }
    try {
        const adminId = req.adminId
        console.log(adminId)
        const courseId =req.headers["courseid"]; // or req.headers["course-id"]

        console.log(courseId)
        const { title, description, imageUrl, price } = req.body

        const course = await courseModel.findOneAndUpdate({
            creatorId: adminId,
            _id:courseId
        }, {
            title: title,
            description: description,
            imageUrl: imageUrl,
            price: price,
            creatorId: adminId
        }, { new: true, upsert: false })
        if (!course) {


            return res.json({
                message: "No course found for the given adminId."
            })
        }

        res.status(200).json({
            message: "course updated",
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }

})
adminRouter.get("/course/all", async (req, res) => {

    try {
        const adminId = req.adminId
        const courses = await courseModel.find({
            creatorId: adminId
        })
        if (!courses.length) {
            return res.status(404).json({ message: "No courses found for this admin." });
        }
        coursesOfAdmin = []
        courses.forEach(course => {
            coursesOfAdmin.push(course.title)
        })
        res.status(200).json({
            message: "course found",
            courses: coursesOfAdmin
        })
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal server error" });
    }

})

module.exports = {
    adminRouter: adminRouter
}