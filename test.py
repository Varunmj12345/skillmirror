data = {
    'user_skills': 'Python',
    'projects': 'A',
    'experience': 'B',
    'target_role': 'C',
    'resume_score': 100,
    'extracted_skills': 'E',
    'project_data': 'F',
    'trending_skills': 'G',
    'declining_skills': 'H',
    'avg_skills': 'I',
    'top_profile': 'J',
    'confidence_score': 90
}
sys_prompt = f\"\"\"
User Profile:
- Skills: {data['user_skills']}
- Projects: {data['projects']}
- Experience Level: {data['experience']}
- Target Role: {data['target_role']}

Resume Data:
- Resume Score (ATS): {data['resume_score']}
- Extracted Skills: {data['extracted_skills']}
- Project Details: {data['project_data']}

Market Intelligence:
- Trending Skills: {data['trending_skills']}
- Declining Skills: {data['declining_skills']}

Benchmark Data:
- Average Skills for Role: {data['avg_skills']}
- Top Candidate Profile: {data['top_profile']}

System Metrics:
- Confidence Score: {data['confidence_score']}
\"\"\"
print('SUCCESS')
