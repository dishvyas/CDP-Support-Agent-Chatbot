import React, { useState } from "react";
import { TextField, Button, Box, Typography, MenuItem, Select, InputLabel, FormControl, CircularProgress } from "@mui/material";
import DOMPurify from "dompurify";




function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState("Segment"); // Default platform
  const [loading, setLoading] = useState(false);


  function formatResponse(answers) {
    if (!answers || answers.length === 0) return "Sorry, I couldn't find an answer to your question.";

    return answers
        .map(({ answer }) => {
            // ✅ Format Feature Comparisons
            if (answer.includes("**Feature:")) {
                return answer
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert **bold** to <strong>
                    .replace(/-\s\*\*(.*?)\*\*/g, "<li><strong>$1</strong></li>") // List items
                    .replace(/(?:\r\n|\r|\n)/g, "<br>"); // Add line breaks
            }

            // ✅ Format Step-by-Step Guides
            if (answer.includes("\n")) {
                return answer
                    .split("\n")
                    .map((line) => `<p>${line}</p>`)
                    .join("");
            }

            // ✅ Format Code Snippets
            if (answer.includes("`")) {
                return answer.replace(/`(.*?)`/g, "<code>$1</code>");
            }

            return `<p>${answer}</p>`; // Default wrap in paragraph
        })
        .join("<br><br>");
}

  const handleSendMessage = async () => {
    if (input.trim()) {
        setMessages([...messages, { type: "user", text: input }]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5001/api/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: input, platform: platform }),
            });

            const data = await response.json();
            console.log("Backend Response:", data);

            let formattedResponse = formatResponse(data.answers);

            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "bot", text: formattedResponse },
            ]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: "bot", text: "Error fetching data. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    }
};

    
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 2,
        width: 400,
        margin: "auto",
        border: "1px solid #ddd",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        CDP Support Chatbot
      </Typography>

      {/* Platform Selection */}
      <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel>Platform</InputLabel>
        <Select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          label="Platform"
        >
          <MenuItem value="Segment">Segment</MenuItem>
          <MenuItem value="mParticle">mParticle</MenuItem>
          <MenuItem value="Lytics">Lytics</MenuItem>
          <MenuItem value="Zeotap">Zeotap</MenuItem>
        </Select>
      </FormControl>

      {/* Chat Messages Display */}
      <Box
        sx={{
          width: "100%",
          height: 300,
          overflowY: "scroll",
          border: "1px solid #ddd",
          borderRadius: 2,
          padding: 1,
          marginBottom: 2,
        }}
      >
        {messages.map((message, index) => (
          <Box key={index} sx={{ marginBottom: 1 }}>
            <Typography
  variant="body1"
  sx={{
    textAlign: message.type === "user" ? "right" : "left",
    backgroundColor: message.type === "user" ? "#d1e7dd" : "#f8d7da",
    padding: 1,
    borderRadius: 1,
  }}
>
  {message.type === "bot" ? (
    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.text) }} />
  ) : (
    message.text
  )}
</Typography>

          </Box>
        ))}
        
        {/* Show loading spinner while waiting for bot response */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>

      {/* Text Input */}
      <TextField
        label="Ask a question"
        variant="outlined"
        fullWidth
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      {/* Send Button */}
      <Button variant="contained" onClick={handleSendMessage} sx={{ marginTop: 1 }}>
        Send
      </Button>
    </Box>
  );
}

export default Chatbot;
