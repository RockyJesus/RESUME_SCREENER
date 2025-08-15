// Dashboard JavaScript
let analysisData = null;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get analysis data from localStorage or URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    
    if (dataParam) {
        try {
            analysisData = JSON.parse(decodeURIComponent(dataParam));
            populateDashboard(analysisData);
        } catch (error) {
            console.error('Error parsing analysis data:', error);
            showError('Failed to load analysis data');
        }
    } else {
        // Try to get from localStorage
        const storedData = localStorage.getItem('resumeAnalysisData');
        if (storedData) {
            try {
                analysisData = JSON.parse(storedData);
                populateDashboard(analysisData);
            } catch (error) {
                console.error('Error parsing stored data:', error);
                showError('Failed to load analysis data');
            }
        } else {
            showError('No analysis data found. Please go back and analyze a resume first.');
        }
    }
    
    // Setup HR evaluation input listeners
    setupHRInputs();
});

function populateDashboard(data) {
    // Populate candidate information
    populateCandidateInfo(data.user_data);
    
    // Populate resume analysis
    if (data.resume_analysis) {
        populateResumeScore(data.resume_analysis);
        populateDetailedAnalysis(data.resume_analysis);
    }
    
    // Populate GitHub analysis
    if (data.github_analysis) {
        populateGitHubScore(data.github_analysis);
    } else {
        populateEmptyGitHubScore();
    }
    
    // Populate LinkedIn analysis
    if (data.linkedin_analysis) {
        populateLinkedInScore(data.linkedin_analysis);
    } else {
        populateEmptyLinkedInScore();
    }
}

function populateCandidateInfo(userData) {
    const container = document.getElementById('candidateInfo');
    
    const infoItems = [
        { label: 'Name', value: userData.fullName, icon: 'fas fa-user' },
        { label: 'Email', value: userData.email, icon: 'fas fa-envelope' },
        { label: 'Phone', value: userData.phone, icon: 'fas fa-phone' },
        { label: 'College', value: userData.college, icon: 'fas fa-graduation-cap' },
        { label: 'CGPA', value: userData.cgpa, icon: 'fas fa-chart-line' },
        { label: 'Date of Birth', value: userData.dob, icon: 'fas fa-calendar' }
    ];
    
    container.innerHTML = infoItems.map(item => `
        <div class="info-item">
            <i class="${item.icon}"></i>
            <span class="info-label">${item.label}:</span>
            <span class="info-value">${item.value || 'Not provided'}</span>
        </div>
    `).join('');
}

function populateResumeScore(resumeAnalysis) {
    const scoring = resumeAnalysis.scoring;
    const overallScore = scoring.overall_resume_score;
    
    // Update score circle
    updateScoreCircle('resumeScoreCircle', overallScore);
    document.getElementById('resumeScore').textContent = overallScore;
    
    // Update breakdown
    const breakdown = document.getElementById('resumeBreakdown');
    breakdown.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">Technical Skills</span>
            <span class="breakdown-score">${scoring.technical_skills_score}/25</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Soft Skills</span>
            <span class="breakdown-score">${scoring.soft_skills_score}/15</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Experience</span>
            <span class="breakdown-score">${scoring.experience_score}/20</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Projects</span>
            <span class="breakdown-score">${scoring.projects_score}/20</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Achievements</span>
            <span class="breakdown-score">${scoring.achievements_score}/10</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Education</span>
            <span class="breakdown-score">${scoring.education_score}/10</span>
        </div>
    `;
}

function populateGitHubScore(githubAnalysis) {
    const score = githubAnalysis.github_score;
    
    // Update score circle
    updateScoreCircle('githubScoreCircle', score);
    document.getElementById('githubScore').textContent = score;
    
    // Update breakdown
    const breakdown = document.getElementById('githubBreakdown');
    breakdown.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">Repository Count</span>
            <span class="breakdown-score">${githubAnalysis.score_breakdown.repository_count}/30</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Star Rating</span>
            <span class="breakdown-score">${githubAnalysis.score_breakdown.star_rating}/25</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Language Diversity</span>
            <span class="breakdown-score">${githubAnalysis.score_breakdown.language_diversity}/20</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Contribution Activity</span>
            <span class="breakdown-score">${githubAnalysis.score_breakdown.contribution_activity}/25</span>
        </div>
    `;
}

