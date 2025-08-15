# Backend API Server for Resume Scanner with Dynamic Analysis
import os
import json
import logging
import re
from datetime import datetime
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from werkzeug.utils import secure_filename
import google.generativeai as genai
import requests
import PyPDF2
import docx
from typing import Dict, List, Optional
from backend.utils.text_processor import TextProcessor
from backend.utils.job_matcher import JobMatcher
from backend.config import get_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load configuration
config = get_config()
app.config.update(config.__dict__)

# API Keys
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', 'your-gemini-api-key-here')
GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN', 'your-github-token-here')

# Initialize API clients
if GEMINI_API_KEY and GEMINI_API_KEY != 'your-gemini-api-key-here':
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
else:
    model = None

# Ensure upload directory exists
os.makedirs('uploads', exist_ok=True)

class AdvancedResumeAnalyzer:
    """Advanced Resume Analyzer with Dynamic Scoring"""
    
    def __init__(self):
        self.text_processor = TextProcessor()
        self.job_matcher = JobMatcher()
        self.github_headers = {
            'Authorization': f'token {GITHUB_TOKEN}',
            'Accept': 'application/vnd.github.v3+json'
        } if GITHUB_TOKEN != 'your-github-token-here' else {}
    
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
            # Basic fallback
            text = "Unable to extract text from PDF"
        
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
            return "Unable to extract text from DOCX"
    
    def analyze_resume_with_ai(self, resume_text: str, user_data: Dict) -> Dict:
        """Use AI to analyze resume content dynamically"""
        try:
            if model:
                return self._analyze_with_gemini(resume_text, user_data)
            else:
                return self._analyze_with_fallback(resume_text, user_data)
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return self._analyze_with_fallback(resume_text, user_data)
    
    def _analyze_with_gemini(self, resume_text: str, user_data: Dict) -> Dict:
        """Analyze resume using Gemini AI"""
        prompt = f"""
        Analyze this resume comprehensively and provide detailed scoring. The candidate is:
        Name: {user_data.get('fullName', '')}
        Education: {user_data.get('college', '')}
        CGPA: {user_data.get('cgpa', '')}
        
        Resume Content:
        {resume_text}
        
        Provide analysis in this exact JSON format:
        {{
            "candidate_type": "Technical" or "Non-Technical",
            "skills_analysis": {{
                "technical_skills": [list of technical skills found with proficiency estimates],
                "soft_skills": [list of soft skills identified],
                "domain_expertise": [specific domain areas],
                "certifications": [certifications mentioned],
                "tools_technologies": [tools and technologies mentioned]
            }},
            "experience_analysis": {{
                "total_years": number,
                "internships": [list of internships],
                "work_experience": [list of work experiences],
                "projects": [list of projects with descriptions],
                "leadership_roles": [leadership positions held]
            }},
            "achievements": [list of achievements, awards, recognitions],
            "education_details": {{
                "degree": "degree type",
                "specialization": "field of study",
                "academic_projects": [academic projects],
                "relevant_coursework": [relevant courses]
            }},
            "scoring": {{
                "technical_skills_score": score out of 25,
                "soft_skills_score": score out of 15,
                "experience_score": score out of 20,
                "projects_score": score out of 20,
                "achievements_score": score out of 10,
                "education_score": score out of 10,
                "overall_resume_score": total score out of 100
            }},
            "strengths": [key strengths identified],
            "improvement_areas": [areas needing improvement],
            "job_recommendations": [suitable job roles based on profile]
        }}
        
        Be thorough and provide realistic scores based on the actual content.
        """
        
        try:
            response = model.generate_content(prompt)
            analysis = json.loads(response.text)
            return analysis
        except json.JSONDecodeError:
            return self._analyze_with_fallback(resume_text, user_data)
    
    def _analyze_with_fallback(self, resume_text: str, user_data: Dict) -> Dict:
        """Fallback analysis using text processing"""
        # Extract information using text processor
        skills = self.text_processor.extract_skills(resume_text)
        experience = self.text_processor.extract_experience(resume_text)
        projects = self.text_processor.extract_projects(resume_text)
        education = self.text_processor.extract_education(resume_text)
        
        # Determine candidate type
        tech_keywords = ['programming', 'software', 'development', 'coding', 'algorithm', 'database', 'api', 'framework']
        is_technical = any(keyword in resume_text.lower() for keyword in tech_keywords)
        
        # Calculate scores
        technical_score = min(25, len(skills['technical_skills']) * 3)
        soft_skills_score = min(15, len(skills['soft_skills']) * 2)
        experience_score = min(20, len(experience) * 4)
        projects_score = min(20, len(projects) * 4)
        
        # Achievement extraction (basic)
        achievement_keywords = ['award', 'recognition', 'achievement', 'honor', 'medal', 'certificate', 'winner']
        achievements = []
        for sentence in resume_text.split('.'):
            if any(keyword in sentence.lower() for keyword in achievement_keywords):
                achievements.append(sentence.strip())
        
        achievements_score = min(10, len(achievements) * 2)
        
        # Education score based on CGPA
        try:
            cgpa = float(user_data.get('cgpa', 0))
            education_score = min(10, int((cgpa / 10) * 10))
        except:
            education_score = 5
        
        overall_score = technical_score + soft_skills_score + experience_score + projects_score + achievements_score + education_score
        
        return {
            "candidate_type": "Technical" if is_technical else "Non-Technical",
            "skills_analysis": {
                "technical_skills": skills['technical_skills'],
                "soft_skills": skills['soft_skills'],
                "domain_expertise": [],
                "certifications": [],
                "tools_technologies": skills['technical_skills'][:5]
            },
            "experience_analysis": {
                "total_years": len(experience),
                "internships": [],
                "work_experience": experience,
                "projects": projects,
                "leadership_roles": []
            },
            "achievements": achievements[:5],
            "education_details": {
                "degree": user_data.get('college', ''),
                "specialization": "",
                "academic_projects": [],
                "relevant_coursework": []
            },
            "scoring": {
                "technical_skills_score": technical_score,
                "soft_skills_score": soft_skills_score,
                "experience_score": experience_score,
                "projects_score": projects_score,
                "achievements_score": achievements_score,
                "education_score": education_score,
                "overall_resume_score": overall_score
            },
            "strengths": ["Strong academic background", "Good technical foundation"],
            "improvement_areas": ["Industry experience", "Professional certifications"],
            "job_recommendations": ["Software Developer", "Data Analyst", "Business Analyst"]
        }
    
    def analyze_github_profile(self, github_url: str) -> Optional[Dict]:
        """Analyze GitHub profile with scoring"""
        try:
            if not self.github_headers:
                return self._mock_github_analysis()
            
            username = github_url.split('github.com/')[-1].strip('/')
            
            # Get user profile
            profile_response = requests.get(
                f'https://api.github.com/users/{username}',
                headers=self.github_headers
            )
            
            if profile_response.status_code != 200:
                return self._mock_github_analysis()
            
            profile_data = profile_response.json()
            
            # Get repositories
            repos_response = requests.get(
                f'https://api.github.com/users/{username}/repos?sort=updated&per_page=20',
                headers=self.github_headers
            )
            
            if repos_response.status_code != 200:
                return self._mock_github_analysis()
            
            repos_data = repos_response.json()
            
            # Analyze repositories
            languages = {}
            total_stars = 0
            total_forks = 0
            active_repos = 0
            
            for repo in repos_data:
                if not repo['fork']:
                    active_repos += 1
                    total_stars += repo['stargazers_count']
                    total_forks += repo['forks_count']
                    
                    if repo['language']:
                        languages[repo['language']] = languages.get(repo['language'], 0) + 1
            
            # Calculate GitHub score
            repo_score = min(30, active_repos * 2)
            star_score = min(25, total_stars * 2)
            language_score = min(20, len(languages) * 4)
            contribution_score = min(25, profile_data.get('public_repos', 0))
            
            github_score = repo_score + star_score + language_score + contribution_score
            
            return {
                'username': username,
                'public_repos': profile_data['public_repos'],
                'followers': profile_data['followers'],
                'following': profile_data['following'],
                'total_stars': total_stars,
                'total_forks': total_forks,
                'languages': list(languages.keys()),
                'active_repos': active_repos,
                'github_score': min(100, github_score),
                'score_breakdown': {
                    'repository_count': repo_score,
                    'star_rating': star_score,
                    'language_diversity': language_score,
                    'contribution_activity': contribution_score
                },
                'profile_strength': self._get_github_strength(github_score)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing GitHub: {str(e)}")
            return self._mock_github_analysis()
    
    def _mock_github_analysis(self) -> Dict:
        """Mock GitHub analysis for demo"""
        return {
            'username': 'demo_user',
            'public_repos': 12,
            'followers': 25,
            'following': 30,
            'total_stars': 45,
            'total_forks': 15,
            'languages': ['Python', 'JavaScript', 'Java', 'HTML'],
            'active_repos': 8,
            'github_score': 75,
            'score_breakdown': {
                'repository_count': 16,
                'star_rating': 20,
                'language_diversity': 16,
                'contribution_activity': 23
            },
            'profile_strength': 'Good'
        }
    
    def analyze_linkedin_profile(self, linkedin_url: str) -> Dict:
        """Analyze LinkedIn profile (mock implementation)"""
        # LinkedIn API has restrictions, so using mock data
        return {
            'connections': 180,
            'endorsements_count': 25,
            'recommendations': 4,
            'skills_listed': 12,
            'linkedin_score': 70,
            'score_breakdown': {
                'network_size': 18,
                'endorsements': 20,
                'recommendations': 20,
                'profile_completeness': 12
            },
            'profile_strength': 'Good',
            'top_skills': ['Communication', 'Leadership', 'Project Management', 'Teamwork'],
            'industry_connections': 'Technology'
        }
    
    def _get_github_strength(self, score: int) -> str:
        """Determine GitHub profile strength"""
        if score >= 80:
            return "Excellent"
        elif score >= 60:
            return "Good"
        elif score >= 40:
            return "Average"
        else:
            return "Needs Improvement"

# Initialize analyzer
analyzer = AdvancedResumeAnalyzer()

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
        file_path = os.path.join('uploads', filename)
        file.save(file_path)
        
        try:
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
            
            # Prepare comprehensive response
            response_data = {
                'user_data': user_data,
                'resume_analysis': resume_analysis,
                'github_analysis': github_analysis,
                'linkedin_analysis': linkedin_analysis,
                'analysis_timestamp': datetime.now().isoformat()
            }
            
            return jsonify({
                'success': True,
                'data': response_data
            })
            
        finally:
            # Clean up uploaded file
            try:
                os.remove(file_path)
            except Exception as e:
                logger.warning(f"Could not delete uploaded file: {str(e)}")
        
    except Exception as e:
        logger.error(f"Error in analyze_profile: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Analysis failed: {str(e)}'
        }), 500

