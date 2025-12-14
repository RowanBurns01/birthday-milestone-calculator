// Milestone birthdays to check
const MILESTONES = [1, 16, 18, 21, 30, 40, 50, 60, 70, 80, 90, 100];

// Day names
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Month names for display
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeCheckboxes();
    setupEventListeners();
});

// Create milestone checkboxes
function initializeCheckboxes() {
    const container = document.getElementById('milestones-checkboxes');
    
    MILESTONES.forEach(age => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const suffix = getOrdinalSuffix(age);
        
        div.innerHTML = `
            <input type="checkbox" id="milestone-${age}" value="${age}" checked>
            <label for="milestone-${age}">${age}${suffix}</label>
        `;
        
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
    
    // Allow Enter key to trigger calculation
    document.getElementById('birthday-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculateBirthday();
        }
    });
}

// Toggle all checkboxes
function toggleAllCheckboxes(checked) {
    MILESTONES.forEach(age => {
        document.getElementById(`milestone-${age}`).checked = checked;
    });
}

// Get selected milestones
function getSelectedMilestones() {
    return MILESTONES.filter(age => 
        document.getElementById(`milestone-${age}`).checked
    );
}

// Calculate what day of week a date falls on
function getDayOfWeek(year, month, day) {
    const date = new Date(year, month - 1, day);
    return date.getDay();
}

// Format date for display (e.g., "March 4th, 1998")
function formatDate(year, month, day) {
    const monthName = MONTHS[month - 1];
    const suffix = getOrdinalSuffix(day);
    return `${monthName} ${day}${suffix}, ${year}`;
}

