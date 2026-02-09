const params = new URLSearchParams(window.location.search);
const exerciseName = params.get("exercise");

fetch(`../data/${exerciseName}.json`)
  .then((res) => res.json())
  .then((data) => {
    document.getElementById("exercise-title").textContent = data.title;
    document.getElementById("exercise-instructions").textContent =
      data.instructions;
    renderQuestions(data.questions);
  })
  .catch((err) => {
    console.error("Failed to load exercise:", err);
  });

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

function normalize(text) {
  return text.replace(/\s+/g, "");
}

function checkAnswer(index) {
  const userInput = normalize(document.getElementById(`answer-${index}`).value);

  const answers = window.exerciseQuestions[index].answers;

  const isCorrect = answers.some((ans) => userInput === normalize(ans));

  const result = document.getElementById(`result-${index}`);

  if (isCorrect) {
    result.textContent = "✅ Correct!";
    result.style.color = "green";
  } else {
    result.textContent = "❌ Incorrect";
    result.style.color = "red";
  }
}

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
