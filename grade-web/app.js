/* =========================================================
   app.js — Student Grade Tracker Web App
   All logic: CRUD, stats, grading, PDF export
   ========================================================= */

/* ──────────────────────────────────────────
   DATA STORE
   ────────────────────────────────────────── */
let students = [];           // Array of { id, name, score }
let editingId  = null;       // ID of student being edited
let deletingId = null;       // ID of student being deleted

/* ──────────────────────────────────────────
   GRADE CALCULATION
   ────────────────────────────────────────── */
function getGrade(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function gradeCssClass(grade) {
  return 'grade-' + grade.replace('+', 'plus');
}

function gradeBarClass(grade) {
  const map = { 'A+': 'g-aplus', 'A': 'g-a', 'B': 'g-b', 'C': 'g-c', 'D': 'g-d', 'F': 'g-f' };
  return map[grade] || 'g-f';
}

function gradeColor(grade) {
  const map = {
    'A+': '#a78bfa', 'A': '#60a5fa', 'B': '#4ade80',
    'C': '#fbbf24', 'D': '#fb923c', 'F': '#f87171'
  };
  return map[grade] || '#ccc';
}

/* ──────────────────────────────────────────
   STATISTICS
   ────────────────────────────────────────── */
function computeAverage() {
  if (!students.length) return null;
  return students.reduce((s, st) => s + st.score, 0) / students.length;
}

function computeHighest() {
  if (!students.length) return null;
  return Math.max(...students.map(s => s.score));
}

function computeLowest() {
  if (!students.length) return null;
  return Math.min(...students.map(s => s.score));
}

function getByScore(score) {
  return students.filter(s => s.score === score);
}

function gradeCounts() {
  const counts = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  students.forEach(s => { counts[getGrade(s.score)]++; });
  return counts;
}

/* ──────────────────────────────────────────
   NAVIGATION
   ────────────────────────────────────────── */
function showSection(name, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + name).classList.add('active');
  if (btn) btn.classList.add('active');

  // Refresh dynamic sections
  if (name === 'dashboard') refreshDashboard();
  if (name === 'students')  renderTable();
  if (name === 'report')    renderReport();

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

/* ──────────────────────────────────────────
   FEATURE 1 — ADD STUDENT
   ────────────────────────────────────────── */
function addStudent() {
  const idRaw    = document.getElementById('inp-id').value.trim();
  const nameRaw  = document.getElementById('inp-name').value.trim();
  const scoreRaw = document.getElementById('inp-score').value.trim();
  const alertEl  = document.getElementById('add-alert');

  // Validation
  if (!idRaw) {
    showAlert(alertEl, 'error', 'Student ID cannot be empty.');
    return;
  }
  if (students.find(s => s.id.toLowerCase() === idRaw.toLowerCase())) {
    showAlert(alertEl, 'error', `Student ID "${idRaw}" already exists. Use a unique ID.`);
    return;
  }
  if (!nameRaw) {
    showAlert(alertEl, 'error', 'Student name cannot be empty.');
    return;
  }

  const score = parseFloat(scoreRaw);
  if (scoreRaw === '' || isNaN(score)) {
    showAlert(alertEl, 'error', 'Score must be a valid number.');
    return;
  }
  if (score < 0 || score > 100) {
    showAlert(alertEl, 'error', 'Score must be between 0 and 100.');
    return;
  }

  // Add to array
  students.push({ id: idRaw, name: nameRaw, score });

  showAlert(alertEl, 'success',
    `✓ Student "${nameRaw}" (ID: ${idRaw}) added with score ${score.toFixed(2)} — Grade: ${getGrade(score)}`
  );
  clearAddForm(false);
  updateTopbarCount();
  showToast(`✓ ${nameRaw} added successfully!`);
}

function clearAddForm(clearAlert = true) {
  document.getElementById('inp-id').value    = '';
  document.getElementById('inp-name').value  = '';
  document.getElementById('inp-score').value = '';
  if (clearAlert) document.getElementById('add-alert').classList.add('hidden');
}

/* ──────────────────────────────────────────
   FEATURE 2 — VIEW ALL STUDENTS (Table)
   ────────────────────────────────────────── */
function renderTable(filter = '', gradeFilter = '') {
  const tbody = document.getElementById('students-tbody');
  let list = students;

  if (filter) {
    const q = filter.toLowerCase();
    list = list.filter(s => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }
  if (gradeFilter) {
    list = list.filter(s => getGrade(s.score) === gradeFilter);
  }

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">${
      students.length ? 'No students match the filter.' : 'No students added yet.'
    }</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => {
    const g = getGrade(s.score);
    return `
      <tr>
        <td><code style="color:var(--accent-2)">${esc(s.id)}</code></td>
        <td>${esc(s.name)}</td>
        <td><strong>${s.score.toFixed(2)}</strong></td>
        <td><span class="grade-badge ${gradeCssClass(g)}">${g}</span></td>
        <td style="display:flex;gap:0.4rem;flex-wrap:wrap;">
          <button class="btn-icon" title="Edit" onclick="openEditModal('${esc(s.id)}')">✏️ Edit</button>
          <button class="btn-icon" title="Delete" onclick="openDeleteModal('${esc(s.id)}')">🗑️ Delete</button>
        </td>
      </tr>`;
  }).join('');
}

