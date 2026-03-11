const API_BASE = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', () => {
    const userIdInput = document.getElementById('user-id');
    const loadStateBtn = document.getElementById('load-state-btn');

    const kcSelect = document.getElementById('kc-select');
    const correctBtn = document.getElementById('correct-btn');
    const wrongBtn = document.getElementById('wrong-btn');
    const quizFeedback = document.getElementById('quiz-feedback');

    const masteryList = document.getElementById('mastery-list');

    const getRecsBtn = document.getElementById('get-recs-btn');
    const recsList = document.getElementById('recs-list');

    // 1. Load Knowledge State
    async function loadState() {
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert("Please enter a User ID");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/knowledge_state/${userId}`);
            const data = await res.json();

            masteryList.innerHTML = '';

            if (data.message) {
                masteryList.innerHTML = `<li class="empty-state">${data.message}</li>`;
            } else {
                for (const [kc, mastery] of Object.entries(data)) {
                    const li = document.createElement('li');

                    const nameSpan = document.createElement('span');
                    nameSpan.textContent = kc;

                    const valSpan = document.createElement('span');
                    valSpan.textContent = `${(mastery * 100).toFixed(1)}%`;

                    // Color code based on mastery
                    if (mastery < 0.4) valSpan.style.color = 'var(--danger)';
                    else if (mastery > 0.8) valSpan.style.color = 'var(--success)';
                    else valSpan.style.color = '#ffeb3b';

                    li.appendChild(nameSpan);
                    li.appendChild(valSpan);
                    masteryList.appendChild(li);
                }
            }
        } catch (err) {
            console.error(err);
            masteryList.innerHTML = `<li class="empty-state" style="color: var(--danger)">Error loading state. Is backend running?</li>`;
        }
    }

    loadStateBtn.addEventListener('click', loadState);

    // 2. Submit Quiz Attempt
    async function submitAttempt(isCorrect) {
        const userId = userIdInput.value.trim();
        const kc = kcSelect.value;

        if (!userId) {
            alert("Please enter a User ID first");
            return;
        }

        try {
            const payload = {
                user_id: userId,
                kc: kc,
                correct: isCorrect
            };

            const res = await fetch(`${API_BASE}/quiz_attempt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                quizFeedback.textContent = `Attempt saved! New mastery for '${kc}': ${(data.new_mastery * 100).toFixed(1)}%`;
                quizFeedback.style.color = isCorrect ? 'var(--success)' : 'var(--danger)';
                setTimeout(() => quizFeedback.textContent = '', 3000);

                // Refresh state automatically
                loadState();
                // If recommendations are showing, clear them as state changed
                recsList.innerHTML = '<li class="empty-state">State changed. Click button to refresh recommendations...</li>';
            }
        } catch (err) {
            console.error(err);
            quizFeedback.textContent = "Error saving attempt.";
        }
    }

    correctBtn.addEventListener('click', () => submitAttempt(true));
    wrongBtn.addEventListener('click', () => submitAttempt(false));

    // 3. Get Recommendations
    async function fetchRecommendations() {
        const userId = userIdInput.value.trim();
        if (!userId) {
            alert("Please enter a User ID");
            return;
        }

        recsList.innerHTML = '<li class="empty-state">Loading...</li>';

        try {
            const res = await fetch(`${API_BASE}/recommendations/${userId}`);
            const data = await res.json();

            recsList.innerHTML = '';

            if (data.message) {
                recsList.innerHTML = `<li class="empty-state">${data.message}</li>`;
                return;
            }

            const recs = data.recommendations;

            if (!recs || recs.length === 0) {
                recsList.innerHTML = '<li class="empty-state">No recommendations found for this weakest skill yet.</li>';
                return;
            }

            recs.forEach(rec => {
                const li = document.createElement('li');

                const titleDiv = document.createElement('div');
                titleDiv.className = 'rec-title';
                titleDiv.textContent = rec.title;

                const reasonDiv = document.createElement('div');
                reasonDiv.className = 'rec-reason';
                reasonDiv.textContent = rec.reason;

                li.appendChild(titleDiv);
                li.appendChild(reasonDiv);
                recsList.appendChild(li);
            });

        } catch (err) {
            console.error(err);
            recsList.innerHTML = `<li class="empty-state" style="color: var(--danger)">Error loading recommendations.</li>`;
        }
    }

    getRecsBtn.addEventListener('click', fetchRecommendations);

});
