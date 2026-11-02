// script.js
const SUPABASE_URL = 'https://fdjihxwnttsncxntzjef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkamloeHdudHRzbmN4bnR6amVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTk5MzgsImV4cCI6MjEwOTE3NTkzOH0.RKJ3TYX8tZMR0rEalsCsR0eBW4QF-Ryi_HXBEqvI7WQ';

const checkInBtn = document.getElementById('check-in-btn');
const statusMessage = document.getElementById('status-message');
const langBnBtn = document.getElementById('lang-bn');
const langEnBtn = document.getElementById('lang-en');

let currentLang = localStorage.getItem('aamiAchiLang') || 'bn';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('aamiAchiLang', lang);
    document.body.classList.remove('lang-bn', 'lang-en');
    document.body.classList.add('lang-' + lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[lang][key];
    });

    langBnBtn.classList.toggle('active', lang === 'bn');
    langEnBtn.classList.toggle('active', lang === 'en');
    statusMessage.textContent = '';
    statusMessage.classList.remove('error');
}

langBnBtn.addEventListener('click', function () { applyLanguage('bn'); });
langEnBtn.addEventListener('click', function () { applyLanguage('en'); });
applyLanguage(currentLang);

checkInBtn.addEventListener('click', async function () {
    const t = translations[currentLang];
    statusMessage.textContent = t.saving;
    statusMessage.classList.remove('error');
    checkInBtn.disabled = true;

    // Get Family ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const familyId = urlParams.get('family');

    if (!familyId) {
        statusMessage.textContent = "Invalid Link. Please ask your family for a new link.";
        statusMessage.classList.add('error');
        checkInBtn.disabled = false;
        return;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/check_ins`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ 
                status: 'OK',
                language: currentLang,
                family_id: familyId 
            })
        });

        if (response.ok) {
            statusMessage.textContent = t.success;
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error:', error);
        statusMessage.textContent = t.error;
        statusMessage.classList.add('error');
    } finally {
        checkInBtn.disabled = false;
    }
});