function populateEmptyGitHubScore() {
    updateScoreCircle('githubScoreCircle', 0);
    document.getElementById('githubScore').textContent = '0';
    
    const breakdown = document.getElementById('githubBreakdown');
    breakdown.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">No GitHub Profile</span>
            <span class="breakdown-score">0/100</span>
        </div>
    `;
}

function populateLinkedInScore(linkedinAnalysis) {
    const score = linkedinAnalysis.linkedin_score;
    
    // Update score circle
    updateScoreCircle('linkedinScoreCircle', score);
    document.getElementById('linkedinScore').textContent = score;
    
    // Update breakdown
    const breakdown = document.getElementById('linkedinBreakdown');
    breakdown.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">Network Size</span>
            <span class="breakdown-score">${linkedinAnalysis.score_breakdown.network_size}/25</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Endorsements</span>
            <span class="breakdown-score">${linkedinAnalysis.score_breakdown.endorsements}/25</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Recommendations</span>
            <span class="breakdown-score">${linkedinAnalysis.score_breakdown.recommendations}/25</span>
        </div>
        <div class="breakdown-item">
            <span class="breakdown-label">Profile Completeness</span>
            <span class="breakdown-score">${linkedinAnalysis.score_breakdown.profile_completeness}/25</span>
        </div>
    `;
}

function populateEmptyLinkedInScore() {
    updateScoreCircle('linkedinScoreCircle', 0);
    document.getElementById('linkedinScore').textContent = '0';
    
    const breakdown = document.getElementById('linkedinBreakdown');
    breakdown.innerHTML = `
        <div class="breakdown-item">
            <span class="breakdown-label">No LinkedIn Profile</span>
            <span class="breakdown-score">0/100</span>
        </div>
    `;
}

function populateDetailedAnalysis(resumeAnalysis) {
    // Skills Analysis Tab
    const skillsContainer = document.getElementById('skillsAnalysis');
    const skills = resumeAnalysis.skills_analysis;
    
    skillsContainer.innerHTML = `
        <div class="skills-section">
            <h4><i class="fas fa-code"></i> Technical Skills</h4>
            <div class="skills-list">
                ${skills.technical_skills.map(skill => `<span class="skill-tag technical">${skill}</span>`).join('')}
            </div>
        </div>
        <div class="skills-section">
            <h4><i class="fas fa-handshake"></i> Soft Skills</h4>
            <div class="skills-list">
                ${skills.soft_skills.map(skill => `<span class="skill-tag soft">${skill}</span>`).join('')}
            </div>
        </div>
        <div class="skills-section">
            <h4><i class="fas fa-tools"></i> Tools & Technologies</h4>
            <div class="skills-list">
                ${skills.tools_technologies.map(tool => `<span class="skill-tag tool">${tool}</span>`).join('')}
            </div>
        </div>
    `;
    
    // Experience Analysis Tab
    const experienceContainer = document.getElementById('experienceAnalysis');
    const experience = resumeAnalysis.experience_analysis;
    
    experienceContainer.innerHTML = `
        <div class="experience-summary">
            <h4>Experience Summary</h4>
            <p><strong>Total Years:</strong> ${experience.total_years}</p>
            <p><strong>Work Experiences:</strong> ${experience.work_experience.length}</p>
            <p><strong>Internships:</strong> ${experience.internships.length}</p>
        </div>
        <div class="experience-details">
            <h4>Work Experience</h4>
            ${experience.work_experience.length > 0 ? 
                experience.work_experience.map(exp => `
                    <div class="experience-item">
                        <p>${exp.description || exp}</p>
                        ${exp.timeframe ? `<small>Duration: ${exp.timeframe}</small>` : ''}
                    </div>
                `).join('') : 
                '<p>No work experience found in resume.</p>'
            }
        </div>
    `;
    
    // Projects Analysis Tab
    const projectsContainer = document.getElementById('projectsAnalysis');
    
    projectsContainer.innerHTML = `
        <div class="projects-summary">
            <h4>Projects Overview</h4>
            <p><strong>Total Projects:</strong> ${experience.projects.length}</p>
        </div>
        <div class="projects-list">
            ${experience.projects.length > 0 ? 
                experience.projects.map((project, index) => `
                    <div class="project-item">
                        <h5>Project ${index + 1}</h5>
                        <p>${project}</p>
                    </div>
                `).join('') : 
                '<p>No projects found in resume.</p>'
            }
        </div>
    `;
    
    // Recommendations Tab
    const recommendationsContainer = document.getElementById('recommendationsAnalysis');
    
    recommendationsContainer.innerHTML = `
        <div class="candidate-type">
            <h4>Candidate Profile</h4>
            <p><strong>Type:</strong> <span class="candidate-badge ${resumeAnalysis.candidate_type.toLowerCase()}">${resumeAnalysis.candidate_type}</span></p>
        </div>
        <div class="strengths-section">
            <h4><i class="fas fa-thumbs-up"></i> Strengths</h4>
            <ul>
                ${resumeAnalysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
            </ul>
        </div>
        <div class="improvements-section">
            <h4><i class="fas fa-arrow-up"></i> Areas for Improvement</h4>
            <ul>
                ${resumeAnalysis.improvement_areas.map(area => `<li>${area}</li>`).join('')}
            </ul>
        </div>
        <div class="job-recommendations-section">
            <h4><i class="fas fa-briefcase"></i> Recommended Job Roles</h4>
            <div class="job-tags">
                ${resumeAnalysis.job_recommendations.map(job => `<span class="job-tag">${job}</span>`).join('')}
            </div>
        </div>
    `;
}

