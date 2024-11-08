require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");

const User = require("./model/user.model");
const TravelStory = require("./model/travel.story.model");
const { log, error } = require("console");
const { title } = require("process");

mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log(password);

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const isUser = await User.findOne({ email });

  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    fullName,
    email,
    password: hashedPassword,
  });

  await user.save();

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "100d",
    }
  );

  return res.status(201).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: "Registration Successful",
  });
});

// login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not Found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "100d",
    }
  );

  return res.status(200).json({
    error: false,
    message: "Login Successful",
    user: { fulName: user.fullName, email: user.email },
    accessToken,
  });
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { userId } = req.user;

  const isUser = await User.findOne({ _id: userId });

  if (!isUser) {
    return res.sendStatus(401);
  }
  return res.json({
    user: isUser,
    message: "",
  });
});

// Route to hanle image uplod
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: true, message: "No Image Uploades" });
    }
    const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
    console.log(error);
  }
});

// Delete an image from uploads folder
app.delete("/delete-image", async (req, res) => {
  const { imageUrl } = req.query;

  if (!imageUrl) {
    res
      .status(400)
      .json({ error: true, message: "imageUrl parameter is required" });
  }

  try {
    // Extract the filename from imageUrl
    const filename = path.basename(imageUrl);

    // Define the file path
    const filePath = path.join(__dirname, "uploads", filename);

    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Delete the file from uploads folder
      fs.unlinkSync(filePath);
      res.status(200).json({ message: "Image deleted successfully" });
    } else {
      res.status(400).json({ error: true, message: "Image not found" });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Serve static files from the uploads and assets directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Add Trevel Story
app.post("/add-travel-story", authenticateToken, async (req, res) => {
  const { title, story, visitedLoction, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  // Validate required fields
  if (!title || !story || !visitedLoction || !imageUrl || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All filds are required" });
  }

  // Convert visitedDate from millisecond to Date object
  const parsedVisitedDate = new Date(parseInt(visitedDate));

  try {
    const travelStory = new TravelStory({
      title,
      story,
      visitedLoction,
      userId,
      imageUrl,
      visitedDate: parsedVisitedDate,
    });

    await travelStory.save();
    res.status(201).json({ story: travelStory, message: "Added Successfully" });
  } catch (error) {
    res.status(400).json({ error: true, message: error.message });
  }
});

// Get All Travel Stories
app.get("/get-all-stories", authenticateToken, async (req, res) => {
  const { userId } = req.user;
  try {
    const travelStories = await TravelStory.find({ userId: userId }).sort({
      isFavourite: -1,
    });
    res.status(200).json({ stories: travelStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

//Edit Travel Stories
app.put("/edit-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, story, visitedLoction, imageUrl, visitedDate } = req.body;
  const { userId } = req.user;

  // Validate required fields
  if (!title || !story || !visitedLoction || !visitedDate) {
    return res
      .status(400)
      .json({ error: true, message: "All filds are required" });
  }

  // Convert visitedDate from millisecond to Date object
  const parsedVisitedDate = new Date(parseInt(visitedDate));

  try {
    // Find the travel story by ID and ensure it belongs to the autenticated user
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      res.status(400).json({ error: true, message: "Travelstory not fund" });
    }

    const placeholderImgUrl = `http://localhost:8000/assets/page-404.png`;

    travelStory.title = title;
    travelStory.story = story;
    travelStory.visitedLoction = visitedLoction;
    travelStory.imageUrl = imageUrl || placeholderImgUrl;
    travelStory.visitedDate = parsedVisitedDate;

    await travelStory.save();
    res.status(200).json({ story: travelStory, message: "Update Successful" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Delete a travel story
app.delete("/delete-story/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    // Find the travel story by ID and ensure it belongs to the autenticated user
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      res.status(400).json({ error: true, message: "Travelstory not fund" });
    }

    // Delete the travel story from the database
    await travelStory.deleteOne({ _id: id, userId: userId });

    // Extract the filename from the imageUrl
    const imageUrl = travelStory.imageUrl;
    const filename = path.basename(imageUrl);

    //Define the file path
    const filepath = path.join(__dirname, "uploads", filename);

    // Delete the image file from the uplodes folder
    fs.unlink(filepath, (err) => {
      console.error("Failed to delete image file", err);
      // Optinally, you could still resposd with a success status here
      // if you don't to treat this as a critical error
    });
    res.status(200).json({ message: "Travel Story Delete Successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Update isFavourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isFavourite } = req.body;
  const { userId } = req.user;

  try {
    const travelStory = await TravelStory.findOne({ _id: id, userId: userId });

    if (!travelStory) {
      return res
        .status(404)
        .json({ error: true, message: "Travel story not found" });
    }
    travelStory.isFavourite = isFavourite;

    await travelStory.save();
    res.status(200).json({ story: travelStory, message: "Update Successful" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Search travel story
app.get("/search", authenticateToken, async (req, res) => {
  const { query } = req.query;
  const { userId } = req.user;

  if (!query) {
    return res.status(404).json({ error: true, message: "query is required" });
  }
  try {
    const searchResults = await TravelStory.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { story: { $regex: query, $options: "i" } },
        { visitedLoction: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavourite: -1 });
    res.status(200).json({ stories: searchResults });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Filter travel stiries by date range

app.get("/travel-stories/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;



  try {
    // Convert startDate and endDate from milliseconds to Date object
    const start = new Date(parseInt(startDate));
    const end = new Date(parseInt(endDate));

    // Find travel stories that belong to the authenticated user and fall the date range
    const filteredStories = await TravelStory.find({
      userId: userId,
      visitedDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 });
    res.status(200).json({ stories: filteredStories });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

app.listen(8000);
module.exports = app;
