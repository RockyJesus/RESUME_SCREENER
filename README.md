# 🧠 AI Resume Scanner & Career Advisor

A comprehensive resume analysis application that uses AI to evaluate resumes, analyze GitHub and LinkedIn profiles, and provide personalized career recommendations.

## 🌟 Features

### Frontend
- **Responsive Design**: Modern, mobile-friendly interface
- **Smart Form Validation**: Real-time validation with helpful error messages
- **Drag & Drop Upload**: Easy resume file upload with preview
- **Interactive Results**: Beautiful data visualization and insights
- **Progress Tracking**: Visual feedback during analysis process

### Backend
- **AI-Powered Analysis**: Google Gemini AI for intelligent resume parsing
- **Multi-Platform Integration**: GitHub and LinkedIn profile analysis
- **Advanced Text Processing**: Extract skills, experience, and projects
- **Job Matching Algorithm**: Sophisticated matching based on skills and experience
- **Career Scoring**: Comprehensive career readiness assessment

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- Modern web browser

### Frontend Setup

1. **Open the project**
   - The frontend files are already configured and ready to use
   - Open `index.html` in your browser or use a local server

2. **Local Development Server** (Recommended)
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using Live Server (VS Code extension)
   # Right-click index.html -> Open with Live Server
   ```

### Backend Setup

1. **Install Python Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your API keys
   ```

3. **Required API Keys**
   - **Google Gemini API**: Get from [Google AI Studio](https://aistudio.google.com/)
   - **GitHub Token**: Create at [GitHub Settings](https://github.com/settings/tokens)
   - **LinkedIn API**: Limited access - see [LinkedIn Developers](https://developer.linkedin.com/)

4. **Run the Backend Server**
   ```bash
   python app.py
   ```
   The server will start on `http://localhost:5000`

## 🔧 Configuration

### API Keys Setup

1. **Google Gemini API**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new project and generate an API key
   - Add to `.env`: `GEMINI_API_KEY=your_api_key_here`

2. **GitHub Token**
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` and `user` scopes
   - Add to `.env`: `GITHUB_TOKEN=your_token_here`

3. **LinkedIn API** (Optional)
   - LinkedIn has restricted API access for new applications
   - The app works without LinkedIn integration
   - For testing, mock data is provided

### File Structure
```
├── index.html              # Main HTML file
├── styles.css              # Comprehensive styling
├── script.js               # Frontend logic and API calls
├── backend/
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variables template
│   └── utils/
│       ├── text_processor.py  # Text analysis utilities
│       └── job_matcher.py     # Job matching algorithms
└── README.md
```

## 🎯 How It Works

### 1. Form Submission
- User fills personal details and uploads resume
- Frontend validates all inputs in real-time
- Files are processed and sent to backend

### 2. Resume Analysis
- **Text Extraction**: Supports PDF, DOC, DOCX formats
- **AI Processing**: Google Gemini analyzes content
- **Skill Extraction**: Identifies technical and soft skills
- **Experience Parsing**: Extracts work history and projects

### 3. Profile Integration
- **GitHub Analysis**: Repository analysis, language detection, project evaluation
- **LinkedIn Insights**: Network analysis, skill endorsements (when available)

### 4. Job Matching
- **Skill Matching**: Advanced algorithms compare candidate skills with job requirements
- **Experience Alignment**: Matches experience level with job expectations
- **Salary Estimation**: Provides realistic salary ranges
- **Growth Potential**: Evaluates career advancement opportunities

### 5. Scoring System
- **Technical Skills** (40%): Programming languages, frameworks, tools
- **Experience** (25%): Years of experience, relevance
- **Education** (15%): Degree level, institution reputation
- **Portfolio** (10%): Project quality, GitHub activity
- **Soft Skills** (10%): Communication, leadership, teamwork

## 🔒 Security & Privacy

- **File Security**: Uploaded files are processed and immediately deleted
- **Data Protection**: No personal data is stored permanently
- **API Security**: All API calls are server-side to protect keys
- **CORS Protection**: Proper cross-origin resource sharing setup

## 📊 Sample Analysis Output

The system provides:
- **Profile Summary**: Comprehensive candidate overview
- **Skills Analysis**: Technical and soft skills with proficiency levels
- **GitHub Insights**: Repository statistics, language usage, top projects
- **LinkedIn Profile**: Network size, endorsements, recommendations
- **Job Recommendations**: Top 4-5 matching positions with detailed explanations
- **Career Score**: Overall readiness score with improvement suggestions

## 🛠️ Customization

### Adding New Job Roles
Edit `backend/utils/job_matcher.py` to add new job definitions:

```python
JobRole(
    title="Your Job Title",
    category="Job Category",
    required_skills=["Skill1", "Skill2"],
    preferred_skills=["Skill3", "Skill4"],
    description="Job description",
    salary_range="$X - $Y",
    experience_level="Entry/Mid/Senior-level",
    growth_potential="High/Very High"
)
```

### Modifying Skill Weights
Update skill importance in the `_load_skill_weights` method:

```python
"YourSkill": 0.95,  # High importance (0.0 to 1.0)
```

### Customizing UI
- **Colors**: Modify CSS variables in `styles.css`
- **Layout**: Adjust grid layouts and responsive breakpoints
- **Animations**: Customize transitions and micro-interactions

## 🧪 Testing

### Manual Testing
1. Fill out the form with sample data
2. Upload a sample resume (PDF/DOC)
3. Include GitHub and LinkedIn URLs
4. Submit and verify analysis results

### Sample Test Data
```
Name: John Doe
Email: john.doe@example.com
College: MIT
CGPA: 8.5
GitHub: https://github.com/octocat
LinkedIn: https://linkedin.com/in/sample-profile
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify API keys in `.env` file
   - Check API quotas and limits
   - Ensure proper formatting

2. **File Upload Issues**
   - Check file size (max 10MB)
   - Verify supported formats (PDF, DOC, DOCX)
   - Ensure proper permissions

3. **CORS Errors**
   - Run backend server on correct port
   - Check Flask-CORS configuration
   - Verify frontend API endpoints

4. **Missing Dependencies**
   ```bash
   pip install --upgrade -r requirements.txt
   ```

### Performance Optimization
- **Caching**: Implement Redis for API response caching
- **Async Processing**: Use Celery for background tasks
- **CDN**: Serve static assets via CDN
- **Database**: Add PostgreSQL for production usage

## 🔄 Future Enhancements

- **Real-time Chat**: AI-powered career counseling
- **Video Analysis**: Resume video pitch evaluation
- **Salary Negotiation**: AI-assisted salary negotiation tips
- **Interview Prep**: Mock interview with AI feedback
- **Career Roadmap**: Personalized learning paths
- **Company Matching**: Match with specific companies
- **ATS Optimization**: Resume optimization for Applicant Tracking Systems

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💡 Tips for Best Results

1. **Resume Quality**: Use a well-formatted, comprehensive resume
2. **GitHub Profile**: Maintain an active GitHub with diverse projects
3. **LinkedIn Profile**: Keep LinkedIn updated with current skills
4. **Honest Information**: Provide accurate personal information
5. **Regular Updates**: Re-run analysis after gaining new skills

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the troubleshooting guide
- Review the documentation

## 🎉 Acknowledgments

- Google Gemini AI for intelligent text analysis
- GitHub API for repository insights
- LinkedIn (when available) for professional network data
- Open source community for various libraries and tools

---

**Built with ❤️ for career advancement and AI-powered insights**