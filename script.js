const container = document.querySelector(".container");
const chatContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

const apiKey = "AIzaSyDu8D7VD8ffa12By9dH6xIhtyOc2qjBA3Q";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

let userMessage = "";
const chatHistory = [];

// function to create message elements
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const scrollToBottom = () =>
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split(" ");
  let wordIndex = 0;

  const typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent +=
        (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      botMsgDiv.classList.remove("loading");
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
    }
  }, 150);
};

const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  chatHistory.push({
    role: "user",
    parts: [{ text: userMessage }],
  });
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) throw new Error(data.error.message);

    const responseData = data.candidates[0].content.parts[0].text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .trim();
    console.log(responseData);
    typingEffect(responseData, textElement, botMsgDiv);
  } catch (error) {
    console.log(error);
  }
};

// Handle the form submissions
const handleFormSubmit = (e) => {
  e.preventDefault();
  userMessage = promptInput.value.trim();
  if (!userMessage) return;
  console.log(userMessage);
  promptInput.value = "";

  //   Generate user message HTML and in the chats container
  const userMsgHTML = `<p class="message-text"></p>`;
  const usermsgDiv = createMsgElement(userMsgHTML, "user-message");

  usermsgDiv.querySelector(".message-text").textContent = userMessage;
  chatContainer.appendChild(usermsgDiv);
  scrollToBottom();
  setTimeout(() => {
    const botMsgHTML = `<img
            class="gemini-logo"
            src="https://res.cloudinary.com/dg2fgkjxv/image/upload/v1742298750/gemini-chatbot-logo_hpiviu.svg"
            alt="gemini"
          />
          <p class="message-text">Just a sec...</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600);
};

document.querySelectorAll(".suggestion-list-item").forEach((item) => {
  item.addEventListener("click", () => {
    promptInput.value = item.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

promptForm.addEventListener("submit", handleFormSubmit);
