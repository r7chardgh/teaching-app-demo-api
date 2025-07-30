require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3005;
const uri = process.env.MONGODB_URI;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// MongoDB connection
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Question Schema
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ["easy", "intermediate", "hard"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model("Question", questionSchema);

// Submit new question
app.post("/api/questions", async (req, res) => {
  try {
    const { question, level } = req.body;

    if (!question || !level) {
      return res.status(400).json({ error: "Question and level are required" });
    }

    if (!["easy", "intermediate", "hard"].includes(level)) {
      return res.status(400).json({ error: "Invalid level" });
    }

    const newQuestion = new Question({ question, level });
    await newQuestion.save();

    res
      .status(201)
      .json({ message: "Question added successfully", question: newQuestion });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get questions with pagination
app.get("/api/questions", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    if (![10, 20, 30].includes(limit)) {
      return res.status(400).json({ error: "Limit must be 10, 20, or 30" });
    }

    const questions = await Question.find()
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (_, res) => {
  res.json("server is connected");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
