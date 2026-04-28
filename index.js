const SUPABASE_URL = "https://tmjpwozdimblailfbiru.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ufZn_VjJtfx9NRov4cSJ_A_OegOF3yT";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

setTimeout(() => {
  const intro = document.getElementById("intro");
  const form = document.getElementById("formContainer");

  // swipe intro væk
  intro.classList.add("intro-swipe-out");

  setTimeout(() => {
    intro.style.display = "none";

    // vis form + swipe ind
    form.classList.remove("hidden");
    form.classList.add("form-swipe-in");
  }, 700);
}, 3000);

document.getElementById("wantsInstructor").addEventListener("change", (e) => {
  document.getElementById("instructorFields").classList.toggle("hidden", !e.target.checked);
});

document.getElementById("wantsTeam").addEventListener("change", (e) => {
  document.getElementById("teamFields").classList.toggle("hidden", !e.target.checked);
});

function launchConfetti(amount = 100) {
  const container = document.querySelector(".confetti");

  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");

    // position
    piece.style.left = Math.random() * 100 + "vw";

    // VIF farver (lidt flere nu)
    const colors = ["#ffffff", "#003c82", "#5aa9ff", "#7cc0ff"];
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];

    // størrelse variation
    piece.style.width = Math.random() * 6 + 6 + "px";
    piece.style.height = Math.random() * 12 + 10 + "px";

    // speed variation
    piece.style.animationDuration = Math.random() * 2 + 2 + "s";

    // lidt random drift (giver liv)
    piece.style.transform = `translateX(${Math.random() * 40 - 20}px)`;

    container.appendChild(piece);

    setTimeout(() => piece.remove(), 4500);
  }
}

const vifForm = document.getElementById("vifForm");
const formContainer = document.getElementById("formContainer");
const thankYouScreen = document.getElementById("thankYouScreen");

const submitBtn = document.getElementById("submitBtn");

vifForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.classList.add("is-loading");
  submitBtn.disabled = true;

  const formData = new FormData(vifForm);

  const submission = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birthdate: formData.get("birthdate") || null,
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
    submitBtn.classList.remove("is-loading");
    submitBtn.disabled = false;
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
