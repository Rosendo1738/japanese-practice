const params = new URLSearchParams(window.location.search);
const lessonName = params.get("lesson");

// Debug toggle
let debugEnabled = false;

fetch(`../data/${lessonName}.json`)
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("lesson-title").textContent = data.title;
    document.getElementById("lesson-instructions").textContent =
      data.instructions;
    renderQuestions(data.questions);
  });

function renderQuestions(questions) {
  const container = document.getElementById("questions");
  container.innerHTML = "";

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "Debug: OFF";
  toggleBtn.style.marginBottom = "15px";

  toggleBtn.onclick = () => {
    debugEnabled = !debugEnabled;
    toggleBtn.textContent = debugEnabled ? "Debug: ON" : "Debug: OFF";
    document.querySelectorAll(".debug").forEach((el) => {
      el.style.display = debugEnabled ? "block" : "none";
    });
  };

  container.appendChild(toggleBtn);

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";

    div.innerHTML = `
      <p><strong>Q${index + 1} (English):</strong> ${q.english}</p>
      <input type="text" id="answer-${index}" placeholder="Type Japanese here">
      <button onclick="checkAnswer(${index})">Check</button>
      <p id="result-${index}" class="result"></p>
      <pre id="debug-${index}" class="debug" style="display:none;"></pre>
    `;

    container.appendChild(div);
  });

  window.lessonQuestions = questions;
}

/* ---------- NORMALIZATION ---------- */

function normalize(text) {
  return text.replace(/\s+/g, "");
}

function toKanaOnly(text) {
  return text
    .replace(/\s+/g, "")
    .replace(/[\u4e00-\u9faf]/g, "") // remove kanji
    .replace(/[\u30a1-\u30f6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60),
    );
}

function collapseKana(text) {
  return text.replace(/(.)\1+/g, "$1");
}

// ✅ SUBSEQUENCE CHECK (THE KEY FIX)
function isSubsequence(needle, haystack) {
  let i = 0;
  for (const char of haystack) {
    if (char === needle[i]) i++;
    if (i === needle.length) return true;
  }
  return false;
}

/* ---------- ANSWER CHECK ---------- */

function checkAnswer(index) {
  const userRaw = document.getElementById(`answer-${index}`).value;
  const userPlain = normalize(userRaw);

  const answers = window.lessonQuestions[index].answers;

  const isCorrect = answers.some((ans) => {
    const canonical = normalize(ans.text);

    // 1️⃣ Exact kanji/kana match
    if (userPlain === canonical) return true;

    // 2️⃣ Kana subsequence fallback
    const userKana = collapseKana(toKanaOnly(userRaw));
    const correctKana = collapseKana(toKanaOnly(ans.reading));

    return userKana.length > 0 && isSubsequence(userKana, correctKana);
  });

  const result = document.getElementById(`result-${index}`);
  const debug = document.getElementById(`debug-${index}`);

  result.textContent = isCorrect
    ? "✅ Correct!"
    : "❌ Example answer: " + answers[0].text;

  result.style.color = isCorrect ? "green" : "red";

  debug.textContent = `[DEBUG]
User raw input:
${userRaw}

Canonical answer (kanji):
${answers[0].text}

Canonical reading:
${answers[0].reading}

User kana (normalized):
${collapseKana(toKanaOnly(userRaw))}

Correct kana (normalized):
${collapseKana(toKanaOnly(answers[0].reading))}`;
}
