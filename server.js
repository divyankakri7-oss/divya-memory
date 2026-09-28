const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "divya_memory"
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL connected successfully!");
});

// EMAIL SETUP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test route
app.get("/", (req, res) => {
    res.send("Divya Memory Backend is Running!");
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

        // EMAIL NOTIFICATION
        const mailOptions = {
            from: `"Divya Memory" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            subject: "🔔 New Booking Received — Divya Memory",

            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">

                    <h2 style="margin-bottom: 20px;">
                        📸 New Booking Received
                    </h2>

                    <p><strong>Name:</strong> ${name}</p>

                    <p><strong>Phone:</strong> ${phone}</p>

                    <p><strong>Event Type:</strong> ${event_type}</p>

                    <p><strong>Event Date:</strong> ${event_date}</p>

                    <p><strong>Message:</strong><br>
                    ${message || "No message provided"}
                    </p>

                    <hr>

                    <p style="color: #777;">
                        This booking was submitted through the
                        <strong>Divya Memory | Photography & Films</strong> website.
                    </p>

                </div>
            `
        };

        transporter.sendMail(mailOptions, (emailError, info) => {

            if (emailError) {
                console.error("Email sending failed:", emailError.message);

                // Booking database me save ho chuki hai,
                // lekin email send nahi hua.
                return res.json({
                    success: true,
                    message: "Booking saved, but email notification could not be sent."
                });
            }

            console.log("Booking notification email sent:", info.response);

            res.json({
                success: true,
                message: "Booking submitted successfully!"
            });
        });
    });
});

// START SERVER
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});