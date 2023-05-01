import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const CHAT_GPT_TEXT = "ChatGPT";

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: `Hi, I'm ${CHAT_GPT_TEXT}`,
      sentTime: "Just now",
      sender: CHAT_GPT_TEXT,
    },
  ]);
  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing",
    };

    const newMessages = [...messages, newMessage];
    // update state
    setMessages(newMessages);
    setTyping(true);
    //process
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });
    const systemMessage = {
      role: "system",
      content: "Explain like I'm 20 years old.",
    };

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };
    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + (import.meta.env.VITE_API_KEY.slice(1, -2)),
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
        const newMessage = data.choices ? data.choices[0].message.content : data.error.message;
        setMessages([...chatMessages, { message: newMessage, sender: "ChatGPT" }]);
        setTyping(false);
      });
  }
  return (
    <div className="App">
      <h1 style={{fontFamily:"arial",fontSize:"large",marginBottom:"10px" }}>ChatGPT Implementation</h1>
    
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
            scrollBehavior="smooth"
              typingIndicator={
                typing ? <TypingIndicator content="ChatGPT is Typing" /> : null
              }
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput
              placeholder="message here"
              onSend={handleSend}
            ></MessageInput>
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
