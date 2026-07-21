const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const app = express();
app.set("trust proxy", 1);

// Define allowed origins for CORS
const rawOrigins = [
    process.env.FRONTEND_ORIGIN,
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
].filter(Boolean);

const allowedOrigins = Array.from(
    new Set(
        rawOrigins.flatMap((o) =>
            o.split(",").map((item) => item.trim().replace(/\/$/, ""))
        )
    )
);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, postman, curl) or matched origins
        if (!origin) {
            return callback(null, true);
        }
        const cleanOrigin = origin.trim().replace(/\/$/, "");
        if (allowedOrigins.length === 0 || allowedOrigins.includes(cleanOrigin)) {
            return callback(null, true);
        }
        if (process.env.NODE_ENV !== "production" || cleanOrigin.includes(".vercel.app") || cleanOrigin.includes(".netlify.app") || cleanOrigin.includes("localhost")) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
}));
// Middleware for parsing JSON and URL-encoded request bodies
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
// HTTP request logger middleware
if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
}
const path = require("path");

// Root API path healthcheck
app.get("/", (req, res) => {
    res.json({ message: "Research Marian Portal API is running" });
});
// Serve static uploads
app.use("/api/uploads", express.static(path.join(__dirname, "..", "uploads")));
// API Routes mounting
app.use("/api", routes);
// Error and fallback middlewares
app.use(notFound);
app.use(errorHandler);
module.exports = { app };
