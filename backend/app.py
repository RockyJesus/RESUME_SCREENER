# Backend API Server for Resume Scanner
import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import google.generativeai as genai
import requests
from linkedin_api import Linkedin
import PyPDF2
import docx
from textract import process
import openai
from typing import Dict, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# API Keys (Replace with your actual API keys)
GEMINI_API_KEY = "your-gemini-api-key-here"
GITHUB_TOKEN = "your-github-token-here"
LINKEDIN_EMAIL = "your-linkedin-email-here"
LINKEDIN_PASSWORD = "your-linkedin-password-here"

# Initialize API clients
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

class ResumeAnalyzer:
    """Main class for analyzing resumes and profiles"""
    
    def __init__(self):
        self.github_headers = {
            'Authorization': f'token {GITHUB_TOKEN}',
            'Accept': 'application/vnd.github.v3+json'
        }
    
    def extract_text_from_resume(self, file_path: str) -> str:
        """Extract text from uploaded resume file"""
        try:
            file_extension = file_path.split('.')[-1].lower()
            
            if file_extension == 'pdf':
                return self._extract_text_from_pdf(file_path)
            elif file_extension in ['doc', 'docx']:
                return self._extract_text_from_docx(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
                
        except Exception as e:
            logger.error(f"Error extracting text from resume: {str(e)}")
            raise
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"Error reading PDF: {str(e)}")
            # Fallback to textract for complex PDFs
            text = process(file_path).decode('utf-8')
        
        return text.strip()
    
    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error reading DOCX: {str(e)}")
            # Fallback to textract
            return process(file_path).decode('utf-8')
    
    def analyze_resume_with_ai(self, resume_text: str, user_data: Dict) -> Dict:
        """Use Gemini AI to analyze resume content"""
        try:
            prompt = f"""
            Analyze the following resume and provide detailed insights:
            
            Resume Text:
            {resume_text}
            
            Personal Information:
            - Name: {user_data.get('fullName', '')}
            - Education: {user_data.get('college', '')}
            - CGPA: {user_data.get('cgpa', '')}
            
            Please provide analysis in the following JSON format:
            {{
                "skills": {{
                    "technical_skills": [list of technical skills with proficiency levels],
                    "soft_skills": [list of soft skills],
                    "certifications": [list of certifications]
                }},
                "experience": {{
                    "years_of_experience": number,
                    "key_experiences": [list of key experiences],
                    "projects": [list of projects mentioned]
                }},
                "strengths": [list of candidate strengths],
                "areas_for_improvement": [list of areas to improve],
                "summary": "comprehensive summary of the candidate"
            }}
            """
            
            response = model.generate_content(prompt)
            
            # Parse JSON response
            try:
                analysis = json.loads(response.text)
                return analysis
            except json.JSONDecodeError:
                # If JSON parsing fails, return a structured response
                return self._parse_ai_response(response.text)
                
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return self._generate_fallback_analysis(resume_text, user_data)
    
    def _parse_ai_response(self, response_text: str) -> Dict:
        """Parse AI response when JSON format fails"""
        # Implement basic parsing logic here
        return {
            "skills": {
                "technical_skills": ["Python", "JavaScript", "SQL"],
                "soft_skills": ["Communication", "Team Work", "Problem Solving"],
                "certifications": []
            },
            "experience": {
                "years_of_experience": 0,
                "key_experiences": [],
                "projects": []
            },
            "strengths": ["Strong academic background", "Technical aptitude"],
            "areas_for_improvement": ["Industry experience", "Professional certifications"],
            "summary": "Promising candidate with strong technical foundation"
        }
    
    def _generate_fallback_analysis(self, resume_text: str, user_data: Dict) -> Dict:
        """Generate basic analysis when AI fails"""
        # Basic keyword extraction for skills
        technical_keywords = [
            'python', 'javascript', 'java', 'c++', 'react', 'node.js',
            'sql', 'mongodb', 'aws', 'docker', 'git', 'html', 'css'
        ]
        
        found_skills = []
        resume_lower = resume_text.lower()
        
        for skill in technical_keywords:
            if skill in resume_lower:
                found_skills.append(skill.title())
        
        return {
            "skills": {
                "technical_skills": found_skills[:10],  # Top 10
                "soft_skills": ["Communication", "Team Work", "Problem Solving"],
                "certifications": []
            },
            "experience": {
                "years_of_experience": 0,
                "key_experiences": [],
                "projects": []
            },
            "strengths": ["Strong academic background"],
            "areas_for_improvement": ["Industry experience"],
            "summary": f"Candidate with CGPA of {user_data.get('cgpa', 'N/A')} and technical skills"
        }
    
    def analyze_github_profile(self, github_url: str) -> Optional[Dict]:
        """Analyze GitHub profile and repositories"""
        try:
            # Extract username from GitHub URL
            username = github_url.split('github.com/')[-1].strip('/')
            
            # Get user profile
            profile_response = requests.get(
                f'https://api.github.com/users/{username}',
                headers=self.github_headers
            )
            
            if profile_response.status_code != 200:
                logger.error(f"GitHub API error: {profile_response.status_code}")
                return None
            
            profile_data = profile_response.json()
            
            # Get user repositories
            repos_response = requests.get(
                f'https://api.github.com/users/{username}/repos?sort=updated&per_page=10',
                headers=self.github_headers
            )
            
            if repos_response.status_code != 200:
                logger.error(f"GitHub repos API error: {repos_response.status_code}")
                return None
            
            repos_data = repos_response.json()
            
            # Analyze repositories
            languages = {}
            top_projects = []
            
            for repo in repos_data:
                if not repo['fork']:  # Exclude forked repositories
                    # Count languages
                    if repo['language']:
                        languages[repo['language']] = languages.get(repo['language'], 0) + 1
                    
                    # Top projects (by stars)
                    if len(top_projects) < 5:
                        top_projects.append({
                            'name': repo['name'],
                            'description': repo['description'] or 'No description available',
                            'language': repo['language'] or 'Unknown',
                            'stars': repo['stargazers_count'],
                            'url': repo['html_url']
                        })
            
            # Sort projects by stars
            top_projects.sort(key=lambda x: x['stars'], reverse=True)
            
            return {
                'username': username,
                'public_repos': profile_data['public_repos'],
                'followers': profile_data['followers'],
                'following': profile_data['following'],
                'languages': list(languages.keys()),
                'top_projects': top_projects[:3],
                'profile_url': profile_data['html_url'],
                'bio': profile_data.get('bio', ''),
                'company': profile_data.get('company', ''),
                'location': profile_data.get('location', '')
            }
            
        except Exception as e:
            logger.error(f"Error analyzing GitHub profile: {str(e)}")
            return None
    
    def analyze_linkedin_profile(self, linkedin_url: str) -> Optional[Dict]:
        """Analyze LinkedIn profile (Note: LinkedIn API has restrictions)"""
        try:
            # Extract profile ID from LinkedIn URL
            profile_id = linkedin_url.split('/in/')[-1].strip('/')
            
            # Note: This is a simplified implementation
            # Real LinkedIn API access requires proper authentication and permissions
            
            # For demonstration, return mock data
            # In production, you would use LinkedIn's official API or web scraping
            return {
                'profile_id': profile_id,
                'connections': 150,  # Mock data
                'endorsements': {
                    'Python': 8,
                    'JavaScript': 6,
                    'Project Management': 4,
                    'Team Leadership': 3
                },
                'skills': ['Software Development', 'Project Management', 'Data Analysis'],
                'recommendations': 2,
                'note': 'LinkedIn analysis limited due to API restrictions'
            }
            
        except Exception as e:
            logger.error(f"Error analyzing LinkedIn profile: {str(e)}")
            return None
    
    def generate_job_recommendations(self, analysis_data: Dict) -> List[Dict]:
        """Generate job recommendations based on analysis"""
        try:
            # Extract skills from analysis
            technical_skills = analysis_data.get('resume_analysis', {}).get('skills', {}).get('technical_skills', [])
            github_languages = analysis_data.get('github_analysis', {}).get('languages', [])
            
            all_skills = list(set(technical_skills + github_languages))
            
            # Job role matching logic
            job_recommendations = []
            
            # Define job roles and their required skills
            job_roles = {
                'Frontend Developer': {
                    'skills': ['JavaScript', 'React', 'HTML', 'CSS', 'Vue.js', 'Angular'],
                    'description': 'Build user interfaces and web applications using modern frontend technologies.',
                    'salary_range': '$60,000 - $90,000'
                },
                'Backend Developer': {
                    'skills': ['Python', 'Java', 'Node.js', 'SQL', 'MongoDB', 'Express.js'],
                    'description': 'Develop server-side logic, databases, and APIs for web applications.',
                    'salary_range': '$65,000 - $95,000'
                },
                'Full Stack Developer': {
                    'skills': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB'],
                    'description': 'Work on both frontend and backend development of web applications.',
                    'salary_range': '$70,000 - $100,000'
                },
                'Data Scientist': {
                    'skills': ['Python', 'R', 'SQL', 'Machine Learning', 'Pandas', 'NumPy'],
                    'description': 'Analyze complex data to help companies make strategic decisions.',
                    'salary_range': '$75,000 - $120,000'
                },
                'DevOps Engineer': {
                    'skills': ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Linux', 'Python'],
                    'description': 'Manage infrastructure and deployment processes for software applications.',
                    'salary_range': '$80,000 - $130,000'
                },
                'Mobile Developer': {
                    'skills': ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Java', 'Objective-C'],
                    'description': 'Develop mobile applications for iOS and Android platforms.',
                    'salary_range': '$65,000 - $100,000'
                }
            }
            
            # Calculate match percentage for each job role
            for job_title, job_info in job_roles.items():
                required_skills = job_info['skills']
                matching_skills = list(set(all_skills) & set(required_skills))
                match_percentage = min(100, int((len(matching_skills) / len(required_skills)) * 100) + 20)
                
                if match_percentage > 30:  # Only include jobs with decent match
                    job_recommendations.append({
                        'title': job_title,
                        'match_percentage': match_percentage,
                        'description': job_info['description'],
                        'salary_range': job_info['salary_range'],
                        'matching_skills': matching_skills,
                        'required_skills': required_skills[:5]  # Top 5 required skills
                    })
            
            # Sort by match percentage
            job_recommendations.sort(key=lambda x: x['match_percentage'], reverse=True)
            
            return job_recommendations[:4]  # Return top 4 recommendations
            
        except Exception as e:
            logger.error(f"Error generating job recommendations: {str(e)}")
            return []
    
    def calculate_career_score(self, analysis_data: Dict) -> Dict:
        """Calculate overall career readiness score"""
        try:
            scores = {}
            
            # Technical Skills Score (0-100)
            technical_skills = analysis_data.get('resume_analysis', {}).get('skills', {}).get('technical_skills', [])
            github_languages = analysis_data.get('github_analysis', {}).get('languages', [])
            total_skills = len(set(technical_skills + github_languages))
            scores['Technical Skills'] = min(100, total_skills * 10)
            
            # Education Score (based on CGPA)
            cgpa = float(analysis_data.get('user_data', {}).get('cgpa', 0))
            scores['Education'] = min(100, int((cgpa / 10) * 100))
            
            # GitHub Portfolio Score
            if analysis_data.get('github_analysis'):
                github_data = analysis_data['github_analysis']
                repo_score = min(50, github_data.get('public_repos', 0) * 5)
                project_score = min(30, len(github_data.get('top_projects', [])) * 10)
                language_score = min(20, len(github_data.get('languages', [])) * 5)
                scores['Portfolio'] = repo_score + project_score + language_score
            else:
                scores['Portfolio'] = 30
            
            # Professional Network Score (LinkedIn)
            if analysis_data.get('linkedin_analysis'):
                linkedin_data = analysis_data['linkedin_analysis']
                connection_score = min(40, linkedin_data.get('connections', 0) * 0.2)
                endorsement_score = min(30, sum(linkedin_data.get('endorsements', {}).values()) * 2)
                recommendation_score = min(30, linkedin_data.get('recommendations', 0) * 15)
                scores['Professional Network'] = connection_score + endorsement_score + recommendation_score
            else:
                scores['Professional Network'] = 40
            
            # Experience Score (basic implementation)
            experience_years = analysis_data.get('resume_analysis', {}).get('experience', {}).get('years_of_experience', 0)
            scores['Experience'] = min(100, experience_years * 25)
            
            # Calculate overall score
            overall_score = int(sum(scores.values()) / len(scores))
            
            # Generate recommendations
            recommendations = []
            if scores['Technical Skills'] < 70:
                recommendations.append("Focus on learning more in-demand technical skills")
            if scores['Portfolio'] < 60:
                recommendations.append("Build more projects and contribute to open source")
            if scores['Professional Network'] < 50:
                recommendations.append("Expand your professional network on LinkedIn")
            if scores['Experience'] < 40:
                recommendations.append("Gain practical experience through internships or projects")
            
            return {
                'overall_score': overall_score,
                'breakdown': scores,
                'recommendations': recommendations,
                'level': self._get_career_level(overall_score)
            }
            
        except Exception as e:
            logger.error(f"Error calculating career score: {str(e)}")
            return {
                'overall_score': 50,
                'breakdown': {'Technical Skills': 50, 'Education': 50, 'Portfolio': 50},
                'recommendations': ['Continue developing your skills'],
                'level': 'Developing'
            }
    
    def _get_career_level(self, score: int) -> str:
        """Determine career readiness level based on score"""
        if score >= 85:
            return "Excellent"
        elif score >= 70:
            return "Good"
        elif score >= 55:
            return "Average"
        elif score >= 40:
            return "Developing"
        else:
            return "Needs Improvement"

