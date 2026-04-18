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

  const languageIds = {
    javascript: 93,
    typescript: 74,
    python: 71,
    java: 62,
    cpp: 54
  }

  try {
    const fetch = (await import("node-fetch")).default
    const langId = languageIds[language] || 93

    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: langId,
          stdin: ""
        })
      }
    )
    const data = await response.json()
    res.json({
      stdout: data.stdout || "",
      stderr: data.stderr || data.compile_output || "",
      code: data.exit_code || 0
    })
  } catch (err) {
    res.status(500).json({ 
      stderr: err.message, stdout: "", code: 1 
    })
  }
})

module.exports = router;
