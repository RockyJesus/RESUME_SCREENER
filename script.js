// DOM Elements
const form = document.getElementById('resumeForm');
const loadingOverlay = document.getElementById('loadingOverlay');
const formSection = document.getElementById('formSection');
const resultsSection = document.getElementById('resultsSection');
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('resume');
const filePreview = document.getElementById('filePreview');

// Form validation patterns
const validationPatterns = {
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    linkedin: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?$/,
    github: /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9\-]+\/?$/
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupFileUpload();
    setupFormValidation();
});

// Initialize form functionality
function initializeForm() {
    // Set max date for DOB (18 years ago)
    const dobInput = document.getElementById('dob');
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18);
    dobInput.max = maxDate.toISOString().split('T')[0];
    
    // Set min date (80 years ago)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 80);
    dobInput.min = minDate.toISOString().split('T')[0];
}

// Setup file upload functionality
function setupFileUpload() {
    const uploadArea = fileUploadArea;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
    
    // Handle file selection via input
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    fileUploadArea.classList.add('dragover');
}

function unhighlight() {
    fileUploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        validateFile(file);
    }
}

function validateFile(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Clear previous errors
    showError('resumeError', '');
    
    if (!allowedTypes.includes(file.type)) {
        showError('resumeError', 'Please upload a PDF, DOC, or DOCX file.');
        return false;
    }
    
    if (file.size > maxSize) {
        showError('resumeError', 'File size must be less than 10MB.');
        return false;
    }
    
    // Show file preview
    showFilePreview(file);
    return true;
}

