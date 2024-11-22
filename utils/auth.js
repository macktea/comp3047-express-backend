const { connectToDB, ObjectId } = require("./db");
const jwt = require('jsonwebtoken');

const generateToken = async (user) => {

    // Remove sensitive data from the user object  
    delete user.password;
    delete user.tokens;

    const token = jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: 86400 });

    const db = await connectToDB();
    try {
        await db.collection("user").updateOne(
            { _id: new ObjectId(user._id) },
            { $addToSet: { tokens: token } } // Add the new token to the array
        );
        return token;
    } catch (err) {
        console.error(err);
    } finally {
        await db.client.close();
    }
};

// extract bearer token from authHeader
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1]; // Return the token part
    }
    return null; // Return null if no token is found
}

// authenticate by token lookup 
const authenticate = async function (req, res, next) {
    let token = extractToken(req);

    if (!token) {
        return res.status(401).send("Unauthorised: No token provided");
    }

    const db = await connectToDB();
    try {
        const result = await db.collection("user").findOne({ tokens: token });
        if (!result) {
            return res.status(401).send("Unauthorised: Invalid token");
        }
        req.user = result;
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    } finally {
        await db.client.close();
    }
}

const removeToken = async function (token) {
    const db = await connectToDB();
    try {
        await db.collection("user").updateOne({ tokens: token }, { $pull: { tokens: token } });
    } catch {
        console.error("Error removing token from database:", err);
    } finally {
        await db.client.close();
    }
}

const verifyToken = async function (req, res, next) {

    // display req.user for debugging
    console.log("req.user: ", req.user);

    let token = extractToken(req);

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
            
            // Attach decoded user information to req.user if not already set
            req.user = req.user || decoded;
        } catch (err) {
            await removeToken(token);
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
    }

    next();
}

module.exports = { generateToken, authenticate, extractToken, verifyToken, removeToken };