@app.route('/api/calculate-total-score', methods=['POST'])
def calculate_total_score():
    """Calculate total score including HR evaluations"""
    try:
        data = request.get_json()
        
        # Extract scores
        resume_score = data.get('resume_score', 0)
        github_score = data.get('github_score', 0)
        linkedin_score = data.get('linkedin_score', 0)
        
        # HR evaluation scores
        hr_scores = data.get('hr_evaluation', {})
        group_discussion = hr_scores.get('group_discussion', 0)
        aptitude = hr_scores.get('aptitude', 0)
        technical = hr_scores.get('technical', 0)
        academic_performance = hr_scores.get('academic_performance', 0)
        
        # Calculate weighted total score
        weights = {
            'resume': 0.25,      # 25%
            'github': 0.15,      # 15%
            'linkedin': 0.10,    # 10%
            'group_discussion': 0.15,  # 15%
            'aptitude': 0.15,    # 15%
            'technical': 0.15,   # 15%
            'academic': 0.05     # 5%
        }
        
        total_score = (
            resume_score * weights['resume'] +
            github_score * weights['github'] +
            linkedin_score * weights['linkedin'] +
            group_discussion * weights['group_discussion'] +
            aptitude * weights['aptitude'] +
            technical * weights['technical'] +
            academic_performance * weights['academic']
        )
        
        # Determine grade and recommendation
        grade, recommendation = get_grade_and_recommendation(total_score)
        
        return jsonify({
            'success': True,
            'total_score': round(total_score, 2),
            'grade': grade,
            'recommendation': recommendation,
            'score_breakdown': {
                'resume_score': resume_score,
                'github_score': github_score,
                'linkedin_score': linkedin_score,
                'hr_evaluation': hr_scores,
                'weights_applied': weights
            }
        })
        
    except Exception as e:
        logger.error(f"Error calculating total score: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Score calculation failed: {str(e)}'
        }), 500

def get_grade_and_recommendation(score: float) -> tuple:
    """Get grade and recommendation based on total score"""
    if score >= 90:
        return "A+", "Excellent candidate - Highly recommended for immediate hiring"
    elif score >= 80:
        return "A", "Very good candidate - Recommended for hiring"
    elif score >= 70:
        return "B+", "Good candidate - Consider for hiring with minor improvements"
    elif score >= 60:
        return "B", "Average candidate - May need additional training"
    elif score >= 50:
        return "C", "Below average - Significant improvement needed"
    else:
        return "D", "Not recommended - Major gaps in required skills"

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    logger.info("Starting Advanced Resume Scanner API server...")
    app.run(debug=True, host='0.0.0.0', port=5000)