function filterTable() {
  const f = document.getElementById('filter-input').value;
  const g = document.getElementById('filter-grade').value;
  renderTable(f, g);
}

/* ──────────────────────────────────────────
   FEATURE 6 — SUMMARY REPORT
   ────────────────────────────────────────── */
function renderReport() {
  const el = document.getElementById('report-content');
  const actEl = document.getElementById('report-actions');

  if (!students.length) {
    el.innerHTML = '<p class="empty-msg">No students registered yet. Add students to generate a report.</p>';
    actEl.style.display = 'none';
    return;
  }

  const avg     = computeAverage();
  const highest = computeHighest();
  const lowest  = computeLowest();
  const counts  = gradeCounts();
  const topStudents = getByScore(highest).map(s => s.name).join(', ');
  const botStudents = getByScore(lowest).map(s => s.name).join(', ');

  const tableRows = students.map(s => {
    const g = getGrade(s.score);
    return `<tr>
      <td>${esc(s.id)}</td>
      <td>${esc(s.name)}</td>
      <td>${s.score.toFixed(2)}</td>
      <td><span class="grade-badge ${gradeCssClass(g)}">${g}</span></td>
    </tr>`;
  }).join('');

  const gradeRows = Object.entries(counts).map(([g, c]) => `
    <div class="report-stat-row">
      <span class="report-stat-label">Grade ${g}</span>
      <span class="report-stat-value" style="color:${gradeColor(g)}">${c} student(s)</span>
    </div>`).join('');

  el.innerHTML = `
    <div class="report-block">
      <h3>📊 Statistics</h3>
      <div class="report-stat-row">
        <span class="report-stat-label">Total Students</span>
        <span class="report-stat-value">${students.length}</span>
      </div>
      <div class="report-stat-row">
        <span class="report-stat-label">Average Score</span>
        <span class="report-stat-value">${avg.toFixed(2)}</span>
      </div>
      <div class="report-stat-row">
        <span class="report-stat-label">Highest Score</span>
        <span class="report-stat-value">${highest.toFixed(2)} — ${topStudents}</span>
      </div>
      <div class="report-stat-row">
        <span class="report-stat-label">Lowest Score</span>
        <span class="report-stat-value">${lowest.toFixed(2)} — ${botStudents}</span>
      </div>
    </div>

    <div class="report-block">
      <h3>👥 Student List</h3>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Score</th><th>Grade</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>

    <div class="report-block">
      <h3>📈 Grade Distribution</h3>
      ${gradeRows}
    </div>`;

  actEl.style.display = 'flex';
}

/* ──────────────────────────────────────────
   FEATURE 7 — SEARCH
   ────────────────────────────────────────── */
function searchStudent() {
  const id = document.getElementById('search-id').value.trim();
  const resultEl = document.getElementById('search-result');
  const cardEl   = document.getElementById('result-card');

  if (!id) { showToast('Enter a Student ID to search.'); return; }

  const found = students.find(s => s.id.toLowerCase() === id.toLowerCase());
  resultEl.classList.remove('hidden');

  if (!found) {
    cardEl.innerHTML = `<p style="color:var(--red)">❌ No student found with ID: <strong>${esc(id)}</strong></p>`;
    return;
  }

  const g = getGrade(found.score);
  cardEl.innerHTML = `
    <h4 style="margin-bottom:1rem;color:var(--accent-2)">✅ Student Found</h4>
    <div class="report-stat-row">
      <span class="report-stat-label">Student ID</span>
      <span class="report-stat-value">${esc(found.id)}</span>
    </div>
    <div class="report-stat-row">
      <span class="report-stat-label">Name</span>
      <span class="report-stat-value">${esc(found.name)}</span>
    </div>
    <div class="report-stat-row">
      <span class="report-stat-label">Score</span>
      <span class="report-stat-value">${found.score.toFixed(2)}</span>
    </div>
    <div class="report-stat-row">
      <span class="report-stat-label">Grade</span>
      <span class="report-stat-value">
        <span class="grade-badge ${gradeCssClass(g)}">${g}</span>
      </span>
    </div>`;
}

