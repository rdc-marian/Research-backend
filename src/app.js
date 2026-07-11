const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");
const app = express();
// Define allowed origins for CORS
const allowedOrigins = [process.env.FRONTEND_ORIGIN, "http://localhost:3000"].filter(Boolean);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, postman, curl) or matched origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Not allowed by CORS: ${origin}`));
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
