const jwt = require("jsonwebtoken");

const JWT_SECRET =
process.env.JWT_SECRET ||
"yourSecretKey";

function auth(req, res, next) {

    try {

        const authHeader =
        req.headers.authorization;

        if (!authHeader) {

            return res.status(403).json({
                error: "No token provided"
            });

        }

        let token;

        if (
            authHeader.startsWith(
                "Bearer "
            )
        ) {

            token =
            authHeader.split(" ")[1];

        } else {

            token =
            authHeader;

        }

        const decoded =
        jwt.verify(
            token,
            JWT_SECRET
        );

        req.user = decoded;

        next();

    }
    catch (err) {

        return res.status(401).json({
            error: "Invalid token"
        });

    }

}

module.exports = auth;