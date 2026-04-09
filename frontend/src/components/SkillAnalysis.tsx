import React, { useEffect, useState } from 'react';
import { fetchSkillAnalysis } from '../services/ai';

const SkillAnalysis: React.FC = () => {
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getSkillAnalysis = async () => {
            try {
                const data = await fetchSkillAnalysis([]);
                setSkills(data);
            } catch (err) {
                setError('Failed to fetch skill analysis');
            } finally {
                setLoading(false);
            }
        };

        getSkillAnalysis();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Skill Analysis</h2>
            <ul>
                {skills.map((skill) => (
                    <li key={skill.id}>
                        {skill.name}: {skill.proficiency}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SkillAnalysis;