# Job matching and recommendation utilities
import json
from typing import List, Dict, Tuple
from dataclasses import dataclass
import math

@dataclass
class JobRole:
    """Data class for job role information"""
    title: str
    category: str
    required_skills: List[str]
    preferred_skills: List[str]
    description: str
    salary_range: str
    experience_level: str
    growth_potential: str

class JobMatcher:
    """Advanced job matching and recommendation system"""
    
    def __init__(self):
        self.job_database = self._load_job_database()
        self.skill_weights = self._load_skill_weights()
    
    def _load_job_database(self) -> List[JobRole]:
        """Load comprehensive job database"""
        jobs = [
            JobRole(
                title="Frontend Developer",
                category="Web Development",
                required_skills=["HTML", "CSS", "JavaScript"],
                preferred_skills=["React", "Vue.js", "Angular", "TypeScript", "SASS", "Webpack"],
                description="Create responsive and interactive user interfaces using modern web technologies.",
                salary_range="$55,000 - $95,000",
                experience_level="Entry to Mid-level",
                growth_potential="High"
            ),
            JobRole(
                title="Backend Developer",
                category="Web Development",
                required_skills=["Python", "Java", "Node.js", "SQL"],
                preferred_skills=["Django", "Flask", "Spring Boot", "MongoDB", "Redis", "Docker"],
                description="Develop server-side applications, APIs, and manage databases.",
                salary_range="$60,000 - $100,000",
                experience_level="Entry to Mid-level",
                growth_potential="High"
            ),
            JobRole(
                title="Full Stack Developer",
                category="Web Development",
                required_skills=["JavaScript", "HTML", "CSS", "Node.js", "SQL"],
                preferred_skills=["React", "Express.js", "MongoDB", "Git", "AWS", "Docker"],
                description="Work on both frontend and backend development of web applications.",
                salary_range="$65,000 - $110,000",
                experience_level="Mid-level",
                growth_potential="Very High"
            ),
            JobRole(
                title="Data Scientist",
                category="Data Science",
                required_skills=["Python", "R", "SQL", "Statistics"],
                preferred_skills=["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Jupyter", "Tableau"],
                description="Analyze complex data to extract insights and build predictive models.",
                salary_range="$70,000 - $130,000",
                experience_level="Mid to Senior-level",
                growth_potential="Very High"
            ),
            JobRole(
                title="Data Analyst",
                category="Data Science",
                required_skills=["SQL", "Excel", "Statistics"],
                preferred_skills=["Python", "R", "Tableau", "Power BI", "Google Analytics"],
                description="Analyze data to help organizations make data-driven decisions.",
                salary_range="$50,000 - $85,000",
                experience_level="Entry to Mid-level",
                growth_potential="High"
            ),
            JobRole(
                title="Machine Learning Engineer",
                category="AI/ML",
                required_skills=["Python", "Machine Learning", "TensorFlow", "PyTorch"],
                preferred_skills=["Keras", "Docker", "Kubernetes", "AWS", "MLOps", "Git"],
                description="Design and implement machine learning systems and algorithms.",
                salary_range="$80,000 - $150,000",
                experience_level="Mid to Senior-level",
                growth_potential="Exceptional"
            ),
            JobRole(
                title="DevOps Engineer",
                category="Infrastructure",
                required_skills=["Linux", "Docker", "Kubernetes", "CI/CD"],
                preferred_skills=["AWS", "Azure", "Terraform", "Jenkins", "Ansible", "Python"],
                description="Manage infrastructure, deployment pipelines, and system reliability.",
                salary_range="$75,000 - $140,000",
                experience_level="Mid to Senior-level",
                growth_potential="Very High"
            ),
            JobRole(
                title="Mobile App Developer",
                category="Mobile Development",
                required_skills=["Swift", "Kotlin", "Java"],
                preferred_skills=["React Native", "Flutter", "Xamarin", "Firebase", "REST APIs"],
                description="Develop mobile applications for iOS and Android platforms.",
                salary_range="$60,000 - $110,000",
                experience_level="Entry to Mid-level",
                growth_potential="High"
            ),
            JobRole(
                title="Cybersecurity Analyst",
                category="Security",
                required_skills=["Network Security", "Risk Assessment", "Incident Response"],
                preferred_skills=["Python", "CISSP", "Ethical Hacking", "Penetration Testing", "SIEM"],
                description="Protect organizational systems and data from security threats.",
                salary_range="$65,000 - $120,000",
                experience_level="Entry to Mid-level",
                growth_potential="Very High"
            ),
            JobRole(
                title="Cloud Architect",
                category="Cloud Computing",
                required_skills=["AWS", "Azure", "Cloud Architecture", "System Design"],
                preferred_skills=["Terraform", "Kubernetes", "Microservices", "API Design", "Security"],
                description="Design and implement scalable cloud infrastructure solutions.",
                salary_range="$100,000 - $180,000",
                experience_level="Senior-level",
                growth_potential="Exceptional"
            ),
            JobRole(
                title="Product Manager",
                category="Product Management",
                required_skills=["Product Strategy", "Market Research", "Analytics"],
                preferred_skills=["Agile", "SQL", "A/B Testing", "User Experience", "Stakeholder Management"],
                description="Guide product development from conception to launch and optimization.",
                salary_range="$80,000 - $160,000",
                experience_level="Mid to Senior-level",
                growth_potential="Very High"
            ),
            JobRole(
                title="UX/UI Designer",
                category="Design",
                required_skills=["User Research", "Wireframing", "Prototyping"],
                preferred_skills=["Figma", "Sketch", "Adobe Creative Suite", "HTML/CSS", "JavaScript"],
                description="Design user-centered interfaces and experiences for digital products.",
                salary_range="$55,000 - $100,000",
                experience_level="Entry to Mid-level",
                growth_potential="High"
            ),
            JobRole(
                title="Software Engineer",
                category="Software Development",
                required_skills=["Programming", "Problem Solving", "Data Structures"],
                preferred_skills=["Java", "Python", "C++", "Git", "Agile", "Testing"],
                description="Design, develop, and maintain software applications and systems.",
                salary_range="$70,000 - $130,000",
                experience_level="Entry to Senior-level",
                growth_potential="Very High"
            ),
            JobRole(
                title="Business Analyst",
                category="Business Analysis",
                required_skills=["Requirements Analysis", "Process Modeling", "Stakeholder Management"],
                preferred_skills=["SQL", "Excel", "Tableau", "Agile", "Project Management"],
                description="Bridge the gap between business needs and technical solutions.",
                salary_range="$60,000 - $100,000",
                experience_level="Entry to Mid-level",
                growth_potential="High"
            ),
            JobRole(
                title="Quality Assurance Engineer",
                category="Testing",
                required_skills=["Manual Testing", "Test Planning", "Bug Tracking"],
                preferred_skills=["Selenium", "Python", "Java", "API Testing", "Automation"],
                description="Ensure software quality through comprehensive testing strategies.",
                salary_range="$50,000 - $90,000",
                experience_level="Entry to Mid-level",
                growth_potential="Moderate"
            )
        ]
        
        return jobs
    
    def _load_skill_weights(self) -> Dict[str, float]:
        """Load weights for different skills based on market demand"""
        return {
            # Programming Languages
            "Python": 1.0,
            "JavaScript": 0.95,
            "Java": 0.9,
            "TypeScript": 0.85,
            "Go": 0.8,
            "Rust": 0.75,
            "C++": 0.85,
            "C#": 0.8,
            "Swift": 0.75,
            "Kotlin": 0.75,
            
            # Web Technologies
            "React": 0.9,
            "Angular": 0.8,
            "Vue.js": 0.75,
            "Node.js": 0.85,
            "Express.js": 0.7,
            "Django": 0.8,
            "Flask": 0.75,
            
            # Cloud & DevOps
            "AWS": 1.0,
            "Azure": 0.85,
            "Docker": 0.9,
            "Kubernetes": 0.85,
            "Terraform": 0.8,
            
            # Databases
            "SQL": 0.9,
            "MongoDB": 0.75,
            "PostgreSQL": 0.8,
            "Redis": 0.7,
            
            # Data Science & AI
            "Machine Learning": 0.95,
            "TensorFlow": 0.85,
            "PyTorch": 0.8,
            "Pandas": 0.8,
            "NumPy": 0.75,
            
            # Default weight for unlisted skills
            "default": 0.6
        }
    
    def calculate_job_match(self, candidate_profile: Dict, job_role: JobRole) -> Dict[str, float]:
        """Calculate comprehensive job match score"""
        scores = {}
        
        # Extract candidate data
        technical_skills = set(skill.lower() for skill in candidate_profile.get('technical_skills', []))
        soft_skills = set(skill.lower() for skill in candidate_profile.get('soft_skills', []))
        experience_years = candidate_profile.get('experience_years', 0)
        education_level = candidate_profile.get('education_level', 'bachelor')
        github_projects = candidate_profile.get('github_projects', 0)
        
        # 1. Technical Skills Match (40% weight)
        required_skills = set(skill.lower() for skill in job_role.required_skills)
        preferred_skills = set(skill.lower() for skill in job_role.preferred_skills)
        
        required_matches = technical_skills.intersection(required_skills)
        preferred_matches = technical_skills.intersection(preferred_skills)
        
        required_score = len(required_matches) / len(required_skills) if required_skills else 0
        preferred_score = len(preferred_matches) / len(preferred_skills) if preferred_skills else 0
        
        # Apply skill weights
        weighted_required_score = sum(
            self.skill_weights.get(skill.title(), self.skill_weights['default'])
            for skill in required_matches
        ) / len(required_skills) if required_skills else 0
        
        technical_score = (weighted_required_score * 0.7) + (preferred_score * 0.3)
        scores['technical_skills'] = min(1.0, technical_score)
        
        # 2. Experience Level Match (25% weight)
        experience_mapping = {
            'entry': (0, 2),
            'mid': (2, 5),
            'senior': (5, 10)
        }
        
        job_exp_level = job_role.experience_level.lower()
        if 'entry' in job_exp_level:
            target_range = experience_mapping['entry']
        elif 'senior' in job_exp_level:
            target_range = experience_mapping['senior']
        else:
            target_range = experience_mapping['mid']
        
        if target_range[0] <= experience_years <= target_range[1]:
            experience_score = 1.0
        elif experience_years < target_range[0]:
            experience_score = max(0.3, experience_years / target_range[0])
        else:
            experience_score = max(0.7, target_range[1] / experience_years)
        
        scores['experience'] = experience_score
        
        # 3. Education Match (15% weight)
        education_scores = {
            'high school': 0.3,
            'associate': 0.5,
            'bachelor': 0.8,
            'master': 1.0,
            'phd': 1.0
        }
        
        education_score = education_scores.get(education_level.lower(), 0.5)
        scores['education'] = education_score
        
        # 4. Portfolio/Projects Match (10% weight)
        project_score = min(1.0, github_projects / 5) if github_projects > 0 else 0.3
        scores['portfolio'] = project_score
        
        # 5. Soft Skills Match (10% weight)
        important_soft_skills = {
            'communication', 'teamwork', 'problem solving', 'leadership',
            'time management', 'adaptability', 'critical thinking'
        }
        
        soft_skill_matches = soft_skills.intersection(important_soft_skills)
        soft_skill_score = len(soft_skill_matches) / len(important_soft_skills)
        scores['soft_skills'] = soft_skill_score
        
        return scores
    
    def get_job_recommendations(
        self, 
        candidate_profile: Dict, 
        max_recommendations: int = 5,
        min_score_threshold: float = 0.3
    ) -> List[Dict]:
        """Get personalized job recommendations"""
        
        recommendations = []
        
        for job_role in self.job_database:
            # Calculate match scores
            match_scores = self.calculate_job_match(candidate_profile, job_role)
            
            # Calculate weighted overall score
            weights = {
                'technical_skills': 0.4,
                'experience': 0.25,
                'education': 0.15,
                'portfolio': 0.1,
                'soft_skills': 0.1
            }
            
            overall_score = sum(
                match_scores[category] * weight 
                for category, weight in weights.items()
            )
            
            # Only include jobs above threshold
            if overall_score >= min_score_threshold:
                # Calculate confidence level
                confidence = self._calculate_confidence(match_scores, overall_score)
                
                # Generate personalized feedback
                feedback = self._generate_feedback(match_scores, job_role, candidate_profile)
                
                recommendation = {
                    'title': job_role.title,
                    'category': job_role.category,
                    'match_percentage': int(overall_score * 100),
                    'confidence': confidence,
                    'description': job_role.description,
                    'salary_range': job_role.salary_range,
                    'experience_level': job_role.experience_level,
                    'growth_potential': job_role.growth_potential,
                    'required_skills': job_role.required_skills[:5],
                    'preferred_skills': job_role.preferred_skills[:5],
                    'match_breakdown': {
                        category: int(score * 100) 
                        for category, score in match_scores.items()
                    },
                    'feedback': feedback,
                    'next_steps': self._generate_next_steps(match_scores, job_role)
                }
                
                recommendations.append(recommendation)
        
        # Sort by match percentage and confidence
        recommendations.sort(
            key=lambda x: (x['match_percentage'], x['confidence']), 
            reverse=True
        )
        
        return recommendations[:max_recommendations]
    
    def _calculate_confidence(self, match_scores: Dict[str, float], overall_score: float) -> str:
        """Calculate confidence level for recommendation"""
        tech_score = match_scores.get('technical_skills', 0)
        exp_score = match_scores.get('experience', 0)
        
        if overall_score >= 0.8 and tech_score >= 0.7:
            return "Very High"
        elif overall_score >= 0.6 and tech_score >= 0.5:
            return "High"
        elif overall_score >= 0.4:
            return "Medium"
        else:
            return "Low"
    
    def _generate_feedback(
        self, 
        match_scores: Dict[str, float], 
        job_role: JobRole, 
        candidate_profile: Dict
    ) -> Dict[str, str]:
        """Generate personalized feedback for job match"""
        feedback = {
            'strengths': [],
            'areas_to_improve': [],
            'recommendations': []
        }
        
        # Analyze strengths
        if match_scores['technical_skills'] >= 0.7:
            feedback['strengths'].append("Strong technical skill match")
        if match_scores['experience'] >= 0.8:
            feedback['strengths'].append("Excellent experience level alignment")
        if match_scores['portfolio'] >= 0.6:
            feedback['strengths'].append("Good project portfolio")
        
        # Identify improvement areas
        if match_scores['technical_skills'] < 0.5:
            missing_skills = set(skill.lower() for skill in job_role.required_skills) - \
                           set(skill.lower() for skill in candidate_profile.get('technical_skills', []))
            feedback['areas_to_improve'].append(
                f"Strengthen technical skills, particularly: {', '.join(list(missing_skills)[:3])}"
            )
        
        if match_scores['experience'] < 0.4:
            feedback['areas_to_improve'].append("Gain more relevant work experience")
        
        if match_scores['portfolio'] < 0.4:
            feedback['areas_to_improve'].append("Build more projects to showcase skills")
        
        # Generate recommendations
        if job_role.category == "Data Science" and match_scores['technical_skills'] < 0.6:
            feedback['recommendations'].append("Consider taking online courses in data science and analytics")
        
        if match_scores['experience'] < 0.5:
            feedback['recommendations'].append("Look for internships or entry-level positions to gain experience")
        
        return feedback
    
    def _generate_next_steps(self, match_scores: Dict[str, float], job_role: JobRole) -> List[str]:
        """Generate actionable next steps for the candidate"""
        next_steps = []
        
        if match_scores['technical_skills'] >= 0.7:
            next_steps.append("Start applying to positions - your technical skills are a great match!")
        elif match_scores['technical_skills'] >= 0.4:
            next_steps.append("Focus on learning the specific technologies mentioned in job requirements")
        else:
            next_steps.append("Build foundational skills in the key technologies for this role")
        
        if match_scores['portfolio'] < 0.6:
            next_steps.append("Create 2-3 projects that demonstrate your skills in this domain")
        
        if match_scores['experience'] < 0.4:
            next_steps.append("Consider internships, freelance work, or contributing to open source projects")
        
        # Role-specific advice
        if job_role.category == "Web Development":
            next_steps.append("Build a personal portfolio website showcasing your projects")
        elif job_role.category == "Data Science":
            next_steps.append("Participate in Kaggle competitions to demonstrate your analytical skills")
        elif job_role.category == "Mobile Development":
            next_steps.append("Publish apps to app stores to show real-world development experience")
        
        return next_steps[:4]  # Return top 4 next steps
    
    def analyze_skill_gaps(self, candidate_profile: Dict, target_jobs: List[str] = None) -> Dict:
        """Analyze skill gaps for target job roles"""
        if target_jobs:
            target_roles = [job for job in self.job_database if job.title in target_jobs]
        else:
            # Use top recommended jobs
            recommendations = self.get_job_recommendations(candidate_profile, max_recommendations=3)
            target_roles = [
                job for job in self.job_database 
                if job.title in [rec['title'] for rec in recommendations]
            ]
        
        candidate_skills = set(skill.lower() for skill in candidate_profile.get('technical_skills', []))
        
        skill_gap_analysis = {
            'missing_skills': {},
            'recommended_learning_path': [],
            'priority_skills': [],
            'estimated_learning_time': {}
        }
        
        all_required_skills = set()
        all_preferred_skills = set()
        
        for role in target_roles:
            all_required_skills.update(skill.lower() for skill in role.required_skills)
            all_preferred_skills.update(skill.lower() for skill in role.preferred_skills)
        
        missing_required = all_required_skills - candidate_skills
        missing_preferred = all_preferred_skills - candidate_skills
        
        skill_gap_analysis['missing_skills'] = {
            'required': list(missing_required),
            'preferred': list(missing_preferred)
        }
        
        # Prioritize skills based on frequency and weights
        skill_priority = {}
        for skill in missing_required:
            skill_priority[skill] = self.skill_weights.get(skill.title(), self.skill_weights['default']) * 2
        
        for skill in missing_preferred:
            skill_priority[skill] = skill_priority.get(skill, 0) + self.skill_weights.get(skill.title(), self.skill_weights['default'])
        
        # Sort by priority
        priority_skills = sorted(skill_priority.items(), key=lambda x: x[1], reverse=True)
        skill_gap_analysis['priority_skills'] = [skill for skill, _ in priority_skills[:8]]
        
        return skill_gap_analysis