# Initialize analyzer
analyzer = ResumeAnalyzer()

@app.route('/api/analyze-profile', methods=['POST'])
def analyze_profile():
    """Main endpoint for analyzing user profile"""
    try:
        # Get form data
        user_data = {
            'fullName': request.form.get('fullName'),
            'dob': request.form.get('dob'),
            'college': request.form.get('college'),
            'phone': request.form.get('phone'),
            'email': request.form.get('email'),
            'cgpa': request.form.get('cgpa'),
            'linkedin': request.form.get('linkedin'),
            'github': request.form.get('github')
        }
        
        # Validate required fields
        required_fields = ['fullName', 'email', 'college', 'cgpa']
        for field in required_fields:
            if not user_data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Handle file upload
        if 'resume' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No resume file uploaded'
            }), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'No file selected'
            }), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Extract text from resume
        logger.info("Extracting text from resume...")
        resume_text = analyzer.extract_text_from_resume(file_path)
        
        # Analyze resume with AI
        logger.info("Analyzing resume with AI...")
        resume_analysis = analyzer.analyze_resume_with_ai(resume_text, user_data)
        
        # Analyze GitHub profile
        github_analysis = None
        if user_data.get('github'):
            logger.info("Analyzing GitHub profile...")
            github_analysis = analyzer.analyze_github_profile(user_data['github'])
        
        # Analyze LinkedIn profile
        linkedin_analysis = None
        if user_data.get('linkedin'):
            logger.info("Analyzing LinkedIn profile...")
            linkedin_analysis = analyzer.analyze_linkedin_profile(user_data['linkedin'])
        
        # Compile analysis data
        analysis_data = {
            'user_data': user_data,
            'resume_analysis': resume_analysis,
            'github_analysis': github_analysis,
            'linkedin_analysis': linkedin_analysis
        }
        
        # Generate job recommendations
        logger.info("Generating job recommendations...")
        job_recommendations = analyzer.generate_job_recommendations(analysis_data)
        
        # Calculate career score
        logger.info("Calculating career score...")
        career_score = analyzer.calculate_career_score(analysis_data)
        
        # Prepare response
        response_data = {
            'profileSummary': {
                'name': user_data['fullName'],
                'education': user_data['college'],
                'cgpa': user_data['cgpa'],
                'contact': {
                    'email': user_data['email'],
                    'phone': user_data['phone']
                },
                'summary': resume_analysis.get('summary', 'Profile analysis completed successfully.')
            },
            'skillsAnalysis': {
                'technicalSkills': [
                    {'name': skill, 'level': 75 + (hash(skill) % 25)}  # Mock skill levels
                    for skill in resume_analysis.get('skills', {}).get('technical_skills', [])[:8]
                ],
                'softSkills': resume_analysis.get('skills', {}).get('soft_skills', []),
                'certifications': resume_analysis.get('skills', {}).get('certifications', [])
            },
            'githubAnalysis': github_analysis,
            'linkedinAnalysis': linkedin_analysis,
            'jobRecommendations': [
                {
                    'title': job['title'],
                    'match': f"{job['match_percentage']}%",
                    'description': job['description'],
                    'skills': job['matching_skills'][:4],
                    'salaryRange': job['salary_range']
                }
                for job in job_recommendations
            ],
            'careerScore': career_score
        }
        
        # Clean up uploaded file
        try:
            os.remove(file_path)
        except Exception as e:
            logger.warning(f"Could not delete uploaded file: {str(e)}")
        
        return jsonify({
            'success': True,
            'data': response_data
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_profile: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'success': False,
        'message': 'File too large. Maximum size is 10MB.'
    }), 413

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'success': False,
        'message': 'Internal server error. Please try again later.'
    }), 500

if __name__ == '__main__':
    logger.info("Starting Resume Scanner API server...")
    app.run(debug=True, host='0.0.0.0', port=5000)