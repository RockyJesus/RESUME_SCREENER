# Text processing utilities for resume analysis
import re
import string
from typing import List, Dict, Set
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer
import spacy

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    pass

class TextProcessor:
    """Utilities for processing and analyzing text from resumes"""
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
        # Load spaCy model for advanced NLP (optional)
        try:
            self.nlp = spacy.load('en_core_web_sm')
        except OSError:
            self.nlp = None
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep important punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\-\(\)]', ' ', text)
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra spaces
        text = text.strip()
        
        return text
    
    def extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from resume text"""
        contact_info = {}
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            contact_info['email'] = emails[0]
        
        # Phone pattern (various formats)
        phone_patterns = [
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # 123-456-7890 or 123.456.7890
            r'\(\d{3}\)\s*\d{3}[-.]?\d{4}',    # (123) 456-7890
            r'\b\d{10}\b',                      # 1234567890
            r'\+\d{1,3}[-.\s]?\d{10,14}'       # International format
        ]
        
        for pattern in phone_patterns:
            phones = re.findall(pattern, text)
            if phones:
                contact_info['phone'] = phones[0]
                break
        
        # LinkedIn URL
        linkedin_pattern = r'linkedin\.com/in/[^\s]+'
        linkedin = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin:
            contact_info['linkedin'] = 'https://' + linkedin.group()
        
        # GitHub URL
        github_pattern = r'github\.com/[^\s]+'
        github = re.search(github_pattern, text, re.IGNORECASE)
        if github:
            contact_info['github'] = 'https://' + github.group()
        
        return contact_info
    
    def extract_skills(self, text: str) -> Dict[str, List[str]]:
        """Extract technical and soft skills from text"""
        # Define skill categories
        technical_skills = {
            'programming_languages': [
                'python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'swift',
                'kotlin', 'go', 'rust', 'scala', 'r', 'matlab', 'perl', 'typescript'
            ],
            'web_technologies': [
                'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express',
                'django', 'flask', 'laravel', 'spring', 'bootstrap', 'jquery'
            ],
            'databases': [
                'mysql', 'postgresql', 'mongodb', 'sqlite', 'oracle', 'redis',
                'cassandra', 'elasticsearch', 'dynamodb'
            ],
            'cloud_platforms': [
                'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean',
                'docker', 'kubernetes', 'terraform'
            ],
            'tools_frameworks': [
                'git', 'jenkins', 'docker', 'kubernetes', 'ansible', 'terraform',
                'webpack', 'babel', 'jest', 'pytest', 'selenium'
            ]
        }
        
        soft_skills = [
            'communication', 'leadership', 'teamwork', 'problem solving',
            'project management', 'time management', 'analytical thinking',
            'creativity', 'adaptability', 'attention to detail', 'critical thinking'
        ]
        
        # Extract skills from text
        text_lower = text.lower()
        found_skills = {
            'technical_skills': [],
            'soft_skills': []
        }
        
        # Find technical skills
        for category, skills in technical_skills.items():
            for skill in skills:
                if skill in text_lower:
                    found_skills['technical_skills'].append(skill.title())
        
        # Find soft skills
        for skill in soft_skills:
            if skill in text_lower:
                found_skills['soft_skills'].append(skill.title())
        
        # Remove duplicates
        found_skills['technical_skills'] = list(set(found_skills['technical_skills']))
        found_skills['soft_skills'] = list(set(found_skills['soft_skills']))
        
        return found_skills
    
    def extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education information from text"""
        education = []
        
        # Degree patterns
        degree_patterns = [
            r'\b(bachelor|master|phd|doctorate|diploma|certificate|b\.?tech|m\.?tech|mba|bba|bca|mca|b\.?sc|m\.?sc|b\.?com|m\.?com|b\.?a|m\.?a)\b',
            r'\b(undergraduate|graduate|postgraduate)\b'
        ]
        
        # Institution patterns
        institution_patterns = [
            r'\b(university|college|institute|school|academy)\b'
        ]
        
        text_lower = text.lower()
        
        # Simple extraction (can be enhanced)
        for degree_pattern in degree_patterns:
            degrees = re.finditer(degree_pattern, text_lower)
            for degree_match in degrees:
                start_pos = max(0, degree_match.start() - 100)
                end_pos = min(len(text), degree_match.end() + 100)
                context = text[start_pos:end_pos]
                
                education.append({
                    'degree': degree_match.group().title(),
                    'context': context.strip()
                })
        
        return education
    
    def extract_experience(self, text: str) -> List[Dict[str, str]]:
        """Extract work experience from text"""
        experience = []
        
        # Experience keywords
        experience_keywords = [
            'experience', 'work', 'employment', 'position', 'role',
            'job', 'career', 'professional', 'intern', 'internship'
        ]
        
        # Company/organization patterns
        company_patterns = [
            r'\b(inc|corp|corporation|company|ltd|llc|pvt|private|limited)\b'
        ]
        
        # Time period patterns
        time_patterns = [
            r'\b(20\d{2})\b',  # Years like 2020, 2021
            r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b',  # Months
            r'\b(\d{1,2})\s+(years?|months?)\b'  # Duration
        ]
        
        # Simple experience extraction
        sentences = sent_tokenize(text)
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Check if sentence contains experience keywords
            if any(keyword in sentence_lower for keyword in experience_keywords):
                # Extract time information
                times = []
                for pattern in time_patterns:
                    times.extend(re.findall(pattern, sentence_lower))
                
                if times:  # Only include if we found time-related information
                    experience.append({
                        'description': sentence.strip(),
                        'timeframe': ', '.join(set(times))
                    })
        
        return experience[:5]  # Return top 5 experience items
    
    def extract_projects(self, text: str) -> List[str]:
        """Extract project information from text"""
        projects = []
        
        # Project keywords
        project_keywords = [
            'project', 'developed', 'built', 'created', 'designed',
            'implemented', 'application', 'system', 'website', 'app'
        ]
        
        sentences = sent_tokenize(text)
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Check if sentence contains project keywords
            if any(keyword in sentence_lower for keyword in project_keywords):
                if len(sentence) > 20:  # Filter out very short sentences
                    projects.append(sentence.strip())
        
        return projects[:5]  # Return top 5 projects
    
    def calculate_text_complexity(self, text: str) -> Dict[str, float]:
        """Calculate various text complexity metrics"""
        words = word_tokenize(text)
        sentences = sent_tokenize(text)
        
        if not words or not sentences:
            return {
                'avg_words_per_sentence': 0,
                'avg_word_length': 0,
                'vocabulary_diversity': 0,
                'total_words': 0,
                'total_sentences': 0
            }
        
        # Calculate metrics
        avg_words_per_sentence = len(words) / len(sentences)
        avg_word_length = sum(len(word) for word in words) / len(words)
        unique_words = set(word.lower() for word in words if word.isalpha())
        vocabulary_diversity = len(unique_words) / len(words) if words else 0
        
        return {
            'avg_words_per_sentence': round(avg_words_per_sentence, 2),
            'avg_word_length': round(avg_word_length, 2),
            'vocabulary_diversity': round(vocabulary_diversity, 3),
            'total_words': len(words),
            'total_sentences': len(sentences)
        }
    
    def get_key_phrases(self, text: str, num_phrases: int = 10) -> List[str]:
        """Extract key phrases from text using simple n-gram analysis"""
        if self.nlp:
            return self._extract_phrases_with_spacy(text, num_phrases)
        else:
            return self._extract_phrases_simple(text, num_phrases)
    
    def _extract_phrases_with_spacy(self, text: str, num_phrases: int) -> List[str]:
        """Extract phrases using spaCy NLP"""
        doc = self.nlp(text)
        
        # Extract noun phrases
        phrases = []
        for chunk in doc.noun_chunks:
            phrase = chunk.text.lower().strip()
            if len(phrase) > 5 and phrase not in phrases:
                phrases.append(phrase)
        
        return phrases[:num_phrases]
    
    def _extract_phrases_simple(self, text: str, num_phrases: int) -> List[str]:
        """Simple phrase extraction using word frequency"""
        # Clean and tokenize
        words = word_tokenize(self.clean_text(text))
        words = [word for word in words if word.isalpha() and word not in self.stop_words]
        
        # Create bigrams and trigrams
        bigrams = [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]
        trigrams = [f"{words[i]} {words[i+1]} {words[i+2]}" for i in range(len(words)-2)]
        
        # Count frequencies
        from collections import Counter
        all_phrases = bigrams + trigrams
        phrase_counts = Counter(all_phrases)
        
        # Return most common phrases
        return [phrase for phrase, count in phrase_counts.most_common(num_phrases)]