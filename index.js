const SUPABASE_URL = "https://tmjpwozdimblailfbiru.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ufZn_VjJtfx9NRov4cSJ_A_OegOF3yT";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const birthInput = document.querySelector('input[name="birthdate"]');
const vifForm = document.getElementById("vifForm");
const formContainer = document.getElementById("formContainer");
const thankYouScreen = document.getElementById("thankYouScreen");
const submitBtn = document.getElementById("submitBtn");

const wantsInstructor = document.getElementById("wantsInstructor");
const instructorFields = document.getElementById("instructorFields");

const wantsTeam = document.getElementById("wantsTeam");
const teamFields = document.getElementById("teamFields");

birthInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");

  if (value.length > 8) value = value.slice(0, 8);

  let formatted = "";

  if (value.length > 0) formatted = value.substring(0, 2);
  if (value.length >= 3) formatted += "/" + value.substring(2, 4);
  if (value.length >= 5) formatted += "/" + value.substring(4, 8);

  e.target.value = formatted;
});

function isValidDate(dateStr) {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return false;

  const [day, month, year] = parts.map(Number);

  if (!day || !month || !year) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function toISODate(dateStr) {
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month}-${day}`;
}

function setRequiredFields(container, isRequired) {
  const fields = container.querySelectorAll("input, select, textarea");

  fields.forEach((field) => {
    // Checkbox chips validerer vi selv, ellers får browseren focus-fejl
    if (field.type === "checkbox") return;

    // Idé til nyt hold skal ikke være required
    if (field.name === "idea") return;

    if (isRequired) {
      field.setAttribute("required", "");
    } else {
      field.removeAttribute("required");
    }
  });
}

function hasChecked(name) {
  return document.querySelectorAll(`input[name="${name}"]:checked`).length > 0;
}

function stopLoading() {
  submitBtn.classList.remove("is-loading");
  submitBtn.disabled = false;
}

setTimeout(() => {
  const intro = document.getElementById("intro");
  const form = document.getElementById("formContainer");

  intro.classList.add("intro-swipe-out");

  setTimeout(() => {
    intro.style.display = "none";
    form.classList.remove("hidden");
    form.classList.add("form-swipe-in");
  }, 700);
}, 3000);

wantsInstructor.addEventListener("change", (e) => {
  const checked = e.target.checked;

  instructorFields.classList.toggle("hidden", !checked);
  setRequiredFields(instructorFields, checked);
});

wantsTeam.addEventListener("change", (e) => {
  const checked = e.target.checked;

  teamFields.classList.toggle("hidden", !checked);
  setRequiredFields(teamFields, checked);
});

function launchConfetti(amount = 100) {
  const container = document.querySelector(".confetti");

  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");

    piece.style.left = Math.random() * 100 + "vw";

    const colors = ["#ffffff", "#003c82", "#5aa9ff", "#7cc0ff"];
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];

    piece.style.width = Math.random() * 6 + 6 + "px";
    piece.style.height = Math.random() * 12 + 10 + "px";
    piece.style.animationDuration = Math.random() * 2 + 2 + "s";
    piece.style.transform = `translateX(${Math.random() * 40 - 20}px)`;

    container.appendChild(piece);

    setTimeout(() => piece.remove(), 4500);
  }
}

vifForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.classList.add("is-loading");
  submitBtn.disabled = true;

  const formData = new FormData(vifForm);
  const birthdate = formData.get("birthdate");

  const hasChosenInterest = formData.get("wants_instructor_info") === "on" || formData.get("wants_team") === "on";

  if (!hasChosenInterest) {
    alert("Vælg enten instruktør-interesse eller hold-interesse.");
    stopLoading();
    return;
  }

  if (wantsInstructor.checked && !hasChecked("focus")) {
    alert("Vælg mindst ét fokusområde.");
    stopLoading();
    return;
  }

  if (wantsTeam.checked && !hasChecked("team")) {
    alert("Vælg mindst ét hold.");
    stopLoading();
    return;
  }

  if (birthdate && !isValidDate(birthdate)) {
    alert("Indtast en gyldig fødselsdato i formatet dd/mm/åååå");
    stopLoading();
    return;
  }

  const submission = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birthdate: birthdate ? toISODate(birthdate) : null,
    school: formData.get("school"),

    wants_instructor: formData.get("wants_instructor_info") === "on",
    august_city: formData.get("august_city"),
    club: formData.get("club"),
    assistant: formData.get("assistant"),
    instructor: formData.get("instructor"),
    focus: formData.getAll("focus"),
    boys_team: formData.get("boys_team"),

    wants_team: formData.get("wants_team") === "on",
    team: formData.getAll("team"),
    idea: formData.get("idea"),
  };

  const { error } = await supabaseClient.from("submissions").insert([submission]);

  if (error) {
    console.error(error);
    alert("Noget gik galt. Prøv igen.");
    stopLoading();
    return;
  }

  setTimeout(() => {
    formContainer.classList.add("swipe-out");

    setTimeout(() => {
      formContainer.classList.add("hidden");

      thankYouScreen.classList.remove("hidden");
      thankYouScreen.classList.add("swipe-in");

      setTimeout(() => launchConfetti(90), 400);
      setTimeout(() => launchConfetti(70), 900);
      setTimeout(() => launchConfetti(50), 1400);
    }, 450);
  }, 600);
});