function updateScoreCircle(circleId, score) {
    const circle = document.getElementById(circleId);
    const angle = (score / 100) * 360;
    
    let color;
    if (score >= 80) color = '#48bb78';
    else if (score >= 60) color = '#38b2ac';
    else if (score >= 40) color = '#ed8936';
    else color = '#e53e3e';
    
    circle.style.setProperty('--score-angle', `${angle}deg`);
    circle.style.setProperty('--score-color', color);
}

function setupHRInputs() {
    const inputs = ['groupDiscussion', 'aptitudeTest', 'technicalRound', 'academicPerformance'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const indicator = document.getElementById(inputId.substring(0, 3) + 'Indicator');
        
        input.addEventListener('input', function() {
            const value = parseInt(this.value) || 0;
            const percentage = Math.min(100, Math.max(0, value));
            
            let color;
            if (percentage >= 80) color = '#48bb78';
            else if (percentage >= 60) color = '#38b2ac';
            else if (percentage >= 40) color = '#ed8936';
            else color = '#e53e3e';
            
            indicator.style.setProperty('--score-width', `${percentage}%`);
            indicator.style.setProperty('--score-color', color);
        });
    });
}

async function calculateTotalScore() {
    try {
        // Get all scores
        const resumeScore = parseInt(document.getElementById('resumeScore').textContent) || 0;
        const githubScore = parseInt(document.getElementById('githubScore').textContent) || 0;
        const linkedinScore = parseInt(document.getElementById('linkedinScore').textContent) || 0;
        
        // Get HR evaluation scores
        const groupDiscussion = parseInt(document.getElementById('groupDiscussion').value) || 0;
        const aptitudeTest = parseInt(document.getElementById('aptitudeTest').value) || 0;
        const technicalRound = parseInt(document.getElementById('technicalRound').value) || 0;
        const academicPerformance = parseInt(document.getElementById('academicPerformance').value) || 0;
        
        // Validate HR scores
        const hrScores = [groupDiscussion, aptitudeTest, technicalRound, academicPerformance];
        if (hrScores.some(score => score < 0 || score > 100)) {
            alert('Please enter valid scores between 0 and 100 for all HR evaluation fields.');
            return;
        }
        
        // Prepare data for API call
        const scoreData = {
            resume_score: resumeScore,
            github_score: githubScore,
            linkedin_score: linkedinScore,
            hr_evaluation: {
                group_discussion: groupDiscussion,
                aptitude: aptitudeTest,
                technical: technicalRound,
                academic_performance: academicPerformance
            }
        };
        
        // Call backend API
        const response = await fetch('/api/calculate-total-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayTotalScore(result);
        } else {
            throw new Error(result.message || 'Failed to calculate total score');
        }
        
    } catch (error) {
        console.error('Error calculating total score:', error);
        alert('Error calculating total score: ' + error.message);
    }
}

