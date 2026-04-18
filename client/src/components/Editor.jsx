import React, { useEffect, useRef, useState } from "react"
import MonacoEditor from "@monaco-editor/react"
import socket from "../socket"
import PresenceBar from "./PresenceBar"

const Editor = ({ docId, userId, userColor }) => {
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const decorationsRef = useRef({})
  const isRemoteUpdate = useRef(false)
  const [users, setUsers] = useState([{ userId, color: userColor }])
  const [language, setLanguage] = useState("javascript")
  const [output, setOutput] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isOutputOpen, setIsOutputOpen] = useState(false)

  useEffect(() => {
    socket.connect()
    socket.emit("join-doc", docId)

    socket.on("load-doc", (content) => {
      if (editorRef.current) {
        isRemoteUpdate.current = true
        editorRef.current.setValue(content)
        isRemoteUpdate.current = false
      }
    })

    socket.on("receive-update", ({ content }) => {
      if (editorRef.current) {
        isRemoteUpdate.current = true
        const pos = editorRef.current.getPosition()
        editorRef.current.setValue(content)
        editorRef.current.setPosition(pos)
        isRemoteUpdate.current = false
      }
    })

    socket.on("user-joined", ({ userId: uid }) => {
      setUsers(prev => [...prev.filter(u => u.userId !== uid), 
        { userId: uid, color: "#888" }])
    })

    socket.on("cursor-update", ({ userId: uid, position, color }) => {
      if (uid === userId || !editorRef.current) return
      setUsers(prev => prev.map(u => 
        u.userId === uid ? { ...u, color } : u))
      const monaco = window.monaco
      if (!monaco) return
      const range = new monaco.Range(
        position.lineNumber, position.column,
        position.lineNumber, position.column + 1
      )
      if (!document.getElementById(`style-${uid}`)) {
        const s = document.createElement("style")
        s.id = `style-${uid}`
        s.innerHTML = `.cursor-${uid}{background:${color};width:2px!important}
          .cursor-line-${uid}{border-left:2px solid ${color};margin-left:-1px}`
        document.head.appendChild(s)
      }
      const newDec = editorRef.current.deltaDecorations(
        decorationsRef.current[uid] || [],
        [{ range, options: { className: `cursor-${uid}`, 
          beforeContentClassName: `cursor-line-${uid}` }}]
      )
      decorationsRef.current[uid] = newDec
    })

    socket.on("user-left", ({ userId: uid }) => {
      setUsers(prev => prev.filter(u => u.userId !== uid))
      if (editorRef.current && decorationsRef.current[uid]) {
        editorRef.current.deltaDecorations(decorationsRef.current[uid], [])
        delete decorationsRef.current[uid]
      }
    })

    return () => {
      socket.emit("leave-doc", docId)
      socket.off("load-doc")
      socket.off("receive-update")
      socket.off("user-joined")
      socket.off("cursor-update")
      socket.off("user-left")
      socket.disconnect()
    }
  }, [docId])

  const handleMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
  }

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel()
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language)
      }
    }
  }, [language])

  const handleChange = (value) => {
    if (isRemoteUpdate.current) return
    socket.emit("doc-update", { docId, content: value })
    socket.emit("cursor-update", {
      docId,
      position: editorRef.current?.getPosition(),
      color: userColor
    })
  }

  const runCode = async () => {
    if (!editorRef.current) return
    const code = editorRef.current.getValue()
    setIsRunning(true)
    setIsOutputOpen(true)
    setOutput(null)

    try {
      if (language === "javascript") {
        const logs = []
        const originalLog = console.log
        const originalError = console.error
        try {
          console.log = (...args) => logs.push(args.map(String).join(" "))
          console.error = (...args) => logs.push("Error: " + args.map(String).join(" "))
          const fn = new Function(code)
          const result = fn()
          if (result !== undefined) logs.push(String(result))
          setOutput({ stdout: logs.join("\n") || "✓ Ran successfully (no output)", stderr: "", code: 0 })
        } catch (err) {
          setOutput({ stdout: logs.join("\n"), stderr: err.toString(), code: 1 })
          setIsRunning(false)
        } finally {
          console.log = originalLog
          console.error = originalError
          setIsRunning(false)
        }
        return
      }

      const response = await fetch("https://syncscript-uwpi.onrender.com/api/docs/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language })
      })
      const data = await response.json()
      setOutput({
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        code: data.code || 0
      })
    } catch (err) {
      setOutput({ stderr: "Network error: " + err.message, code: 1 })
      setIsRunning(false)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", 
      width: "100%", height: "100vh", background: "#0d1117", overflow: "hidden" }}>
      <PresenceBar 
        users={users}
        docId={docId}
        language={language}
        onLanguageChange={(lang) => setLanguage(lang)}
        onRun={runCode}
        isRunning={isRunning}
      />
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <MonacoEditor
          width="100%"
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={handleMount}
          onChange={handleChange}
          options={{ 
            automaticLayout: true, 
            fontSize: 16, 
            minimap: { enabled: false },
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: false,
            scrollBeyondLastLine: false
          }}
        />
      </div>
      {isOutputOpen && (
        <div style={{
          height: "200px", background: "#0d1117", 
          borderTop: "1px solid #30363d",
          display: "flex", flexDirection: "column",
          flexShrink: 0
        }}>
          <div style={{
            display: "flex", alignItems: "center", 
            justifyContent: "space-between",
            padding: "6px 16px", borderBottom: "1px solid #30363d",
            background: "#161b22"
          }}>
            <span style={{ color: "#888", fontSize: "12px", fontWeight: 600 }}>
              OUTPUT
            </span>
            <button onClick={() => setIsOutputOpen(false)} style={{
              background: "transparent", border: "none", 
              color: "#888", cursor: "pointer", fontSize: "16px"
            }}>×</button>
          </div>
          <div style={{
            flex: 1, overflow: "auto", padding: "12px 16px",
            fontFamily: "monospace", fontSize: "13px"
          }}>
            {isRunning && (
              <span style={{ color: "#888" }}>Running...</span>
            )}
            {!isRunning && output && (
              <>
                {output.stdout && (
                  <pre style={{ color: "#34D399", margin: 0, 
                    whiteSpace: "pre-wrap" }}>
                    {output.stdout}
                  </pre>
                )}
                {output.stderr && (
                  <pre style={{ color: "#F87171", margin: 0, 
                    whiteSpace: "pre-wrap" }}>
                    {output.stderr}
                  </pre>
                )}
                {!output.stdout && !output.stderr && (
                  <span style={{ color: "#888" }}>
                    Process exited with code {output.code}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Editor
