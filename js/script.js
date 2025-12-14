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
});

// Render all milestone checkboxes
function renderCheckboxes() {
    const container = document.getElementById('milestones-checkboxes');
    container.innerHTML = '';
    
    // Sort milestones numerically
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
        
        // Add remove button for custom milestones
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
    
    // Add milestone on Enter key
    document.getElementById('new-milestone-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addMilestone();
        }
    });
    
    // Calculate on Enter key in date input
    document.getElementById('birthday-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateBirthday();
        }
    });
    
    // Event delegation for remove buttons
    document.getElementById('milestones-checkboxes').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-milestone')) {
            const age = parseInt(e.target.dataset.age);
            removeMilestone(age);
        }
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
    
    resultsSection.style.display = 'flex';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display the score card
function displayScoreCard(partyCount, totalMilestones) {
    const scoreCard = document.getElementById('score-card');
    const scoreNumber = document.getElementById('score-number');
    const scoreText = document.getElementById('score-text');
    
    scoreCard.className = 'card score-card';
    scoreNumber.textContent = partyCount;
    
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
