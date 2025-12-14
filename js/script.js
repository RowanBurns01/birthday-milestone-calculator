// Default milestone birthdays
const DEFAULT_MILESTONES = [1, 16, 18, 21, 30, 40, 50, 60, 70, 80, 90, 100];

// Current milestones (can be modified)
let milestones = [...DEFAULT_MILESTONES];

// Day names
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Month names for display
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderCheckboxes();
    setupEventListeners();
    loadFromURL();
});

// Render all milestone checkboxes
function renderCheckboxes() {
    const container = document.getElementById('milestones-checkboxes');
    container.innerHTML = '';
    
    milestones.sort((a, b) => a - b);
    
    milestones.forEach(age => {
        const isDefault = DEFAULT_MILESTONES.includes(age);
        const div = document.createElement('div');
        div.className = `checkbox-item${isDefault ? '' : ' removable'}`;
        div.dataset.age = age;
        
        const suffix = getOrdinalSuffix(age);
        
        let html = `
            <input type="checkbox" id="milestone-${age}" value="${age}" checked>
            <label for="milestone-${age}">${age}${suffix}</label>
        `;
        
        if (!isDefault) {
            html += `<button type="button" class="remove-milestone" data-age="${age}">×</button>`;
        }
        
        div.innerHTML = html;
        container.appendChild(div);
    });
}

// Get ordinal suffix for a number
function getOrdinalSuffix(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('calculate-btn').addEventListener('click', calculateBirthday);
    document.getElementById('select-all').addEventListener('click', () => toggleAllCheckboxes(true));
    document.getElementById('select-none').addEventListener('click', () => toggleAllCheckboxes(false));
    document.getElementById('add-milestone-btn').addEventListener('click', addMilestone);
    document.getElementById('share-btn').addEventListener('click', shareResults);
    
    document.getElementById('new-milestone-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addMilestone();
        }
    });
    
    document.getElementById('birthday-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateBirthday();
        }
    });
    
    document.getElementById('milestones-checkboxes').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-milestone')) {
            const age = parseInt(e.target.dataset.age);
            removeMilestone(age);
        }
    });
}

// Load birthday from URL if present
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const birthday = params.get('b');
    
    if (birthday) {
        document.getElementById('birthday-input').value = birthday;
        setTimeout(() => calculateBirthday(), 100);
    }
}

// Share results by copying URL
function shareResults() {
    const birthday = document.getElementById('birthday-input').value;
    if (!birthday) return;
    
    const url = `${window.location.origin}${window.location.pathname}?b=${birthday}`;
    
    navigator.clipboard.writeText(url).then(() => {
        const feedback = document.getElementById('share-feedback');
        feedback.textContent = 'Link copied to clipboard';
        feedback.classList.add('show');
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        prompt('Copy this link:', url);
    });
}

// Add a new milestone
function addMilestone() {
    const input = document.getElementById('new-milestone-input');
    const age = parseInt(input.value);
    
    if (!age || age < 1 || age > 150) {
        return;
    }
    
    if (milestones.includes(age)) {
        input.value = '';
        return;
    }
    
    milestones.push(age);
    renderCheckboxes();
    input.value = '';
}

// Remove a milestone
function removeMilestone(age) {
    const index = milestones.indexOf(age);
    if (index > -1) {
        milestones.splice(index, 1);
        renderCheckboxes();
    }
}

// Toggle all checkboxes
function toggleAllCheckboxes(checked) {
    milestones.forEach(age => {
        const checkbox = document.getElementById(`milestone-${age}`);
        if (checkbox) {
            checkbox.checked = checked;
        }
    });
}

// Get selected milestones
function getSelectedMilestones() {
    return milestones.filter(age => {
        const checkbox = document.getElementById(`milestone-${age}`);
        return checkbox && checkbox.checked;
    });
}

// Calculate what day of week a date falls on
function getDayOfWeek(year, month, day) {
    const date = new Date(year, month - 1, day);
    return date.getDay();
}

// Format date for display
function formatDate(year, month, day) {
    const monthName = MONTHS[month - 1];
    const suffix = getOrdinalSuffix(day);
    return `${monthName} ${day}${suffix}, ${year}`;
}