function showFilePreview(file) {
    const preview = filePreview;
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    
    preview.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-file-pdf" style="font-size: 1.5rem; color: #e53e3e;"></i>
            <div>
                <div style="font-weight: 600; color: #2d3748;">${file.name}</div>
                <div style="font-size: 0.9rem; color: #718096;">${fileSize} MB</div>
            </div>
            <i class="fas fa-check-circle" style="color: #48bb78; font-size: 1.2rem; margin-left: auto;"></i>
        </div>
    `;
    preview.classList.add('show');
}

// Setup form validation
function setupFormValidation() {
    const inputs = form.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearError(this);
        });
    });
    
    form.addEventListener('submit', handleFormSubmit);
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const errorElement = document.getElementById(fieldName + 'Error');
    
    // Clear previous error
    showError(fieldName + 'Error', '');
    
    // Required field validation
    if (field.required && !value) {
        showError(fieldName + 'Error', 'This field is required.');
        return false;
    }
    
    // Specific field validations
    switch (fieldName) {
        case 'fullName':
            if (value && value.length < 2) {
                showError(fieldName + 'Error', 'Name must be at least 2 characters long.');
                return false;
            }
            break;
            
        case 'phone':
            if (value && !validationPatterns.phone.test(value)) {
                showError(fieldName + 'Error', 'Please enter a valid phone number.');
                return false;
            }
            break;
            
        case 'email':
            if (value && !validationPatterns.email.test(value)) {
                showError(fieldName + 'Error', 'Please enter a valid email address.');
                return false;
            }
            break;
            
        case 'cgpa':
            if (value && (isNaN(value) || value < 0 || value > 10)) {
                showError(fieldName + 'Error', 'CGPA must be between 0 and 10.');
                return false;
            }
            break;
            
        case 'linkedin':
            if (value && !validationPatterns.linkedin.test(value)) {
                showError(fieldName + 'Error', 'Please enter a valid LinkedIn URL.');
                return false;
            }
            break;
            
        case 'github':
            if (value && !validationPatterns.github.test(value)) {
                showError(fieldName + 'Error', 'Please enter a valid GitHub URL.');
                return false;
            }
            break;
            
        case 'dob':
            if (value) {
                const birthDate = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                
                if (age < 18 || age > 80) {
                    showError(fieldName + 'Error', 'Age must be between 18 and 80 years.');
                    return false;
                }
            }
            break;
    }
    
    return true;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearError(field) {
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    // Validate file upload
    if (!fileInput.files.length) {
        showError('resumeError', 'Please upload your resume.');
        isValid = false;
    }
    
    if (!isValid) {
        alert('Please fix the errors in the form before submitting.');
        return;
    }
    
    // Show loading overlay
    showLoading();
    
    // Prepare form data
    const formData = new FormData(form);
    
    try {
        // Submit form data to backend
        const response = await submitFormData(formData);
        
        if (response.success) {
            // Hide loading and show results
            hideLoading();
            displayResults(response.data);
        } else {
            throw new Error(response.message || 'Analysis failed');
        }
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        alert('Error analyzing your profile: ' + error.message);
    }
}

// Submit form data to backend
async function submitFormData(formData) {
    // Simulate API call for demo purposes
    // In production, replace with actual backend endpoint
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockResponse = generateMockAnalysis(formData);
            resolve({
                success: true,
                data: mockResponse
            });
        }, 5000); // 5 second delay for demo
    });
    
    /*
    // Uncomment this section when backend is ready
    const response = await fetch('/api/analyze-profile', {
        method: 'POST',
        body: formData
    });
    
    return await response.json();
    */
}

// Generate mock analysis for demo
function generateMockAnalysis(formData) {
    const name = formData.get('fullName');
    const github = formData.get('github');
    const linkedin = formData.get('linkedin');
    const cgpa = formData.get('cgpa');
    
    return {
        profileSummary: {
            name: name,
            education: formData.get('college'),
            cgpa: cgpa,
            contact: {
                email: formData.get('email'),
                phone: formData.get('phone')
            },
            summary: `${name} is a promising candidate with a CGPA of ${cgpa} from ${formData.get('college')}. Based on the analysis of resume, GitHub, and LinkedIn profiles, they demonstrate strong technical skills and academic performance.`
        },
        skillsAnalysis: {
            technicalSkills: [
                { name: 'JavaScript', level: 85 },
                { name: 'Python', level: 90 },
                { name: 'React', level: 80 },
                { name: 'Node.js', level: 75 },
                { name: 'SQL', level: 70 }
            ],
            softSkills: [
                'Problem Solving',
                'Team Collaboration',
                'Communication',
                'Project Management'
            ],
            certifications: [
                'AWS Cloud Practitioner',
                'Google Analytics',
                'MongoDB University'
            ]
        },
        githubAnalysis: github ? {
            totalRepos: 15,
            activeRepos: 8,
            languages: ['JavaScript', 'Python', 'Java', 'HTML/CSS'],
            topProjects: [
                {
                    name: 'E-commerce Website',
                    description: 'Full-stack e-commerce solution with React and Node.js',
                    stars: 12,
                    language: 'JavaScript'
                },
                {
                    name: 'Data Analysis Tool',
                    description: 'Python-based data visualization and analysis tool',
                    stars: 8,
                    language: 'Python'
                }
            ],
            contributions: 156,
            streak: 23
        } : null,
        linkedinAnalysis: linkedin ? {
            connections: 250,
            endorsements: {
                'JavaScript': 12,
                'Python': 15,
                'React': 8,
                'Team Leadership': 6
            },
            recommendations: 3,
            skills: ['Web Development', 'Data Analysis', 'Project Management']
        } : null,
        jobRecommendations: [
            {
                title: 'Frontend Developer',
                match: '92%',
                description: 'Perfect match for your JavaScript and React skills. Strong portfolio and academic background make you an ideal candidate.',
                skills: ['JavaScript', 'React', 'HTML/CSS', 'Git'],
                salaryRange: '$65,000 - $85,000'
            },
            {
                title: 'Full Stack Developer',
                match: '88%',
                description: 'Your combination of frontend and backend skills, along with your GitHub projects, align perfectly with this role.',
                skills: ['JavaScript', 'Node.js', 'React', 'Database'],
                salaryRange: '$70,000 - $95,000'
            },
            {
                title: 'Software Engineer',
                match: '85%',
                description: 'Strong technical foundation and problem-solving skills make you suitable for general software engineering roles.',
                skills: ['Programming', 'Problem Solving', 'Team Work'],
                salaryRange: '$75,000 - $100,000'
            },
            {
                title: 'Data Analyst',
                match: '78%',
                description: 'Your Python skills and analytical mindset are valuable for data analysis positions.',
                skills: ['Python', 'SQL', 'Data Visualization'],
                salaryRange: '$60,000 - $80,000'
            }
        ],
        careerScore: {
            overall: 85,
            breakdown: {
                'Technical Skills': 90,
                'Experience': 70,
                'Education': 88,
                'Portfolio': 85,
                'Soft Skills': 80
            },
            recommendations: [
                'Consider contributing to more open-source projects',
                'Add more certifications in cloud technologies',
                'Build a stronger LinkedIn presence',
                'Work on more complex full-stack projects'
            ]
        }
    };
}

// Show loading animation
function showLoading() {
    loadingOverlay.classList.add('active');
    
    // Animate loading steps
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.classList.add('active');
        }, index * 1000);
    });
}

// Hide loading animation
function hideLoading() {
    loadingOverlay.classList.remove('active');
    
    // Reset steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.classList.remove('active');
    });
}

// Display analysis results
function displayResults(data) {
    // Hide form and show results
    formSection.style.display = 'none';
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
    
    // Populate results
    populateProfileSummary(data.profileSummary);
    populateSkillsAnalysis(data.skillsAnalysis);
    populateGithubAnalysis(data.githubAnalysis);
    populateLinkedinAnalysis(data.linkedinAnalysis);
    populateJobRecommendations(data.jobRecommendations);
    populateCareerScore(data.careerScore);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function populateProfileSummary(data) {
    const container = document.getElementById('profileSummary');
    container.innerHTML = `
        <div class="profile-info">
            <h4>👋 ${data.name}</h4>
            <div class="info-grid">
                <div class="info-item">
                    <span class="label">🎓 Education:</span>
                    <span class="value">${data.education}</span>
                </div>
                <div class="info-item">
                    <span class="label">📊 CGPA:</span>
                    <span class="value">${data.cgpa}</span>
                </div>
                <div class="info-item">
                    <span class="label">📧 Email:</span>
                    <span class="value">${data.contact.email}</span>
                </div>
                <div class="info-item">
                    <span class="label">📱 Phone:</span>
                    <span class="value">${data.contact.phone}</span>
                </div>
            </div>
            <div class="summary-text">
                <h5>Summary:</h5>
                <p>${data.summary}</p>
            </div>
        </div>
    `;
}

function populateSkillsAnalysis(data) {
    const container = document.getElementById('skillsAnalysis');
    
    const technicalSkillsHTML = data.technicalSkills.map(skill => `
        <div class="skill-item">
            <div class="skill-header">
                <span class="skill-name">${skill.name}</span>
                <span class="skill-percentage">${skill.level}%</span>
            </div>
            <div class="skill-bar">
                <div class="skill-progress" style="width: ${skill.level}%"></div>
            </div>
        </div>
    `).join('');
    
    const softSkillsHTML = data.softSkills.map(skill => `
        <span class="skill-tag">${skill}</span>
    `).join('');
    
    container.innerHTML = `
        <div class="skills-content">
            <div class="technical-skills">
                <h5>💻 Technical Skills</h5>
                ${technicalSkillsHTML}
            </div>
            <div class="soft-skills">
                <h5>🤝 Soft Skills</h5>
                <div class="skills-tags">
                    ${softSkillsHTML}
                </div>
            </div>
            <div class="certifications">
                <h5>🏆 Certifications</h5>
                <ul>
                    ${data.certifications.map(cert => `<li>${cert}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function populateGithubAnalysis(data) {
    const container = document.getElementById('githubAnalysis');
    
    if (!data) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fab fa-github" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 10px;"></i>
                <p>No GitHub profile provided</p>
                <small>Connect your GitHub profile to get detailed repository analysis</small>
            </div>
        `;
        return;
    }
    
    const projectsHTML = data.topProjects.map(project => `
        <div class="project-item">
            <div class="project-header">
                <h6>${project.name}</h6>
                <div class="project-stats">
                    <span>⭐ ${project.stars}</span>
                    <span class="language-tag">${project.language}</span>
                </div>
            </div>
            <p>${project.description}</p>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="github-stats">
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${data.totalRepos}</div>
                    <div class="stat-label">Total Repos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${data.contributions}</div>
                    <div class="stat-label">Contributions</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${data.streak}</div>
                    <div class="stat-label">Day Streak</div>
                </div>
            </div>
            <div class="languages">
                <h5>💻 Top Languages</h5>
                <div class="language-tags">
                    ${data.languages.map(lang => `<span class="skill-tag">${lang}</span>`).join('')}
                </div>
            </div>
            <div class="top-projects">
                <h5>🚀 Featured Projects</h5>
                ${projectsHTML}
            </div>
        </div>
    `;
}

function populateLinkedinAnalysis(data) {
    const container = document.getElementById('linkedinAnalysis');
    
    if (!data) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fab fa-linkedin" style="font-size: 3rem; color: #cbd5e0; margin-bottom: 10px;"></i>
                <p>No LinkedIn profile provided</p>
                <small>Connect your LinkedIn profile to get professional network analysis</small>
            </div>
        `;
        return;
    }
    
    const endorsementsHTML = Object.entries(data.endorsements).map(([skill, count]) => `
        <div class="endorsement-item">
            <span class="skill-name">${skill}</span>
            <span class="endorsement-count">${count} endorsements</span>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="linkedin-stats">
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${data.connections}</div>
                    <div class="stat-label">Connections</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${data.recommendations}</div>
                    <div class="stat-label">Recommendations</div>
                </div>
            </div>
            <div class="endorsements">
                <h5>👍 Top Endorsements</h5>
                ${endorsementsHTML}
            </div>
            <div class="professional-skills">
                <h5>💼 Professional Skills</h5>
                <div class="skills-tags">
                    ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function populateJobRecommendations(data) {
    const container = document.getElementById('jobRecommendations');
    
    const jobsHTML = data.map(job => `
        <div class="job-item">
            <div class="job-header">
                <h4 class="job-title">${job.title}</h4>
                <span class="job-match">${job.match} Match</span>
            </div>
            <p class="job-description">${job.description}</p>
            <div class="job-details">
                <div class="salary-range">💰 ${job.salaryRange}</div>
                <div class="job-skills">
                    ${job.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = jobsHTML;
}

function populateCareerScore(data) {
    const container = document.getElementById('careerScore');
    
    const breakdownHTML = Object.entries(data.breakdown).map(([category, score]) => `
        <div class="score-breakdown-item">
            <div class="category-header">
                <span class="category-name">${category}</span>
                <span class="category-score">${score}%</span>
            </div>
            <div class="category-bar">
                <div class="category-progress" style="width: ${score}%"></div>
            </div>
        </div>
    `).join('');
    
    const recommendationsHTML = data.recommendations.map(rec => `
        <li class="recommendation-item">
            <i class="fas fa-lightbulb"></i>
            ${rec}
        </li>
    `).join('');
    
    container.innerHTML = `
        <div class="score-display">
            <div class="score-circle" style="--percentage: ${data.overall * 3.6}deg">
                <div class="score-number">${data.overall}</div>
            </div>
            <div class="score-label">Overall Career Readiness</div>
        </div>
        <div class="score-breakdown">
            <h5>📊 Detailed Breakdown</h5>
            ${breakdownHTML}
        </div>
        <div class="recommendations">
            <h5>💡 Recommendations</h5>
            <ul class="recommendations-list">
                ${recommendationsHTML}
            </ul>
        </div>
    `;
}

// Reset form for new analysis
function resetForm() {
    // Reset form
    form.reset();
    
    // Clear file preview
    filePreview.classList.remove('show');
    filePreview.innerHTML = '';
    
    // Clear all error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    // Show form and hide results
    formSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Scroll to form
    formSection.scrollIntoView({ behavior: 'smooth' });
}

// Additional CSS for dynamic elements
const additionalStyles = `
<style>
.profile-info h4 {
    font-size: 1.4rem;
    color: #2d3748;
    margin-bottom: 15px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 10px;
    margin-bottom: 20px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.info-item .label {
    font-weight: 500;
    color: #4a5568;
}

.info-item .value {
    color: #2d3748;
}

.summary-text h5 {
    font-size: 1.1rem;
    color: #2d3748;
    margin: 15px 0 8px 0;
}

.summary-text p {
    color: #718096;
    line-height: 1.6;
}

.skill-item {
    margin-bottom: 15px;
}

.skill-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.skill-name {
    font-weight: 500;
    color: #2d3748;
}

.skill-percentage {
    font-size: 0.9rem;
    color: #667eea;
    font-weight: 600;
}

.skill-bar {
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
}

.skill-progress {
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 1s ease;
}

.skills-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.technical-skills, .soft-skills, .certifications {
    margin-bottom: 25px;
}

.technical-skills h5, .soft-skills h5, .certifications h5 {
    font-size: 1.1rem;
    color: #2d3748;
    margin-bottom: 15px;
}

.certifications ul {
    list-style: none;
    padding: 0;
}

.certifications li {
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
    color: #4a5568;
}

.certifications li:last-child {
    border-bottom: none;
}

.no-data {
    text-align: center;
    padding: 40px 20px;
    color: #718096;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}

.stat-item {
    text-align: center;
    background: white;
    padding: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #667eea;
}

.stat-label {
    font-size: 0.9rem;
    color: #718096;
    margin-top: 5px;
}

.language-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
}

.project-item {
    background: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    border-left: 3px solid #667eea;
}

.project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.project-header h6 {
    font-size: 1.1rem;
    color: #2d3748;
    margin: 0;
}

.project-stats {
    display: flex;
    gap: 10px;
    align-items: center;
}

.language-tag {
    background: #667eea;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
}

.project-item p {
    color: #718096;
    margin: 0;
}

.endorsement-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
}

.endorsement-item:last-child {
    border-bottom: none;
}

.endorsement-count {
    color: #667eea;
    font-size: 0.9rem;
    font-weight: 500;
}

.job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    flex-wrap: wrap;
    gap: 10px;
}

.salary-range {
    color: #48bb78;
    font-weight: 600;
    margin: 10px 0;
}

.job-details {
    margin-top: 15px;
}

.score-breakdown-item {
    margin-bottom: 15px;
}

.category-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.category-name {
    font-weight: 500;
    color: #2d3748;
}

.category-score {
    color: #48bb78;
    font-weight: 600;
}

.category-bar {
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
}

.category-progress {
    height: 100%;
    background: linear-gradient(90deg, #48bb78, #38a169);
    transition: width 1s ease;
}

.score-display {
    text-align: center;
    margin-bottom: 30px;
}

.score-label {
    font-size: 1.1rem;
    color: #4a5568;
    margin-top: 10px;
}

.recommendations-list {
    list-style: none;
    padding: 0;
}

.recommendation-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
}

.recommendation-item:last-child {
    border-bottom: none;
}

.recommendation-item i {
    color: #f6ad55;
    margin-top: 2px;
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);