function displayTotalScore(result) {
    const totalResult = document.getElementById('totalResult');
    const totalScoreValue = document.getElementById('totalScoreValue');
    const finalGrade = document.getElementById('finalGrade');
    const recommendation = document.getElementById('recommendation');
    
    // Update total score circle
    const totalScore = result.total_score;
    const totalCircle = document.querySelector('.total-score-circle');
    const angle = (totalScore / 100) * 360;
    
    let color, gradeClass;
    if (totalScore >= 90) {
        color = '#48bb78';
        gradeClass = 'grade-a';
    } else if (totalScore >= 80) {
        color = '#38b2ac';
        gradeClass = 'grade-a';
    } else if (totalScore >= 70) {
        color = '#ed8936';
        gradeClass = 'grade-b';
    } else if (totalScore >= 60) {
        color = '#f6ad55';
        gradeClass = 'grade-b';
    } else {
        color = '#e53e3e';
        gradeClass = 'grade-c';
    }
    
    totalCircle.style.setProperty('--total-score-angle', `${angle}deg`);
    totalCircle.style.setProperty('--total-score-color', color);
    
    // Update values
    totalScoreValue.textContent = totalScore.toFixed(1);
    finalGrade.textContent = result.grade;
    finalGrade.className = `grade ${gradeClass}`;
    recommendation.textContent = result.recommendation;
    
    // Update weighted scores
    const weights = result.score_breakdown.weights_applied;
    document.getElementById('resumeWeighted').textContent = (result.score_breakdown.resume_score * weights.resume).toFixed(1);
    document.getElementById('githubWeighted').textContent = (result.score_breakdown.github_score * weights.github).toFixed(1);
    document.getElementById('linkedinWeighted').textContent = (result.score_breakdown.linkedin_score * weights.linkedin).toFixed(1);
    document.getElementById('gdWeighted').textContent = (result.score_breakdown.hr_evaluation.group_discussion * weights.group_discussion).toFixed(1);
    document.getElementById('aptWeighted').textContent = (result.score_breakdown.hr_evaluation.aptitude * weights.aptitude).toFixed(1);
    document.getElementById('techWeighted').textContent = (result.score_breakdown.hr_evaluation.technical * weights.technical).toFixed(1);
    document.getElementById('acadWeighted').textContent = (result.score_breakdown.hr_evaluation.academic_performance * weights.academic).toFixed(1);
    
    // Show result section
    totalResult.style.display = 'block';
    totalResult.classList.add('fade-in');
    
    // Scroll to result
    totalResult.scrollIntoView({ behavior: 'smooth' });
}

function showTab(tabName) {
    // Hide all tab panes
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab pane
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function goBack() {
    window.history.back();
}

function showError(message) {
    const container = document.querySelector('.dashboard-main');
    container.innerHTML = `
        <div class="error-message">
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="goBack()" class="back-btn">
                    <i class="fas fa-arrow-left"></i> Go Back
                </button>
            </div>
        </div>
    `;
}

// Add CSS for additional elements
const additionalStyles = `
<style>
.skill-tag {
    display: inline-block;
    padding: 4px 12px;
    margin: 4px;
    border-radius: 16px;
    font-size: 0.85rem;
    font-weight: 500;
}

.skill-tag.technical {
    background: #e6fffa;
    color: #234e52;
    border: 1px solid #81e6d9;
}

.skill-tag.soft {
    background: #fef5e7;
    color: #744210;
    border: 1px solid #f6ad55;
}

.skill-tag.tool {
    background: #edf2f7;
    color: #2d3748;
    border: 1px solid #cbd5e0;
}

.candidate-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9rem;
}

.candidate-badge.technical {
    background: #e6fffa;
    color: #234e52;
}

.candidate-badge.non-technical {
    background: #fef5e7;
    color: #744210;
}

.job-tag {
    display: inline-block;
    padding: 6px 16px;
    margin: 4px;
    background: #667eea;
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.experience-item, .project-item {
    background: #f7fafc;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    border-left: 3px solid #667eea;
}

.skills-section, .experience-summary, .projects-summary {
    margin-bottom: 25px;
}

.skills-section h4, .experience-summary h4, .projects-summary h4 {
    margin-bottom: 10px;
    color: #2d3748;
}

.skills-list {
    margin-top: 10px;
}

.error-message {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    text-align: center;
}

.error-content {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.error-content i {
    font-size: 3rem;
    color: #e53e3e;
    margin-bottom: 20px;
}

.error-content h3 {
    font-size: 1.5rem;
    color: #2d3748;
    margin-bottom: 10px;
}

.error-content p {
    color: #718096;
    margin-bottom: 20px;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);