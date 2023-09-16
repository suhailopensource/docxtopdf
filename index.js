const express = require("express");
const bodyParser = require("body-parser");
const docxConverter = require("docx-pdf");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
const cleanUpFiles = () => {
  const directoryPathToDelete = path.join(__dirname, "uploads");
  fs.readdir(directoryPathToDelete, (err, files) => {
    if (err) {
      console.error(`Error reading the directory: ${err}`);
      return;
    }

    // Iterate through the files in the directory and delete each one
    files.forEach((file) => {
      const filePath = path.join(directoryPathToDelete, file);

      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`Error deleting the file `, unlinkErr);
        } else {
          console.log(`File has been deleted.`);
        }
      });
    });

    // Now you can release any references to file data in your application
    // Example: fileDataArray = null; (if you have an array holding file data)
  });
};

app.post("/docxtopdf", upload.single("file"), (req, res) => {
  const outputFilePath = Date.now() + "output.pdf";
  docxConverter(req.file.path, outputFilePath, (err, result) => {
    if (err) {
      console.err(err);
    } else {
      res.download(outputFilePath, () => {
        cleanUpFiles();
      });
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const port = 8080;
app.listen(port, () => {
  console.log("connected to http://localhost:8080");
});