/* ──────────────────────────────────────────
   FEATURE 8 — UPDATE GRADE (Modal)
   ────────────────────────────────────────── */
function openEditModal(id) {
  const s = students.find(st => st.id === id);
  if (!s) return;
  editingId = id;

  document.getElementById('modal-student-info').textContent =
    `${s.name}  (ID: ${s.id})  —  Current score: ${s.score.toFixed(2)}`;
  document.getElementById('modal-score').value = s.score;
  document.getElementById('modal-alert').classList.add('hidden');
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  editingId = null;
}

function saveUpdate() {
  const alertEl = document.getElementById('modal-alert');
  const scoreRaw = document.getElementById('modal-score').value.trim();
  const score = parseFloat(scoreRaw);

  if (scoreRaw === '' || isNaN(score)) {
    showAlert(alertEl, 'error', 'Score must be a valid number.');
    return;
  }
  if (score < 0 || score > 100) {
    showAlert(alertEl, 'error', 'Score must be between 0 and 100.');
    return;
  }

  const s = students.find(st => st.id === editingId);
  if (!s) return;

  s.score = score;
  closeEditModal();
  renderTable(
    document.getElementById('filter-input').value,
    document.getElementById('filter-grade').value
  );
  updateTopbarCount();
  refreshDashboard();
  showToast(`✓ ${s.name}'s score updated to ${score.toFixed(2)} (Grade: ${getGrade(score)})`);
}

/* ──────────────────────────────────────────
   FEATURE 9 — DELETE (Modal)
   ────────────────────────────────────────── */
function openDeleteModal(id) {
  const s = students.find(st => st.id === id);
  if (!s) return;
  deletingId = id;
  document.getElementById('delete-msg').textContent =
    `Are you sure you want to delete "${s.name}" (ID: ${s.id})?`;
  document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
  deletingId = null;
}

function confirmDelete() {
  if (!deletingId) return;
  const idx = students.findIndex(s => s.id === deletingId);
  if (idx === -1) return;
  const name = students[idx].name;
  students.splice(idx, 1);
  closeDeleteModal();
  renderTable(
    document.getElementById('filter-input').value,
    document.getElementById('filter-grade').value
  );
  updateTopbarCount();
  refreshDashboard();
  showToast(`🗑️ ${name} deleted successfully.`);
}

/* ──────────────────────────────────────────
   DASHBOARD REFRESH
   ────────────────────────────────────────── */
function refreshDashboard() {
  const avg     = computeAverage();
  const highest = computeHighest();
  const lowest  = computeLowest();
  const counts  = gradeCounts();
  const total   = students.length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-avg').textContent   = avg     !== null ? avg.toFixed(2)     : '—';
  document.getElementById('stat-high').textContent  = highest !== null ? highest.toFixed(2) : '—';
  document.getElementById('stat-low').textContent   = lowest  !== null ? lowest.toFixed(2)  : '—';

  // Grade bars
  const barsEl = document.getElementById('grade-bars');
  if (!total) {
    barsEl.innerHTML = '<p class="empty-msg">No students yet. Add students to see distribution.</p>';
  } else {
    const gradeList = [
      { label: 'A+', key: 'A+', cls: 'g-aplus' },
      { label: 'A',  key: 'A',  cls: 'g-a' },
      { label: 'B',  key: 'B',  cls: 'g-b' },
      { label: 'C',  key: 'C',  cls: 'g-c' },
      { label: 'D',  key: 'D',  cls: 'g-d' },
      { label: 'F',  key: 'F',  cls: 'g-f' },
    ];
    barsEl.innerHTML = gradeList.map(({ label, key, cls }) => {
      const pct = total ? (counts[key] / total * 100).toFixed(1) : 0;
      return `
        <div class="grade-row">
          <span class="grade-label">${label}</span>
          <div class="bar-track">
            <div class="bar-fill ${cls}" style="width:${pct}%"></div>
          </div>
          <span class="grade-count">${counts[key]} student${counts[key] !== 1 ? 's' : ''}</span>
        </div>`;
    }).join('');
  }

  // Recent students (last 5)
  const recentEl = document.getElementById('recent-list');
  const recent = students.slice(-5).reverse();
  if (!recent.length) {
    recentEl.innerHTML = '<p class="empty-msg">No students added yet.</p>';
  } else {
    recentEl.innerHTML = recent.map(s => {
      const g = getGrade(s.score);
      const initials = s.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
      return `
        <div class="recent-item">
          <div class="recent-avatar">${initials}</div>
          <div class="recent-info">
            <div class="recent-name">${esc(s.name)}</div>
            <div class="recent-id">ID: ${esc(s.id)}</div>
          </div>
          <div class="recent-score" style="color:${gradeColor(g)}">${s.score.toFixed(2)}</div>
          <span class="recent-grade grade-badge ${gradeCssClass(g)}">${g}</span>
        </div>`;
    }).join('');
  }
}

