const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(__dirname));

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || "localhost",
    port: process.env.MYSQLPORT || 3306,
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || "divya_memory",
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL connected successfully!");
});

// Gmail Setup
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// BOOKING API
app.post("/api/bookings", (req, res) => {

    const { name, phone, event_type, event_date, message } = req.body;

    if (!name || !phone || !event_type || !event_date) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required fields."
        });
    }

    const sql = `
        INSERT INTO bookings
        (name, phone, event_type, event_date, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        name,
        phone,
        event_type,
        event_date,
        message || null
    ];

    db.query(sql, values, (err, result) => {

        if (err) {
            console.error("Booking save error:", err.message);

            return res.status(500).json({
                success: false,
                message: "Booking could not be saved."
            });
        }

        console.log("New booking saved. ID:", result.insertId);

       // Email Notification
const mailOptions = {
    from: `"Divya Memory" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: "🔔 New Booking Received — Divya Memory",

    html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;">

            <h2>📸 New Booking Received</h2>

            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Event Type:</strong> ${event_type}</p>
            <p><strong>Event Date:</strong> ${event_date}</p>

            <p>
                <strong>Message:</strong><br>
                ${message || "No message provided"}
            </p>

            <hr>

            <p style="color:#777;">
                This booking was submitted through
                <strong>Divya Memory | Photography & Films</strong>.
            </p>

        </div>
    `
};

// Send email without blocking the booking response
transporter.sendMail(mailOptions, (emailError, info) => {

    if (emailError) {
        console.error(
            "Email sending failed:",
            emailError.message
        );
        return;
    }

    console.log(
        "Booking notification email sent:",
        info.response
    );
});

// Tell website immediately that booking was saved
return res.json({
    success: true,
    message: "Booking submitted successfully!"
});
            });
});
// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Divya Memory server running on port ${PORT}`);
});
