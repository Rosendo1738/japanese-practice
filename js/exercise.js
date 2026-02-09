const params = new URLSearchParams(window.location.search);
const exerciseName = params.get("exercise");

let progress = [];

/* ---------- LOCAL STORAGE HELPERS ---------- */

function loadProgress(exerciseName) {
  const data = JSON.parse(localStorage.getItem("progress") || "{}");
  return data[exerciseName] || null;
}

function saveProgress(exerciseName, correct, total) {
  const data = JSON.parse(localStorage.getItem("progress") || "{}");
  data[exerciseName] = { correct, total };
  localStorage.setItem("progress", JSON.stringify(data));
}

/* ---------- LOAD EXERCISE ---------- */

fetch(`../data/${exerciseName}.json`)
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("exercise-title").textContent = data.title;
    document.getElementById("exercise-instructions").textContent =
      data.instructions;

    progress = new Array(data.questions.length).fill(false);

    const saved = loadProgress(exerciseName);
    if (saved) {
      for (let i = 0; i < saved.correct && i < progress.length; i++) {
        progress[i] = true;
      }
    }

    renderProgress();
    renderQuestions(data.questions);
  })
  .catch((err) => console.error("Failed to load exercise:", err));

/* ---------- RENDER ---------- */

function renderProgress() {
  const el = document.getElementById("progress");
  const correct = progress.filter(Boolean).length;
  const total = progress.length;
  el.textContent = `Progress: ${correct} / ${total} correct`;
}

function renderQuestions(questions) {
  const container = document.getElementById("questions");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";

    div.innerHTML = `
      <p><strong>English:</strong> ${q.english}</p>
      <input type="text" id="answer-${index}" placeholder="Type Japanese here">

      <div style="margin-top:8px;">
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

/* ---------- CHECKING ---------- */

function normalize(text) {
  return text.replace(/\s+/g, "");
}

function checkAnswer(index) {
  const userInput = normalize(document.getElementById(`answer-${index}`).value);

  const answers = window.exerciseQuestions[index].answers;
  const result = document.getElementById(`result-${index}`);

  const isCorrect = answers.some((ans) => userInput === normalize(ans));

  if (isCorrect) {
    result.textContent = "✅ Correct!";
    result.style.color = "green";

    if (!progress[index]) {
      progress[index] = true;
      renderProgress();

      saveProgress(
        exerciseName,
        progress.filter(Boolean).length,
        progress.length,
      );
    }
  } else {
    result.textContent = "❌ Incorrect";
    result.style.color = "red";
  }
}

/* ---------- ANSWER TOGGLE ---------- */

function toggleAnswers(index) {
  const answers = window.exerciseQuestions[index].answers;
  const container = document.getElementById(`answers-${index}`);
  const button = document.getElementById(`toggle-btn-${index}`);

  const isVisible = container.style.display === "block";

  if (isVisible) {
    container.style.display = "none";
    button.textContent = "Show answers";
  } else {
    container.style.display = "block";
    button.textContent = "Hide answers";
    container.innerHTML = `
      <p><strong>Accepted answers:</strong></p>
      <ul>
        ${answers.map((a) => `<li>${a}</li>`).join("")}
      </ul>
    `;
  }
}
