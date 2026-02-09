const params = new URLSearchParams(window.location.search);
const lessonName = params.get("lesson");

fetch(`../data/${lessonName}.json`)
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("lesson-title").textContent = data.title;
    document.getElementById("lesson-instructions").textContent =
      data.instructions;
    renderQuestions(data.questions);
  })
  .catch((err) => {
    console.error("Failed to load lesson:", err);
  });

function renderQuestions(questions) {
  const container = document.getElementById("questions");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";

    div.innerHTML = `
      <p><strong>Q${index + 1} (English):</strong> ${q.english}</p>
      <input type="text" id="answer-${index}" placeholder="Type Japanese here">
      <button onclick="checkAnswer(${index})">Check</button>
      <p id="result-${index}" class="result"></p>
      <pre id="debug-${index}" class="debug"></pre>
    `;

    container.appendChild(div);
  });

  window.lessonQuestions = questions;
}

/* ---------- KANA NORMALIZATION ---------- */

// kana only, no spaces, no kanji, katakana → hiragana
function toKanaOnly(text) {
  return text
    .replace(/\s+/g, "")
    .replace(/[\u4e00-\u9faf]/g, "") // strip kanji
    .replace(/[\u30a1-\u30f6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60),
    );
}

// collapse duplicated kana: きき → き
function collapseKana(text) {
  return text.replace(/(.)\1+/g, "$1");
}

/* ---------- ANSWER CHECK ---------- */

function checkAnswer(index) {
  const userRaw = document.getElementById(`answer-${index}`).value;

  const userKana = collapseKana(toKanaOnly(userRaw));
  const answers = window.lessonQuestions[index].answers;

  const isCorrect = answers.some((ans) => {
    const correctKana = collapseKana(toKanaOnly(ans.reading));
    return userKana.length > 0 && correctKana.includes(userKana);
  });

  const result = document.getElementById(`result-${index}`);
  const debug = document.getElementById(`debug-${index}`);

  if (isCorrect) {
    result.textContent = "✅ Correct!";
    result.style.color = "green";
  } else {
    result.textContent = "❌ Example answer: " + answers[0].text;
    result.style.color = "red";
  }

  // DEBUG OUTPUT (now includes kanji answer)
  debug.textContent = `[DEBUG]
User raw input:
${userRaw}

Canonical answer (kanji):
${answers[0].text}

Canonical reading:
${answers[0].reading}

User kana (normalized):
${userKana}

Correct kana (normalized):
${collapseKana(toKanaOnly(answers[0].reading))}`;
}
