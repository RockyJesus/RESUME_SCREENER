// HR Dashboard JavaScript
let allApplications = [];
let currentFilter = 'all';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadApplications();
    updateStats();
    displayApplications();
});

// Load applications from localStorage
function loadApplications() {
    const storedApplications = localStorage.getItem('hrApplications');
    if (storedApplications) {
        allApplications = JSON.parse(storedApplications);
    } else {
        // Generate some sample applications for demo
        allApplications = generateSampleApplications();
        saveApplications();
    }
}

// Save applications to localStorage
function saveApplications() {
    localStorage.setItem('hrApplications', JSON.stringify(allApplications));
}

// Generate sample applications for demo
function generateSampleApplications() {
    const sampleApplications = [
        {
            id: 'APP001',
            fullName: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1234567890',
            college: 'MIT',
            cgpa: '8.5',
            jobRole: 'AI Engineer',
            github: 'https://github.com/johndoe',
            linkedin: 'https://linkedin.com/in/johndoe',
            submissionDate: '2024-01-15',
            analyzed: false,
            score: null
        },
        {
            id: 'APP002',
            fullName: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+1234567891',
            college: 'Stanford University',
            cgpa: '9.2',
            jobRole: 'Software Developer',
            github: 'https://github.com/janesmith',
            linkedin: 'https://linkedin.com/in/janesmith',
            submissionDate: '2024-01-16',
            analyzed: true,
            score: 85
        },
        {
            id: 'APP003',
            fullName: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            phone: '+1234567892',
            college: 'UC Berkeley',
            cgpa: '7.8',
            jobRole: 'DevOps',
            github: 'https://github.com/mikejohnson',
            linkedin: '',
            submissionDate: '2024-01-17',
            analyzed: false,
            score: null
        },
        {
            id: 'APP004',
            fullName: 'Sarah Wilson',
            email: 'sarah.wilson@email.com',
            phone: '+1234567893',
            college: 'Carnegie Mellon',
            cgpa: '8.9',
            jobRole: 'IOT Engineer',
            github: '',
            linkedin: 'https://linkedin.com/in/sarahwilson',
            submissionDate: '2024-01-18',
            analyzed: true,
            score: 78
        },
        {
            id: 'APP005',
            fullName: 'David Brown',
            email: 'david.brown@email.com',
            phone: '+1234567894',
            college: 'Georgia Tech',
            cgpa: '8.1',
            jobRole: 'AI Engineer',
            github: 'https://github.com/davidbrown',
            linkedin: 'https://linkedin.com/in/davidbrown',
            submissionDate: '2024-01-19',
            analyzed: false,
            score: null
        }
    ];
    
    return sampleApplications;
}

// Update statistics
function updateStats() {
    const stats = {
        'AI Engineer': 0,
        'IOT Engineer': 0,
        'DevOps': 0,
        'Software Developer': 0
    };
    
    allApplications.forEach(app => {
        if (stats.hasOwnProperty(app.jobRole)) {
            stats[app.jobRole]++;
        }
    });
    
    document.getElementById('aiEngineerCount').textContent = stats['AI Engineer'];
    document.getElementById('iotEngineerCount').textContent = stats['IOT Engineer'];
    document.getElementById('devopsCount').textContent = stats['DevOps'];
    document.getElementById('softwareDeveloperCount').textContent = stats['Software Developer'];
}

// Filter applications
function filterApplications(role) {
    currentFilter = role;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (role === 'all') {
        document.querySelector('.filter-btn').classList.add('active');
    } else {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            if (btn.textContent.trim() === role) {
                btn.classList.add('active');
            }
        });
    }
    
    displayApplications();
}

