import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById("square");
const scoreDisplay = document.getElementById("scoreDisplay");

let score = 0;
let questions = [];

// User check


// Score from localStorage
let scores = JSON.parse(localStorage.getItem("scores")||"{}");
score = scores[window.userName] || 0;
scoreDisplay.textContent = "Score: " + score;

// Load questions from Firebase or LocalStorage
async function loadQuestions() {
  try {
    const querySnapshot = await getDocs(collection(db, "questions"));
    querySnapshot.forEach(doc => questions.push(doc.data()));
  } catch(e) {
    console.warn("Firebase error, loading locally", e);
    questions = JSON.parse(localStorage.getItem("questions") || "[]");
  }

  if (questions.length === 0) {
    container.innerHTML = "<p>No questions yet.</p>";
    return;
  }

  questions.forEach((q,index)=> displayQuestion(q,index));
}

function displayQuestion(q,index){
  const card = document.createElement("section");
  card.className="card";

  const p = document.createElement("p");
  p.className="question";
  p.textContent=q.text;
  card.appendChild(p);

  const form = document.createElement("form");
  form.autocomplete="off";

  const choicesDiv=document.createElement("div");
  choicesDiv.className="choices";

  q.options.forEach((opt,i)=>{
    const label=document.createElement("label");
    label.className="choice";
    const input=document.createElement("input");
    input.type="radio";
    input.name="q"+index;
    input.value=i;
    const span=document.createElement("span");
    span.textContent=opt;
    label.appendChild(input);
    label.appendChild(span);
    choicesDiv.appendChild(label);
  });

  const btn=document.createElement("button");
  btn.type="button";
  btn.className="btn black";
  btn.textContent="Submit";

  const result=document.createElement("div");
  result.className="result";

  btn.addEventListener("click",()=>{
    const ans=form.querySelector("input:checked");
    if(!ans){
      result.textContent="Choose an answer!";
      result.className="result wrong";
      return;
    }
    btn.disabled=true;

    if(Number(ans.value)===q.correct){
      result.textContent="Correct!";
      result.className="result correct";
      updateScore(5);
    } else {
      result.textContent="Wrong! Correct " + q.options[q.correct];
      result.className="result wrong";
      updateScore(-5);
    }
  });

  form.appendChild(choicesDiv);
  form.appendChild(btn);
  card.appendChild(form);
  card.appendChild(result);
  container.appendChild(card);
}

function updateScore(delta){
  score+=delta;
  scores[window.userName]=score;
  localStorage.setItem("scores",JSON.stringify(scores));
  scoreDisplay.textContent="Score: "+score;
}

loadQuestions();