// Animate number counting up
function animateNumber(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quint - slower at the end
        const easeProgress = 1 - Math.pow(1 - progress, 5);
        const current = Math.round(start + (target - start) * easeProgress);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else if (target > 0) {
            // Trigger confetti when animation completes (only if score > 0)
            triggerConfetti();
        }
    }
    
    requestAnimationFrame(update);
}

// Main calculation function
function calculateBirthday() {
    const input = document.getElementById('birthday-input').value;
    
    if (!input) {
        alert('Please enter your birthday');
        return;
    }
    
    const selectedMilestones = getSelectedMilestones();
    
    if (selectedMilestones.length === 0) {
        alert('Please select at least one milestone');
        return;
    }
    
    const [year, month, day] = input.split('-').map(Number);
    
    if (!isValidDate(year, month, day)) {
        alert('Please enter a valid date');
        return;
    }
    
    const birthDayOfWeek = getDayOfWeek(year, month, day);
    const birthDayName = DAYS[birthDayOfWeek];
    
    const milestoneData = selectedMilestones.map(age => {
        const milestoneYear = year + age;
        const dayOfWeek = getDayOfWeek(milestoneYear, month, day);
        return {
            age,
            year: milestoneYear,
            dayOfWeek,
            dayName: DAYS[dayOfWeek],
            isPartyDay: dayOfWeek === 5 || dayOfWeek === 6
        };
    });
    
    const partyMilestones = milestoneData.filter(m => m.isPartyDay);
    const partyCount = partyMilestones.length;
    
    displayResults({
        birthDate: formatDate(year, month, day),
        birthDayName,
        birthDayOfWeek,
        milestoneData,
        partyMilestones,
        partyCount,
        totalMilestones: selectedMilestones.length
    });
}

// Check if date is valid
function isValidDate(year, month, day) {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
}

