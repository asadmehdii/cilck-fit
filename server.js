const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2"); 
const bcrypt = require("bcrypt"); 
const app = express();
const port = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, "upload_images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload_images/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

const pool = mysql.createPool({
  host: "localhost", 
  user: "root", 
  password: "", 
  database: "clickfit", 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
  connection.release(); 
});

app.use(express.json());

app.use(express.static(__dirname));
app.use("/upload_images", express.static(path.join(__dirname, "upload_images")));

app.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(200).json({
      message: "File uploaded successfully",
      imageUrl: `/${req.file.path.replace(/\\/g, "/")}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/add-user", async (req, res) => {
  const { email, password, type } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    pool.query(
      "CALL addUser(?, ?, ?)",
      [email, hashedPassword, type],
      (err, results) => {
        if (err) {
          console.error("Error calling stored procedure:", err);
          return res.status(500).json({ error: "Failed to add user" });
        }
        res.status(200).json({ message: "User added successfully" });
      }
    );
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users", (req, res) => {
  pool.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
    res.status(200).json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});