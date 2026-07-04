let allIdeas = [];

const grid = document.getElementById('ideaGrid');
const countBadge = document.getElementById('countBadge');
const cardStack = document.getElementById('cardStack');
const surpriseBtn = document.getElementById('surpriseBtn');
const nameSuggestions = document.getElementById('nameSuggestions');

const activeFilters = { category: null, budget: null, lugar: null };

document.querySelectorAll('.chip-group').forEach(group => {
  const key = group.dataset.target;
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    const already = btn.classList.contains('active');
    group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    activeFilters[key] = already ? null : btn.dataset.value;
    if (!already) btn.classList.add('active');
    renderGrid();
  });
});

// --- Live sync from Firestore ---
db.collection('dateIdeas').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
  allIdeas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  updateNameSuggestions();
  renderGrid();
}, err => {
  document.getElementById('formStatus').textContent =
    "Couldn't connect to the database. Check firebase-config.js.";
  console.error(err);
});

function updateNameSuggestions(){
  const names = [...new Set(allIdeas.map(i => i.addedBy).filter(Boolean))];
  nameSuggestions.innerHTML = names.map(n => `<option value="${escapeHtml(n)}">`).join('');
}

function getFiltered(){
  return allIdeas.filter(i =>
    (!activeFilters.category || i.category === activeFilters.category) &&
    (!activeFilters.budget || i.budget === activeFilters.budget) &&
    (!activeFilters.lugar || i.lugar === activeFilters.lugar)
  );
}

function cardHtml(idea){
  return `
    <div class="index-card">
      <span class="card-tab">idea</span>
      <p class="card-title">${escapeHtml(idea.title)}</p>
      <div class="card-tags">
        <span class="tag cat">${escapeHtml(idea.category)}</span>
        <span class="tag bud">${escapeHtml(idea.budget)}</span>
        <span class="tag lug">${escapeHtml(idea.lugar)}</span>
      </div>
      ${idea.notes ? `<p class="card-notes">${escapeHtml(idea.notes)}</p>` : ''}
      <span class="card-by">added by ${escapeHtml(idea.addedBy || '???')}</span>
    </div>`;
}

function renderGrid(){
  const filtered = getFiltered();
  countBadge.textContent = `(${filtered.length})`;
  grid.innerHTML = filtered.length
    ? filtered.map(cardHtml).join('')
    : `<p class="empty-state">No plans match these filters yet.</p>`;
}

// --- Surprise picker with a quick flip-through animation ---
surpriseBtn.addEventListener('click', () => {
  const pool = getFiltered();
  if (!pool.length){
    cardStack.innerHTML = `
      <div class="index-card placeholder">
        <span class="card-tab">?</span>
        <p class="card-empty-msg">No plans match these filters.<br>Try clearing one or add a new plan.</p>
      </div>`;
    return;
  }

  surpriseBtn.disabled = true;
  const existing = cardStack.querySelector('.index-card');
  let flips = 0;
  const maxFlips = 8;

  const interval = setInterval(() => {
    const idea = pool[Math.floor(Math.random() * pool.length)];
    cardStack.innerHTML = cardHtml(idea);
    const card = cardStack.querySelector('.index-card');
    card.classList.add('flipping');
    flips++;
    if (flips >= maxFlips){
      clearInterval(interval);
      surpriseBtn.disabled = false;
    }
  }, 110);
});

// --- Add form ---
document.getElementById('addForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  const idea = {
    title: document.getElementById('title').value.trim(),
    addedBy: document.getElementById('addedBy').value.trim(),
    category: document.getElementById('category').value,
    budget: document.getElementById('budget').value,
    lugar: document.getElementById('lugar').value,
    notes: document.getElementById('notes').value.trim(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  status.textContent = 'Saving...';
  try{
    await db.collection('dateIdeas').add(idea);
    status.textContent = 'Saved to the box.';
    e.target.reset();
    setTimeout(() => status.textContent = '', 2500);
  }catch(err){
    status.textContent = "Couldn't save. Check your Firestore connection.";
    console.error(err);
  }
});

function escapeHtml(str){
  return String(str ?? '').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}