// Display all results
function displayResults(data) {
    const resultsSection = document.getElementById('results');
    
    document.getElementById('birth-day-text').innerHTML = 
        `Born on <strong>${data.birthDate}</strong>, a <span class="day-highlight">${data.birthDayName}</span>`;
    
    displayScoreCard(data.partyCount, data.totalMilestones);
    displayPartyMilestones(data.partyMilestones);
    displayFullCalendar(data.milestoneData);
    displaySummary(data);
    displayExplanation(data);
    
    resultsSection.style.display = 'flex';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display the score card
function displayScoreCard(partyCount, totalMilestones) {
    const scoreCard = document.getElementById('score-card');
    const scoreNumber = document.getElementById('score-number');
    const scoreText = document.getElementById('score-text');
    
    scoreCard.className = 'card score-card';
    
    // Animate the number
    animateNumber(scoreNumber, partyCount);
    
    let message, scoreClass;
    
    if (partyCount === 0) {
        message = `No milestone birthdays on Friday or Saturday`;
        scoreClass = '';
    } else if (partyCount === 1) {
        message = `milestone birthday on a Friday or Saturday`;
        scoreClass = '';
    } else if (partyCount <= 2) {
        message = `milestone birthdays on Friday or Saturday`;
        scoreClass = 'score-okay';
    } else if (partyCount <= 3) {
        message = `milestone birthdays on Friday or Saturday`;
        scoreClass = 'score-good';
    } else {
        message = `milestone birthdays on Friday or Saturday`;
        scoreClass = 'score-great';
    }
    
    if (scoreClass) {
        scoreCard.classList.add(scoreClass);
    }
    scoreText.textContent = message;
}

// Display party milestones
function displayPartyMilestones(partyMilestones) {
    const list = document.getElementById('party-milestones-list');
    list.innerHTML = '';
    
    if (partyMilestones.length === 0) {
        list.innerHTML = '<li class="no-party-milestones">None of your milestones land on a weekend</li>';
        return;
    }
    
    partyMilestones.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>
                <span class="milestone-age">${m.age}${getOrdinalSuffix(m.age)} Birthday</span>
                <span class="milestone-year">${m.year}</span>
            </span>
            <span class="milestone-day day-${m.dayName.toLowerCase()}">${m.dayName}</span>
        `;
        list.appendChild(li);
    });
}

// Display full calendar
function displayFullCalendar(milestoneData) {
    const list = document.getElementById('full-calendar-list');
    list.innerHTML = '';
    
    milestoneData.forEach(m => {
        const li = document.createElement('li');
        const dayClass = m.isPartyDay ? `day-${m.dayName.toLowerCase()}` : 
                        (m.dayOfWeek === 0 ? 'day-sunday' : 'day-weekday');
        
        li.innerHTML = `
            <span>
                <span class="milestone-age">${m.age}${getOrdinalSuffix(m.age)}</span>
                <span class="milestone-year">${m.year}</span>
            </span>
            <span class="milestone-day ${dayClass}">${m.dayName}</span>
        `;
        list.appendChild(li);
    });
}

// Generate and display summary
function displaySummary(data) {
    const summaryText = document.getElementById('summary-text');
    
    const fridayMilestones = data.milestoneData.filter(m => m.dayOfWeek === 5);
    const saturdayMilestones = data.milestoneData.filter(m => m.dayOfWeek === 6);
    const sundayMilestones = data.milestoneData.filter(m => m.dayOfWeek === 0);
    
    let summary = '';
    
    summary += `Born on a ${data.birthDayName}, your milestone days follow a set pattern. `;
    
    if (data.partyCount === 0) {
        summary += `Unfortunately, none of your selected milestones fall on a Friday or Saturday. `;
        summary += `Consider celebrating on the nearest weekend instead.`;
    } else if (data.partyCount <= 2) {
        summary += `You have a modest number of weekend milestones. `;
        if (fridayMilestones.length > 0) {
            summary += `Your ${fridayMilestones.map(m => m.age + getOrdinalSuffix(m.age)).join(' and ')} ${fridayMilestones.length === 1 ? 'falls' : 'fall'} on Friday. `;
        }
        if (saturdayMilestones.length > 0) {
            summary += `Your ${saturdayMilestones.map(m => m.age + getOrdinalSuffix(m.age)).join(' and ')} ${saturdayMilestones.length === 1 ? 'lands' : 'land'} on Saturday.`;
        }
    } else {
        summary += `You have excellent party luck. `;
        if (fridayMilestones.length > 0 && saturdayMilestones.length > 0) {
            summary += `A good mix of Fridays and Saturdays gives you flexibility for celebrations.`;
        } else if (saturdayMilestones.length > fridayMilestones.length) {
            summary += `Most of your party milestones land on Saturdays.`;
        } else {
            summary += `Many of your milestones fall on Fridays, perfect for starting birthday weekends.`;
        }
    }
    
    if (sundayMilestones.length > 0 && sundayMilestones.length <= 2) {
        summary += ` Your ${sundayMilestones.map(m => m.age + getOrdinalSuffix(m.age)).join(' and ')} ${sundayMilestones.length === 1 ? 'falls' : 'fall'} on Sunday.`;
    }
    
    summaryText.textContent = summary;
}

// Display the clump explanation
function displayExplanation(data) {
    const content = document.getElementById('explanation-content');
    
    const explanation = `Each year, your birthday shifts forward by one day of the week (two days after a leap year). This creates predictable "clumps" of milestones that land on similar days. For someone born on a ${data.birthDayName}, certain milestone groups tend to cluster together. That's why your 1st, 18th, and 80th birthdays often land on adjacent days, while your 21st, 60th, and 100th form another cluster.`;
    
    content.textContent = explanation;
}

// ============================================
// CONFETTI EFFECT
// ============================================

// Create canvas for confetti
function createConfettiCanvas() {
    let canvas = document.querySelector('.confetti-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'confetti-canvas';
        document.body.appendChild(canvas);
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas;
}

// Monochrome particle burst confetti
function triggerConfetti() {
    const canvas = createConfettiCanvas();
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 35;
    
    // Get score card position
    const scoreCard = document.getElementById('score-card');
    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 3;
    
    if (scoreCard && scoreCard.offsetParent !== null) {
        const rect = scoreCard.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
        const velocity = 4 + Math.random() * 4;
        particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * velocity * 1.2,
            vy: Math.sin(angle) * velocity * 1.2 - 4,
            radius: 2 + Math.random() * 3,
            color: Math.random() > 0.5 ? '#000000' : '#aaaaaa',
            alpha: 1,
            gravity: 0.18
        });
    }
    
    let startTime = performance.now();
    const duration = 500;
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = elapsed / duration;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = Math.max(0, 1 - progress * 1.3);
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
        });
        
        ctx.globalAlpha = 1;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    requestAnimationFrame(animate);
}

