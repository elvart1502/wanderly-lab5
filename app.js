const places = {
  madeira: { name: "Madeira", country: "Portugal", image: "coast.jpg", alt: "Volcanic cliffs above the Atlantic", summary: "Atlantic cliffs, forest walks, and slow afternoons in Funchal.", itinerary: "Start with Funchal’s old town, spend a day at the natural pools in Porto Moniz, and pick a levada walk that suits your pace.", cost: "Compare bus routes with car-rental costs, and save room in your budget for a guided walk if you want one." },
  kyoto: { name: "Kyoto", country: "Japan", image: "kyoto.jpg", alt: "Historic Japanese buildings", summary: "Temple gardens, quiet lanes, and a morning worth getting up early for.", itinerary: "Explore Higashiyama early, spend an afternoon by the river, and set aside a morning for Fushimi Inari.", cost: "Look for lodging near a train station and prioritize a few paid gardens or tea experiences." },
  marrakech: { name: "Marrakech", country: "Morocco", image: "marrakech.jpg", alt: "Warm-toned Moroccan architecture", summary: "Bustling souks, courtyard riads, and long lunches in the medina.", itinerary: "Spend a morning in the souks, visit Bahia Palace, and finish a day with dinner near Jemaa el-Fnaa.", cost: "Compare riads with breakfast included and set a daily budget for markets and meals." }
};

const cards = document.querySelector("#destinations");
if (cards) {
  for (const [key, place] of Object.entries(places)) {
    const card = document.createElement("article");
    card.className = "card";
    card.id = key;
    card.innerHTML = `<img src="${place.image}" alt="${place.alt}" loading="lazy"><div><p class="eyebrow">${place.country.toUpperCase()}</p><h3>${place.name}</h3><p>${place.summary}</p></div>`;
    cards.append(card);
  }
}

const video = document.querySelector("video");
if (video) {
  const motion = document.querySelector("#motion");
  const syncMotion = () => { motion.textContent = video.paused ? "Play video" : "Pause video"; };
  video.addEventListener("play", syncMotion);
  video.addEventListener("pause", syncMotion);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.autoplay = false;
    video.pause();
  }
  syncMotion();
  motion.addEventListener("click", () => {
    if (video.paused) video.play().catch(syncMotion);
    else video.pause();
  });
}

const quiz = document.querySelector("#quiz");
if (quiz) {
  const result = document.querySelector("#result");
  quiz.addEventListener("submit", event => {
    event.preventDefault();
    const answers = new FormData(quiz);
    const activity = answers.get("activity");
    const duration = answers.get("duration");
    const budget = answers.get("budget");
    const match = duration === budget ? budget : activity;
    const place = places[match];
    const reason = duration === budget && activity !== match
      ? "Your preferred trip length and spending style tipped the match."
      : "Your favorite activity led the match.";
    result.innerHTML = `<img class="result-image" src="${place.image}" alt="${place.alt}"><p class="eyebrow">YOUR MATCH · ${place.country.toUpperCase()}</p><h2>${place.name}</h2><p>${place.summary} ${reason}</p><p>${place.itinerary}</p><div class="result-actions"><a class="pill" href="index.html#${match}">View destination ↗</a><button type="button">Retake quiz</button></div>`;
    quiz.hidden = true;
    result.hidden = false;
    result.focus();
    result.querySelector("button").addEventListener("click", () => {
      result.hidden = true;
      quiz.reset();
      quiz.hidden = false;
      quiz.querySelector("input").focus();
    });
  });
}

const chat = document.createElement("aside");
chat.className = "chat";
chat.setAttribute("aria-label", "Wanderly chatbot");
chat.innerHTML = `<div class="chat-box" id="chat-box" hidden><div class="chat-head">Wanderly travel guide</div><div class="chat-log" role="log" aria-label="Conversation"><p>Hi! Ask me about Madeira, Kyoto, Marrakech, or the destination quiz.</p></div><div class="chat-prompts"><button type="button">Madeira itinerary</button><button type="button">Kyoto budget</button><button type="button">How does the quiz work?</button></div><form><input aria-label="Your message" placeholder="Ask a travel question…" required maxlength="250"><button type="submit">Send</button></form></div><button class="chat-toggle" type="button" aria-expanded="false" aria-controls="chat-box">✳ Travel chat</button>`;
document.body.append(chat);
const toggle = chat.querySelector(".chat-toggle");
const box = chat.querySelector(".chat-box");
const log = chat.querySelector(".chat-log");
const input = chat.querySelector("input");
let lastPlace;

function answer(message) {
  const text = message.toLowerCase();
  if (/\b(quiz|test|retake)\b/.test(text)) return "Open Destination quiz in the navigation. Choose your favorite activity, trip length, and spending style, then select Reveal my match. You can retake it anytime.";
  const found = Object.keys(places).find(key => text.includes(key));
  if (found) lastPlace = places[found];
  const budgetQuestion = /\b(budget|price|cost|spend|cheap|affordable)\b/.test(text);
  const activityQuestion = /\b(itinerary|visit|see|do|activities|plan)\b/.test(text);
  if (lastPlace && budgetQuestion) return lastPlace.cost;
  if (lastPlace && activityQuestion) return lastPlace.itinerary;
  if (found) return `${lastPlace.summary} ${lastPlace.itinerary}`;
  if (/\b(hike|hiking|nature|coast|beach)\b/.test(text)) return `Try Madeira. ${places.madeira.itinerary}`;
  if (/\b(temple|temples|garden|gardens)\b/.test(text)) return `Try Kyoto. ${places.kyoto.itinerary}`;
  if (/\b(food|market|markets|souk|souks)\b/.test(text)) return `Try Marrakech. ${places.marrakech.itinerary}`;
  if (budgetQuestion) return "For a trip focused on markets and keeping day-to-day spending low, start with Marrakech. Compare flights and lodging for your dates before choosing.";
  return "I can help with itineraries and budget tips for Madeira, Kyoto, and Marrakech. Try “What should I do in Kyoto?” or tell me what you enjoy doing on vacation.";
}

function send(message) {
  if (!message.trim()) return;
  const question = document.createElement("p");
  question.className = "you";
  question.textContent = `You: ${message.trim()}`;
  const reply = document.createElement("p");
  reply.textContent = answer(message);
  log.append(question, reply);
  log.scrollTop = log.scrollHeight;
}

function setChat(open) {
  box.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? "Close chat ×" : "✳ Travel chat";
  (open ? input : toggle).focus();
}
toggle.addEventListener("click", () => setChat(box.hidden));
chat.addEventListener("keydown", event => { if (event.key === "Escape" && !box.hidden) setChat(false); });
chat.querySelector("form").addEventListener("submit", event => {
  event.preventDefault();
  send(input.value);
  input.value = "";
  input.focus();
});
for (const prompt of chat.querySelectorAll(".chat-prompts button")) {
  prompt.addEventListener("click", () => send(prompt.textContent));
}