function updateTopbarCount() {
  document.getElementById('topbar-count').textContent =
    `${students.length} Student${students.length !== 1 ? 's' : ''}`;
}

/* ──────────────────────────────────────────
   PDF EXPORT
   ────────────────────────────────────────── */
function exportPDF() {
  if (!students.length) {
    showToast('Add students before exporting a PDF report.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const avg     = computeAverage();
  const highest = computeHighest();
  const lowest  = computeLowest();
  const counts  = gradeCounts();
  const topStudents = getByScore(highest).map(s => s.name).join(', ');
  const botStudents = getByScore(lowest).map(s => s.name).join(', ');
  const dateStr = new Date().toLocaleString();

  // ── Header background ──
  doc.setFillColor(13, 15, 26);
  doc.rect(0, 0, 210, 297, 'F');

  // ── Purple header band ──
  doc.setFillColor(108, 99, 255);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('STUDENT GRADE TRACKER', 105, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Grade System — Summary Report', 105, 24, { align: 'center' });
  doc.text(`Generated: ${dateStr}`, 105, 31, { align: 'center' });

  // ── Stats section ──
  let y = 50;
  doc.setTextColor(167, 139, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('STATISTICS', 14, y);

  y += 6;
  const stats = [
    ['Total Students',  students.length.toString()],
    ['Average Score',   avg.toFixed(2)],
    ['Highest Score',   `${highest.toFixed(2)}  (${topStudents})`],
    ['Lowest Score',    `${lowest.toFixed(2)}  (${botStudents})`],
  ];

  doc.setFontSize(10);
  stats.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(139, 143, 168);
    doc.text(label + ':', 14, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(240, 240, 248);
    doc.text(value, 60, y);
    y += 7;
  });

  // ── Student Table ──
  y += 4;
  doc.setTextColor(167, 139, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('STUDENT RECORDS', 14, y);
  y += 4;

  const tableData = students.map(s => [
    s.id, s.name, s.score.toFixed(2), getGrade(s.score)
  ]);

  doc.autoTable({
    startY: y,
    head: [['Student ID', 'Name', 'Score', 'Grade']],
    body: tableData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      textColor: [240, 240, 248],
      fillColor: [19, 22, 43],
      lineColor: [255, 255, 255, 30],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [108, 99, 255],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [25, 28, 50],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 80 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Grade Distribution ──
  y = doc.lastAutoTable.finalY + 10;

  if (y > 250) { doc.addPage(); y = 20; }

  doc.setTextColor(167, 139, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('GRADE DISTRIBUTION', 14, y);
  y += 6;

  const gradeOrder = ['A+', 'A', 'B', 'C', 'D', 'F'];
  doc.setFontSize(10);
  gradeOrder.forEach(g => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(139, 143, 168);
    doc.text(`Grade ${g}:`, 14, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(240, 240, 248);
    doc.text(`${counts[g]} student(s)`, 40, y);
    y += 7;
  });

  // ── Footer ──
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 86, 114);
  doc.text('GradeSystem — Student Grade Tracker', 105, 290, { align: 'center' });

  // Save
  const fname = `Grade_Report_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(fname);
  showToast(`📄 PDF exported: ${fname}`);
}

/* ──────────────────────────────────────────
   UI HELPERS
   ────────────────────────────────────────── */
function showAlert(el, type, msg) {
  el.className = `alert ${type}`;
  el.textContent = msg;
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3500);
}

function esc(str) {
  // Prevents XSS in innerHTML contexts
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ──────────────────────────────────────────
   INIT
   ────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  refreshDashboard();
  updateTopbarCount();
});