// Main calculation function
function calculateBirthday() {
    const input = document.getElementById('birthday-input').value;
    
    if (!input) {
        alert('Please enter your birthday!');
        return;
    }
    
    const selectedMilestones = getSelectedMilestones();
    
    if (selectedMilestones.length === 0) {
        alert('Please select at least one milestone!');
        return;
    }
    
    // Parse the date
    const [year, month, day] = input.split('-').map(Number);
    
    // Validate the date
    if (!isValidDate(year, month, day)) {
        alert('Please enter a valid date!');
        return;
    }
    
    // Calculate birth day of week
    const birthDayOfWeek = getDayOfWeek(year, month, day);
    const birthDayName = DAYS[birthDayOfWeek];
    
    // Calculate all milestone data
    const milestoneData = selectedMilestones.map(age => {
        const milestoneYear = year + age;
        const dayOfWeek = getDayOfWeek(milestoneYear, month, day);
        return {
            age,
            year: milestoneYear,
            dayOfWeek,
            dayName: DAYS[dayOfWeek],
            isPartyDay: dayOfWeek === 5 || dayOfWeek === 6 // Friday or Saturday
        };
    });
    
    // Filter party milestones
    const partyMilestones = milestoneData.filter(m => m.isPartyDay);
    const partyCount = partyMilestones.length;
    
    // Display results
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
    
    // Birth day text
    document.getElementById('birth-day-text').innerHTML = 
        `If you were born on <strong>${data.birthDate}</strong>, you were born on a <span class="day-highlight">${data.birthDayName}</span>.`;
    
    // Score card
    displayScoreCard(data.partyCount, data.totalMilestones);
    
    // Party milestones list
    displayPartyMilestones(data.partyMilestones);
    
    // Full calendar
    displayFullCalendar(data.milestoneData);
    
    // Summary
    displaySummary(data);
    
    // Show results section
    resultsSection.style.display = 'flex';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display the score card with dynamic styling
function displayScoreCard(partyCount, totalMilestones) {
    const scoreCard = document.getElementById('score-card');
    const scoreText = document.getElementById('score-text');
    
    // Remove all score classes
    scoreCard.className = 'result-card score-card';
    
    // Calculate percentage
    const percentage = (partyCount / totalMilestones) * 100;
    
    let message, scoreClass;
    
    if (partyCount === 0) {
        message = `Oh no! None of your ${totalMilestones} milestone birthdays land on a Friday or Saturday. 😢 You might need to celebrate on the nearest weekend instead!`;
        scoreClass = 'score-unlucky';
    } else if (partyCount === 1) {
        message = `You get <span class="score-number">1</span> major milestone party on a Friday or Saturday out of ${totalMilestones}. Not ideal, but make that one count! 🎈`;
        scoreClass = 'score-poor';
    } else if (partyCount === 2) {
        message = `You get <span class="score-number">2</span> major milestone parties on a Friday or Saturday out of ${totalMilestones}. Could be better, but you've got options! 🎉`;
        scoreClass = 'score-okay';
    } else if (partyCount === 3) {
        message = `You get <span class="score-number">3</span> major milestone parties on a Friday or Saturday out of ${totalMilestones}. Pretty decent birthday luck! 🎊`;
        scoreClass = 'score-good';
    } else if (partyCount === 4) {
        message = `You get <span class="score-number">4</span> major milestone parties on a Friday or Saturday out of ${totalMilestones}. That's great birthday luck! 🥳`;
        scoreClass = 'score-great';
    } else {
        message = `Wow! You get <span class="score-number">${partyCount}</span> major milestone parties on a Friday or Saturday out of ${totalMilestones}. Amazing birthday luck! 🎆🎇🎉`;
        scoreClass = 'score-amazing';
    }
    
    scoreCard.classList.add(scoreClass);
    scoreText.innerHTML = message;
}

// Display party milestones
function displayPartyMilestones(partyMilestones) {
    const list = document.getElementById('party-milestones-list');
    const card = document.getElementById('party-milestones-card');
    list.innerHTML = '';
    
    if (partyMilestones.length === 0) {
        list.innerHTML = '<li class="no-party-milestones">No milestone birthdays on Friday or Saturday 😔</li>';
        return;
    }
    
    partyMilestones.forEach(m => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>
                <span class="milestone-age">${m.age}${getOrdinalSuffix(m.age)} Birthday</span>
                <span class="milestone-year">(${m.year})</span>
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
                <span class="milestone-year">(${m.year})</span>
            </span>
            <span class="milestone-day ${dayClass}">${m.dayName}</span>
        `;
        list.appendChild(li);
    });
}

// Generate and display summary
function displaySummary(data) {
    const summaryText = document.getElementById('summary-text');
    
    // Find patterns in the data
    const fridayMilestones = data.milestoneData.filter(m => m.dayOfWeek === 5);
    const saturdayMilestones = data.milestoneData.filter(m => m.dayOfWeek === 6);
    const sundayMilestones = data.milestoneData.filter(m => m.dayOfWeek === 0);
    
    let summary = '';
    
    // Explain the birth day impact
    summary += `Being born on a ${data.birthDayName} sets the pattern for your milestone days. `;
    
    if (data.partyCount === 0) {
        summary += `Unfortunately, the calendar math doesn't favor you for party weekends on your selected milestones. `;
        summary += `Consider celebrating on the Saturday before or after each milestone!`;
    } else if (data.partyCount <= 2) {
        summary += `While you don't have many weekend milestones, `;
        if (fridayMilestones.length > 0) {
            summary += `your ${fridayMilestones.map(m => m.age + getOrdinalSuffix(m.age)).join(' and ')} ${fridayMilestones.length === 1 ? 'lands' : 'land'} on Friday${fridayMilestones.length > 1 ? 's' : ''}, perfect for kicking off a birthday weekend! `;
        }
        if (saturdayMilestones.length > 0) {
            summary += `Your ${saturdayMilestones.map(m => m.age + getOrdinalSuffix(m.age)).join(' and ')} ${saturdayMilestones.length === 1 ? 'is' : 'are'} on Saturday - the ultimate party day! `;
        }
    } else {
        summary += `You've got great party luck! `;
        if (fridayMilestones.length > 0 && saturdayMilestones.length > 0) {
            summary += `You have a nice mix of Friday and Saturday milestones, giving you flexibility for either casual Friday celebrations or all-out Saturday parties. `;
        } else if (saturdayMilestones.length > fridayMilestones.length) {
            summary += `Most of your party milestones land on Saturdays - the prime day for celebrations! `;
        } else {
            summary += `Many of your milestones hit on Fridays, perfect for starting birthday weekends! `;
        }
    }
    
    // Add note about Sunday milestones if any
    if (sundayMilestones.length > 0 && sundayMilestones.length <= 2) {
        summary += `Your ${sundayMilestones.map(m => m.age + getOrdinalSuffix(m.age)).join(' and ')} ${sundayMilestones.length === 1 ? 'falls' : 'fall'} on Sunday - great for a relaxed brunch celebration!`;
    }
    
    summaryText.textContent = summary;
}
