const params = new URLSearchParams(window.location.search);
const exerciseName = params.get("exercise");

let progress = [];

/* ---------- STORAGE ---------- */

function loadAllProgress() {
  return JSON.parse(localStorage.getItem("progress") || "{}");
}

function saveProgress(exerciseName, correct, total) {
  const data = loadAllProgress();
  data[exerciseName] = { correct, total };
  localStorage.setItem("progress", JSON.stringify(data));
}

/* ---------- LOAD ---------- */

fetch(`../data/${exerciseName}.json`)
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("exercise-title").textContent = data.title;
    document.getElementById("exercise-instructions").textContent =
      data.instructions;

    progress = new Array(data.questions.length).fill(false);

    renderProgress();
    renderWordBank(data.wordBank || []);
    renderQuestions(data.questions);
  });

/* ---------- RENDER ---------- */

function renderProgress() {
  const el = document.getElementById("progress");
  const correct = progress.filter(Boolean).length;
  el.textContent = `Progress: ${correct} / ${progress.length}`;
}

function renderWordBank(words) {
  if (!words.length) return;

  const container = document.createElement("div");
  container.className = "question";

  container.innerHTML = `
    <p><strong>Word Bank</strong></p>
    <button onclick="toggleWordBank()">Show word bank</button>
    <div id="word-bank" style="display:none; margin-top:8px;">
      <ul>
        ${words.map((w) => `<li>${w.en} — ${w.jp}</li>`).join("")}
      </ul>
    </div>
  `;

  document.getElementById("questions").before(container);
}

function toggleWordBank() {
  const el = document.getElementById("word-bank");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function renderQuestions(questions) {
  const container = document.getElementById("questions");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";

    div.innerHTML = `
      <p><strong>Prompt:</strong> ${q.prompt}</p>
      <input type="text" id="answer-${index}" />

      <div>
        <button onclick="checkAnswer(${index})">Check</button>
        <button onclick="toggleAnswers(${index})" id="toggle-btn-${index}">
          Show answers
        </button>
      </div>

      <p id="result-${index}"></p>
      <div id="answers-${index}" style="display:none;"></div>
    `;

    container.appendChild(div);
  });

  window.exerciseQuestions = questions;
}

/* ---------- CHECK ---------- */

function normalize(text) {
  return text.replace(/\s+/g, "");
}

function checkAnswer(index) {
  const userInput = normalize(document.getElementById(`answer-${index}`).value);

  const answers = window.exerciseQuestions[index].answers;
  const result = document.getElementById(`result-${index}`);

  const correct = answers.some((ans) => normalize(ans) === userInput);

  if (correct) {
    result.textContent = "✅ Correct!";
    result.style.color = "green";
    progress[index] = true;
    renderProgress();
    saveProgress(
      exerciseName,
      progress.filter(Boolean).length,
      progress.length,
    );
  } else {
    result.textContent = "❌ Incorrect";
    result.style.color = "red";
  }
}

/* ---------- ANSWERS ---------- */

function toggleAnswers(index) {
  const container = document.getElementById(`answers-${index}`);
  const button = document.getElementById(`toggle-btn-${index}`);
  const answers = window.exerciseQuestions[index].answers;

  const visible = container.style.display === "block";

  if (visible) {
    container.style.display = "none";
    button.textContent = "Show answers";
  } else {
    container.style.display = "block";
    button.textContent = "Hide answers";
    container.innerHTML = `
      <ul>
        ${answers.map((a) => `<li>${a}</li>`).join("")}
      </ul>
    `;
  }
}
