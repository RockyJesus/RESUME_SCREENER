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
    
    // Add demo notice
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const demoNotice = document.createElement('div');
        demoNotice.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 20px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
        `;
        demoNotice.innerHTML = `
            <i class="fas fa-info-circle"></i> 
            <strong>Demo Mode:</strong> This application uses intelligent mock data for demonstration. 
            The analysis adapts based on your inputs to show different results for technical vs non-technical profiles.
        `;
        heroContent.appendChild(demoNotice);
    }
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
        // Submit form data
        const response = await submitFormData(formData);
        
        if (response.success) {
            // Calculate overall score
            const analysisData = calculateOverallScore(response.data);
            
            // Hide loading and redirect to dashboard
            hideLoading();
            
            // Store data and redirect
            localStorage.setItem('resumeAnalysisData', JSON.stringify(analysisData));
            window.location.href = 'dashboard.html';
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
    // Since we're on static hosting, use mock analysis
    // In production, this would call the actual backend API
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate mock analysis based on form data
        const mockData = generateMockAnalysis(formData);
        
        return {
            success: true,
            data: mockData
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// Generate mock analysis for demo
function generateMockAnalysis(formData) {
    const name = formData.get('fullName');
    const github = formData.get('github');
    const linkedin = formData.get('linkedin');
    const cgpa = formData.get('cgpa');
    const college = formData.get('college');
    const email = formData.get('email');
    const phone = formData.get('phone');
    
    // Determine if candidate is technical or non-technical based on college/email
    const techKeywords = ['engineering', 'technology', 'computer', 'software', 'tech', 'it', 'science'];
    const isTechnical = techKeywords.some(keyword => 
        college.toLowerCase().includes(keyword) || 
        email.toLowerCase().includes(keyword) ||
        name.toLowerCase().includes('tech')
    );
    
    // Generate dynamic scores based on inputs
    const baseScore = Math.min(95, Math.max(60, parseFloat(cgpa) * 10 + Math.random() * 15));
    const githubBonus = github ? 15 : 0;
    const linkedinBonus = linkedin ? 10 : 0;
    
    // Technical vs Non-technical skill sets
    const technicalSkills = isTechnical ? 
        ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'HTML/CSS', 'Java'] :
        ['Microsoft Office', 'Data Analysis', 'Project Management', 'Communication', 'Research'];
    
    const softSkills = isTechnical ?
        ['Problem Solving', 'Analytical Thinking', 'Team Collaboration', 'Code Review'] :
        ['Leadership', 'Communication', 'Team Management', 'Strategic Planning', 'Client Relations'];
    
    // Dynamic job recommendations
    const jobRecommendations = isTechnical ? [
        {
            title: 'Software Developer',
            match: Math.min(95, baseScore + githubBonus),
            description: 'Perfect match for your technical skills and programming background. Your academic performance and technical foundation make you an ideal candidate.',
            skills: ['Programming', 'Problem Solving', 'Software Development'],
            salaryRange: '$65,000 - $95,000'
        },
        {
            title: 'Frontend Developer',
            match: Math.min(92, baseScore + githubBonus - 3),
            description: 'Your technical background aligns well with frontend development. Consider building more web projects to strengthen your portfolio.',
            skills: ['HTML/CSS', 'JavaScript', 'React', 'UI/UX'],
            salaryRange: '$60,000 - $90,000'
        },
        {
            title: 'Data Analyst',
            match: Math.min(88, baseScore + 5),
            description: 'Your analytical skills and academic background are suitable for data analysis roles. Consider learning more data visualization tools.',
            skills: ['Data Analysis', 'SQL', 'Statistics', 'Excel'],
            salaryRange: '$55,000 - $80,000'
        }
    ] : [
        {
            title: 'Business Analyst',
            match: Math.min(90, baseScore + linkedinBonus),
            description: 'Your educational background and analytical skills make you suitable for business analysis roles. Strong communication skills are a plus.',
            skills: ['Business Analysis', 'Communication', 'Project Management'],
            salaryRange: '$55,000 - $85,000'
        },
        {
            title: 'Project Coordinator',
            match: Math.min(85, baseScore + 5),
            description: 'Your organizational skills and academic performance indicate good potential for project coordination roles.',
            skills: ['Project Management', 'Communication', 'Organization'],
            salaryRange: '$45,000 - $70,000'
        },
        {
            title: 'Marketing Associate',
            match: Math.min(82, baseScore),
            description: 'Your communication skills and educational background align with marketing roles. Consider building a portfolio of marketing projects.',
            skills: ['Marketing', 'Communication', 'Social Media', 'Analytics'],
            salaryRange: '$40,000 - $65,000'
        }
    ];
    
    // Generate comprehensive analysis data
    return {
        user_data: {
            fullName: name,
            email: email,
            phone: phone,
            college: college,
            cgpa: cgpa,
            dob: formData.get('dob'),
            linkedin: linkedin,
            github: github
        },
        resume_analysis: {
            candidate_type: isTechnical ? 'Technical' : 'Non-Technical',
            skills_analysis: {
                technical_skills: technicalSkills,
                soft_skills: softSkills,
                tools_technologies: isTechnical ? 
                    ['VS Code', 'Git', 'Docker', 'AWS', 'Postman'] :
                    ['Microsoft Office', 'Google Workspace', 'Slack', 'Trello', 'Zoom'],
                certifications: isTechnical ?
                    ['AWS Cloud Practitioner', 'Google Analytics', 'MongoDB University'] :
                    ['Google Analytics', 'Project Management', 'Digital Marketing']
            },
            experience_analysis: {
                total_years: Math.floor(Math.random() * 2), // 0-2 years for freshers
                work_experience: [
                    isTechnical ? 
                        'Developed web applications using modern frameworks and technologies' :
                        'Coordinated team projects and managed client communications effectively'
                ],
                internships: [
                    isTechnical ?
                        'Software Development Intern - Built responsive web applications' :
                        'Business Development Intern - Analyzed market trends and customer data'
                ],
                projects: isTechnical ? [
                    'E-commerce Website - Full-stack web application with payment integration',
                    'Task Management App - React-based application with real-time updates',
                    'Data Visualization Dashboard - Interactive charts and analytics'
                ] : [
                    'Market Research Project - Comprehensive analysis of industry trends',
                    'Business Process Optimization - Streamlined workflow procedures',
                    'Customer Satisfaction Survey - Data collection and analysis project'
                ]
            },
            scoring: {
                technical_skills_score: Math.min(25, isTechnical ? 20 + Math.random() * 5 : 10 + Math.random() * 8),
                soft_skills_score: Math.min(15, isTechnical ? 10 + Math.random() * 5 : 12 + Math.random() * 3),
                experience_score: Math.min(20, 8 + Math.random() * 8), // Lower for freshers
                projects_score: Math.min(20, isTechnical ? 15 + Math.random() * 5 : 12 + Math.random() * 6),
                achievements_score: Math.min(10, 5 + Math.random() * 4),
                education_score: Math.min(10, Math.max(6, parseFloat(cgpa))),
                overall_resume_score: 0 // Will be calculated
            },
            strengths: isTechnical ? [
                'Strong technical foundation',
                'Good programming skills',
                'Problem-solving abilities',
                'Academic excellence'
            ] : [
                'Excellent communication skills',
                'Strong analytical thinking',
                'Leadership potential',
                'Academic performance'
            ],
            improvement_areas: isTechnical ? [
                'Industry experience',
                'Advanced certifications',
                'Open source contributions',
                'System design knowledge'
            ] : [
                'Technical skills',
                'Industry certifications',
                'Professional experience',
                'Specialized domain knowledge'
            ],
            job_recommendations: jobRecommendations.map(job => job.title)
        },
        github_analysis: github ? {
            username: 'demo_user',
            public_repos: Math.floor(Math.random() * 20) + 5,
            followers: Math.floor(Math.random() * 50) + 10,
            following: Math.floor(Math.random() * 80) + 20,
            total_stars: Math.floor(Math.random() * 100) + 20,
            languages: isTechnical ? 
                ['JavaScript', 'Python', 'Java', 'HTML', 'CSS'] :
                ['Python', 'R', 'JavaScript'],
            github_score: Math.min(100, baseScore + githubBonus),
            score_breakdown: {
                repository_count: Math.floor(Math.random() * 25) + 10,
                star_rating: Math.floor(Math.random() * 20) + 15,
                language_diversity: Math.floor(Math.random() * 15) + 10,
                contribution_activity: Math.floor(Math.random() * 25) + 15
            },
            profile_strength: baseScore >= 80 ? 'Excellent' : baseScore >= 60 ? 'Good' : 'Average'
        } : null,
        linkedin_analysis: linkedin ? {
            connections: Math.floor(Math.random() * 300) + 100,
            endorsements_count: Math.floor(Math.random() * 50) + 10,
            recommendations: Math.floor(Math.random() * 8) + 2,
            linkedin_score: Math.min(100, baseScore + linkedinBonus),
            score_breakdown: {
                network_size: Math.floor(Math.random() * 20) + 15,
                endorsements: Math.floor(Math.random() * 20) + 10,
                recommendations: Math.floor(Math.random() * 15) + 10,
                profile_completeness: Math.floor(Math.random() * 20) + 15
            },
            profile_strength: baseScore >= 75 ? 'Good' : 'Average'
        } : null,
        analysis_timestamp: new Date().toISOString()
    };
}

// Calculate overall resume score after generating the analysis
function calculateOverallScore(analysisData) {
    const scoring = analysisData.resume_analysis.scoring;
    const overallScore = 
        scoring.technical_skills_score +
        scoring.soft_skills_score +
        scoring.experience_score +
        scoring.projects_score +
        scoring.achievements_score +
        scoring.education_score;
    
    scoring.overall_resume_score = Math.round(overallScore);
    return analysisData;
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
    // Store analysis data
    localStorage.setItem('resumeAnalysisData', JSON.stringify(data));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
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
    
    // Clear stored data
    localStorage.removeItem('resumeAnalysisData');
    
    // Redirect back to main form
    window.location.href = 'index.html';
}