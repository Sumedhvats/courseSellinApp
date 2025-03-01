const jwt = require("jsonwebtoken")
const { z, string } = require("zod")
const JWT_ADMIN_TOKEN = process.env.JWT_ADMIN_TOKEN
async function adminMiddleware (req, res, next) {

    try {
        const token = req.headers.token
        if(!token){
            res.status(400).json({
                message: "please provide a token"
            })
        }
        const compareToken=jwt.verify(token,JWT_ADMIN_TOKEN)
        if(!compareToken){
            res.status(400).json({
                message: "unauthorised access"
            })
        }
        else{
            req.adminId = compareToken.adminId;
            next()
        }
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
module.exports={
    adminMiddleware:adminMiddleware
}