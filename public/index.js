const form = document.getElementById("form");
const userInput = document.getElementById("user-input");
const chatbotConversation = document.getElementById(
  "chatbot-conversation-container"
);

function addSpeechBubble(text, who) {
  const bubble = document.createElement("div");
  bubble.classList.add("speech", who === "human" ? "speech-human" : "speech-ai");
  bubble.textContent = text;
  chatbotConversation.appendChild(bubble);
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
}

async function askQuestion(question) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }

  const data = await response.json();
  return data.answer;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;

  userInput.value = "";
  addSpeechBubble(question, "human");

  try {
    const answer = await askQuestion(question);
    addSpeechBubble(answer, "ai");
  } catch (err) {
    console.error(err);
    addSpeechBubble(
      "Sorry, something went wrong. Please try again.",
      "ai"
    );
  }
});
