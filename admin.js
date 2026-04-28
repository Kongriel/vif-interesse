const SUPABASE_URL = "https://tmjpwozdimblailfbiru.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ufZn_VjJtfx9NRov4cSJ_A_OegOF3yT";
const ADMIN_PASSWORD = "vifadmin";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginScreen = document.getElementById("loginScreen");
const adminDashboard = document.getElementById("adminDashboard");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

const submissionsTable = document.getElementById("submissionsTable");
const detailsPanel = document.getElementById("detailsPanel");
const submissionCount = document.getElementById("submissionCount");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const downloadCsvBtn = document.getElementById("downloadCsvBtn");
const logoutBtn = document.getElementById("logoutBtn");

let submissions = [];
let filteredSubmissions = [];
let selectedId = null;

loginBtn.addEventListener("click", handleLogin);

passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("vif_admin_logged_in");
  location.reload();
});

searchInput.addEventListener("input", renderSubmissions);
filterSelect.addEventListener("change", renderSubmissions);
downloadCsvBtn.addEventListener("click", downloadCsv);

if (sessionStorage.getItem("vif_admin_logged_in") === "true") {
  showDashboard();
}

function handleLogin() {
  if (passwordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem("vif_admin_logged_in", "true");
    showDashboard();
  } else {
    loginError.textContent = "Forkert adgangskode";
  }
}

async function showDashboard() {
  loginScreen.classList.add("hidden");
  adminDashboard.classList.remove("hidden");
  await fetchSubmissions();
}

async function fetchSubmissions() {
  const { data, error } = await supabaseClient.from("submissions").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    detailsPanel.innerHTML = `<p class="empty-state">Kunne ikke hente data.</p>`;
    return;
  }

  submissions = data || [];
  renderSubmissions();
}

function renderSubmissions() {
  const search = searchInput.value.toLowerCase().trim();
  const filter = filterSelect.value;

  filteredSubmissions = submissions.filter((item) => {
    const matchesSearch = item.full_name?.toLowerCase().includes(search) || item.email?.toLowerCase().includes(search) || item.phone?.toLowerCase().includes(search) || item.school?.toLowerCase().includes(search);

    const matchesFilter = filter === "all" || (filter === "instructor" && item.wants_instructor) || (filter === "team" && item.wants_team);

    return matchesSearch && matchesFilter;
  });

  submissionCount.textContent = `${filteredSubmissions.length} besvarelse${filteredSubmissions.length === 1 ? "" : "r"}`;

  submissionsTable.innerHTML = "";

  filteredSubmissions.forEach((item) => {
    const row = document.createElement("tr");

    if (item.id === selectedId) row.classList.add("active");

    row.innerHTML = `
      <td>${escapeHtml(item.full_name || "-")}</td>
      <td>${escapeHtml(item.email || "-")}</td>
      <td>${escapeHtml(item.phone || "-")}</td>
      <td>${escapeHtml(item.school || "-")}</td>

    `;

    row.addEventListener("click", () => {
      selectedId = item.id;
      renderSubmissions();
      renderDetails(item);
    });

    submissionsTable.appendChild(row);
  });
}

function renderDetails(item) {
  detailsPanel.innerHTML = `
    <h2>${escapeHtml(item.full_name || "Uden navn")}</h2>
    

    <div class="detail-group">
      <h3>Personlige oplysninger</h3>
      ${detailRow("Mail", item.email)}
      ${detailRow("Telefon", item.phone)}
      ${detailRow("Fødselsdato", formatDate(item.birthdate))}
      ${detailRow("Efterskole", item.school)}
    </div>

    <div class="detail-group">
      <h3>Instruktør</h3>
      ${detailRow("Interesse", item.wants_instructor ? "Ja" : "Nej")}
      ${detailRow("Bor fra august", item.august_city)}
      ${detailRow("Forening", item.club)}
      ${detailRow("Har været Hjælpetræner", item.assistant)}
      ${detailRow("Har været Instruktør", item.instructor)}
      ${detailTags("Fokus", item.focus)}
      ${detailRow("Drengehold", item.boys_team)}
    </div>

    <div class="detail-group">
      <h3>Hold</h3>
      ${detailRow("Interesse", item.wants_team ? "Ja" : "Nej")}
      ${detailTags("Hold", item.team)}
      ${detailRow("Idé", item.idea)}
    </div>
  `;
}

function detailRow(label, value) {
  return `
    <div class="detail-row">
      <span>${escapeHtml(label)}</span>
      <span>${escapeHtml(value || "-")}</span>
    </div>
  `;
}

function detailTags(label, values) {
  const tags = Array.isArray(values) && values.length ? values.map((v) => `<span class="tag">${escapeHtml(v)}</span>`).join("") : `<span class="tag">-</span>`;

  return `
    <div class="detail-row">
      <span>${escapeHtml(label)}</span>
      <div class="tag-list">${tags}</div>
    </div>
  `;
}

function badge(value) {
  return value ? `<span class="badge yes">Ja</span>` : `<span class="badge no">Nej</span>`;
}

function formatDate(dateString) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function downloadCsv() {
  const rows = filteredSubmissions.length ? filteredSubmissions : submissions;

  const headers = ["Navn", "Mail", "Telefon", "Fødselsdato", "Efterskole", "Instruktør interesse", "Bor fra august", "Forening", "Har været Hjælpetræner", "Har været Instruktør", "Fokus", "Drengehold", "Hold interesse", "Hold", "Idé", "Dato"];

  const csvRows = [headers.join(";"), ...rows.map((item) => [item.full_name, item.email, item.phone, item.birthdate, item.school, item.wants_instructor ? "Ja" : "Nej", item.august_city, item.club, item.assistant, item.instructor, arrayToText(item.focus), item.boys_team, item.wants_team ? "Ja" : "Nej", arrayToText(item.team), item.idea, formatDate(item.created_at)].map(csvValue).join(";"))];

  const blob = new Blob([csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "vif-besvarelser.csv";
  link.click();

  URL.revokeObjectURL(url);
}

function arrayToText(value) {
  return Array.isArray(value) ? value.join(", ") : value || "";
}

function csvValue(value) {
  const text = String(value || "").replaceAll('"', '""');
  return `"${text}"`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
