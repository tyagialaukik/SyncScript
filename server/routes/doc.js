const express = require("express");
const router = express.Router();
const { getBackend } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

router.get("/:id", (req, res) => {
  const connection = getBackend().connect();
  const doc = connection.get("documents", req.params.id);
  
  doc.fetch((err) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!doc.type) return res.status(404).json({ error: "Document not found" });
    
    res.json({ id: doc.id, data: doc.data, version: doc.version });
  });
});

router.post("/", (req, res) => {
  const connection = getBackend().connect();
  const docId = uuidv4();
  const doc = connection.get("documents", docId);
  
  doc.fetch((err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    doc.create({ content: "" }, (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: doc.id, data: doc.data, version: doc.version });
    });
  });
});

router.post("/execute", async (req, res) => {
  const { code, language } = req.body
  
  const fileNames = {
    javascript: "main.js",
    typescript: "main.ts", 
    python: "main.py",
    java: "Main.java",
    cpp: "main.cpp"
  }

  const fileName = fileNames[language] || "main.js"
  const langMap = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
    cpp: "cpp"
  }

  try {
    const fetch = (await import("node-fetch")).default
    const response = await fetch(
      `https://glot.io/api/run/${langMap[language] || "javascript"}/latest`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ name: fileName, content: code }]
        })
      }
    )
    const data = await response.json()
    res.json({
      stdout: data.stdout || "",
      stderr: data.stderr || data.error || "",
      code: data.stderr ? 1 : 0
    })
  } catch (err) {
    res.status(500).json({ stderr: err.message, stdout: "", code: 1 })
  }
})

module.exports = router;