// Display applications
function displayApplications() {
    const container = document.getElementById('applicationsGrid');
    
    let filteredApplications = allApplications;
    if (currentFilter !== 'all') {
        filteredApplications = allApplications.filter(app => app.jobRole === currentFilter);
    }
    
    if (filteredApplications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Applications Found</h3>
                <p>No applications found for the selected filter.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredApplications.map(app => `
        <div class="application-card">
            <div class="application-header">
                <div class="applicant-info">
                    <h3>${app.fullName}</h3>
                    <p><i class="fas fa-envelope"></i> ${app.email}</p>
                    <p><i class="fas fa-graduation-cap"></i> ${app.college} (CGPA: ${app.cgpa})</p>
                    <p><i class="fas fa-calendar"></i> Applied: ${new Date(app.submissionDate).toLocaleDateString()}</p>
                </div>
                <div class="application-actions">
                    <span class="role-badge ${app.jobRole.toLowerCase().replace(' ', '-')}">${app.jobRole}</span>
                    ${app.analyzed ? 
                        `<div class="score-display" style="background: #48bb78; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 600;">
                            Score: ${app.score}/100
                        </div>` : 
                        `<button class="analyze-btn" onclick="analyzeApplication('${app.id}')">
                            <i class="fas fa-chart-line"></i>
                            Analyze
                        </button>`
                    }
                </div>
            </div>
            
            <div class="application-details">
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${app.phone}</span>
                </div>
                <div class="detail-item">
                    <i class="fab fa-github"></i>
                    <span>${app.github ? 'GitHub Profile' : 'No GitHub'}</span>
                </div>
                <div class="detail-item">
                    <i class="fab fa-linkedin"></i>
                    <span>${app.linkedin ? 'LinkedIn Profile' : 'No LinkedIn'}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-id-badge"></i>
                    <span>ID: ${app.id}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Analyze application
async function analyzeApplication(applicationId) {
    const application = allApplications.find(app => app.id === applicationId);
    if (!application) return;
    
    // Show loading state
    const analyzeBtn = event.target;
    const originalContent = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    analyzeBtn.disabled = true;
    
    try {
        // Simulate analysis process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate mock score based on application data
        const score = generateMockScore(application);
        
        // Update application
        application.analyzed = true;
        application.score = score;
        
        // Save updated applications
        saveApplications();
        
        // Refresh display
        displayApplications();
        
        // Show success message
        showNotification(`Analysis completed for ${application.fullName}. Score: ${score}/100`, 'success');
        
    } catch (error) {
        console.error('Error analyzing application:', error);
        showNotification('Error analyzing application. Please try again.', 'error');
        
        // Reset button
        analyzeBtn.innerHTML = originalContent;
        analyzeBtn.disabled = false;
    }
}

// Generate mock score for demo
function generateMockScore(application) {
    let baseScore = 60;
    
    // CGPA bonus
    const cgpa = parseFloat(application.cgpa);
    baseScore += Math.min(20, cgpa * 2);
    
    // GitHub bonus
    if (application.github) {
        baseScore += 10;
    }
    
    // LinkedIn bonus
    if (application.linkedin) {
        baseScore += 5;
    }
    
    // Role-specific adjustments
    const roleMultipliers = {
        'AI Engineer': 1.1,
        'Software Developer': 1.0,
        'DevOps': 0.95,
        'IOT Engineer': 0.9
    };
    
    baseScore *= roleMultipliers[application.jobRole] || 1.0;
    
    // Add some randomness
    baseScore += Math.random() * 10 - 5;
    
    return Math.min(100, Math.max(40, Math.round(baseScore)));
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    const colors = {
        success: '#48bb78',
        error: '#e53e3e',
        info: '#667eea'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add new application from main form
function addNewApplication(applicationData) {
    const newApplication = {
        id: 'APP' + String(allApplications.length + 1).padStart(3, '0'),
        ...applicationData,
        submissionDate: new Date().toISOString().split('T')[0],
        analyzed: false,
        score: null
    };
    
    allApplications.push(newApplication);
    saveApplications();
    updateStats();
    displayApplications();
}

// Export function for use in other scripts
window.addNewApplication = addNewApplication;