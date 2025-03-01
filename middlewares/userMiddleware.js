const jwt = require("jsonwebtoken")
const JWT_USER_TOKEN = process.env.JWT_USER_TOKEN
async function userMiddleware(req, res, next) {
    try {
        const token = req.headers.token
        if (!token) {
            return res.status(400).json({
                message: "please provide a token"
            })
        }
        const compareToken = jwt.verify(token, JWT_USER_TOKEN)
        if (!compareToken) {
            return res.status(400).json({
                message: "unauthorised access"
            })
        }
        else {
            req.userId = compareToken.userId;
            next()
        }
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
module.exports = {
    userMiddleware: userMiddleware
}