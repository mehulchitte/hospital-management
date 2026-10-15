const form = document.querySelector("#patientForm");
const rows = document.querySelector("#patientRows");
const recentRows = document.querySelector("#recentRows");
const searchInput = document.querySelector("#searchInput");
const toast = document.querySelector("#toast");
let editingId = null;
let toastTimer;
const pageInfo = {
  home: ["Home Dashboard", "A simple place to manage patient information."],
  registration: ["Patient Registration", "Add a new patient or update an existing record."],
  records: ["Patient Records", "View, search, edit and manage saved patient details."],
  about: ["About Project", "Learn about the project and the technologies used."]
};
function showPage(page) {
  if (!pageInfo[page]) page = "home";
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active-page"));
  document.querySelector(`#page-${page}`).classList.add("active-page");
  document.querySelectorAll(".nav[data-page]").forEach(el => el.classList.toggle("active", el.dataset.page === page));
  document.querySelector("#pageTitle").textContent = pageInfo[page][0];
  document.querySelector("#pageSubtitle").textContent = pageInfo[page][1];
  if (page === "records") loadPatients(searchInput.value.trim());
  if (page === "home") loadPatients("");
  window.location.hash = page;
  window.scrollTo({top: 0, behavior: "smooth"});
}
document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); showPage(el.dataset.page); }));
document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => showPage(el.dataset.go)));
window.addEventListener("hashchange", () => showPage(location.hash.slice(1) || "home"));
function showToast(message, error = false) {
  toast.textContent = message;
  toast.className = `toast show${error ? " error" : ""}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.className = "toast", 3000);
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[ch]);
}
function patientId(id) { return `PT-${String(id).padStart(4, "0")}`; }
function getPayload() {
  return {
    fullName: document.querySelector("#fullName").value.trim(),
    age: document.querySelector("#age").value,
    gender: document.querySelector("#gender").value,
    phone: document.querySelector("#phone").value.trim(),
    address: document.querySelector("#address").value.trim(),
    bloodGroup: document.querySelector("#bloodGroup").value,
    symptoms: document.querySelector("#symptoms").value.trim()
  };
}
async function api(url, options = {}) {
  const response = await fetch(url, {...options, headers: {"Content-Type":"application/json", ...(options.headers || {})}});
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || "Request failed. Please try again.");
  return data;
}
function recentTable(patients) {
  if (!recentRows) return;
  const latest = [...patients].slice(-5).reverse();
  if (!latest.length) {
    recentRows.innerHTML = '<tr><td colspan="5" class="empty">No records yet. Register your first patient.</td></tr>';
    return;
  }
  recentRows.innerHTML = latest.map(p => `<tr><td><div class="patient-name">${escapeHtml(p.fullName)}</div><div class="patient-sub">${escapeHtml(p.symptoms)}</div></td><td><span class="id-tag">${patientId(p.id)}</span></td><td>${escapeHtml(p.age)} / ${escapeHtml(p.gender)}</td><td>${escapeHtml(p.phone)}</td><td><span class="blood-tag">${escapeHtml(p.bloodGroup)}</span></td></tr>`).join("");
}
async function loadPatients(query = "") {
  try {
    const patients = await api(`/api/patients?q=${encodeURIComponent(query)}`);
    document.querySelector("#totalCount").textContent = patients.length;
    document.querySelector("#tableCount").textContent = patients.length;
    document.querySelector("#resultText").textContent = `Showing ${patients.length} record${patients.length === 1 ? "" : "s"}`;
    recentTable(patients);
    if (!patients.length) {
      rows.innerHTML = '<tr><td colspan="7" class="empty">No patient records found. Register a patient to get started.</td></tr>';
      return;
    }
    rows.innerHTML = patients.map(p => `<tr><td><div class="patient-name">${escapeHtml(p.fullName)}</div><div class="patient-sub">${escapeHtml(p.symptoms)}</div></td><td><span class="id-tag">${patientId(p.id)}</span></td><td>${escapeHtml(p.age)} / ${escapeHtml(p.gender)}</td><td>${escapeHtml(p.phone)}</td><td><span class="blood-tag">${escapeHtml(p.bloodGroup)}</span></td><td>${escapeHtml(p.registeredAt || "—")}</td><td><div class="action-buttons"><button class="action-btn edit" data-edit="${p.id}">Edit</button><button class="action-btn delete" data-delete="${p.id}">Delete</button></div></td></tr>`).join("");
  } catch (err) {
    rows.innerHTML = '<tr><td colspan="7" class="empty">Could not load records. Check Vercel environment variables and Supabase setup.</td></tr>';
    if (recentRows) recentRows.innerHTML = '<tr><td colspan="5" class="empty">Check Vercel environment variables and Supabase setup.</td></tr>';
    showToast(err.message, true);
  }
}
function clearForm() {
  form.reset(); editingId = null;
  document.querySelector("#formTitle").textContent = "Register a new patient";
  document.querySelector("#submitBtn").textContent = "＋ Register patient";
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const payload = getPayload();
  try {
    const result = await api(editingId ? `/api/patients/${editingId}` : "/api/patients", {method: editingId ? "PUT" : "POST", body: JSON.stringify(payload)});
    showToast(editingId ? "Patient details updated successfully." : `Patient registered! ID: ${patientId(result.id)}`);
    clearForm(); await loadPatients(""); showPage("records");
  } catch (err) { showToast(err.message, true); }
});
document.querySelector("#clearBtn").addEventListener("click", clearForm);
document.querySelector("#searchBtn").addEventListener("click", () => loadPatients(searchInput.value.trim()));
document.querySelector("#resetSearchBtn").addEventListener("click", () => { searchInput.value = ""; loadPatients(""); });
searchInput.addEventListener("input", () => { if (!searchInput.value.trim()) loadPatients(""); });
searchInput.addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); loadPatients(searchInput.value.trim()); }});
rows.addEventListener("click", async event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) {
    try {
      const id = Number(editButton.dataset.edit);
      const patients = await api(`/api/patients?q=${encodeURIComponent(id)}`);
      const p = patients.find(item => item.id === id);
      if (!p) throw new Error("Patient record not found.");
      editingId = p.id;
      for (const key of ["fullName","age","gender","phone","address","bloodGroup","symptoms"]) document.querySelector(`#${key}`).value = p[key] ?? "";
      document.querySelector("#formTitle").textContent = `Edit patient ${patientId(p.id)}`;
      document.querySelector("#submitBtn").textContent = "Save changes";
      showPage("registration");
    } catch (err) { showToast(err.message, true); }
  }
  if (deleteButton) {
    const id = Number(deleteButton.dataset.delete);
    if (!confirm(`Delete patient ${patientId(id)}? This cannot be undone.`)) return;
    try {
      await api(`/api/patients/${id}`, {method:"DELETE"});
      showToast("Patient record deleted."); await loadPatients(searchInput.value.trim());
      if (editingId === id) clearForm();
    } catch (err) { showToast(err.message, true); }
  }
});
showPage(location.hash.slice(1) || "home");
