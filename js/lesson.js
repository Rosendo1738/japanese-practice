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

  // store for checking
  window.lessonQuestions = questions;
}

/* ---------- NORMALIZATION HELPERS ---------- */

// remove spaces only
function normalize(text) {
  return text.replace(/\s+/g, "");
}

// extract kana only (no kanji), normalize katakana → hiragana
function normalizeKana(text) {
  return (
    text
      .replace(/\s+/g, "")
      // remove kanji
      .replace(/[\u4e00-\u9faf]/g, "")
      // katakana → hiragana
      .replace(/[\u30a1-\u30f6]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0x60),
      )
  );
}

/* ---------- ANSWER CHECK ---------- */

function checkAnswer(index) {
  const userRaw = document.getElementById(`answer-${index}`).value;

  const userPlain = normalize(userRaw);
  const userKana = normalizeKana(userRaw);

  const answers = window.lessonQuestions[index].answers;

  const isCorrect = answers.some((ans) => {
    const correctText = normalize(ans.text);
    const correctKana = normalizeKana(ans.reading);

    return (
      // exact kanji/kana match
      userPlain === correctText ||
      // kana subsequence match (THIS IS THE FIX)
      (userKana.length > 0 && correctKana.includes(userKana))
    );
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

  // DEBUG OUTPUT (for troubleshooting)
  debug.textContent = `[DEBUG]
User raw:        ${userRaw}
User kana:       ${userKana}
Correct kana:    ${normalizeKana(answers[0].reading)}`;
}
