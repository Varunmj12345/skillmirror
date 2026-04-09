import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoadmapBuilder = () => {
    const [skills, setSkills] = useState<any[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [roadmap, setRoadmap] = useState<any>(null);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.get('/api/skills/');
                setSkills(response.data);
            } catch (error) {
                console.error('Error fetching skills:', error);
            }
        };

        fetchSkills();
    }, []);

    const handleSkillSelect = (skill: string) => {
        setSelectedSkills((prev) => 
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const generateRoadmap = async () => {
        try {
            const response = await axios.post('/api/roadmaps/generate/', { skills: selectedSkills });
            setRoadmap(response.data);
        } catch (error) {
            console.error('Error generating roadmap:', error);
        }
    };

    return (
        <div>
            <h2>Career Roadmap Builder</h2>
            <div>
                <h3>Select Skills</h3>
                {skills.map((skill: any) => (
                    <div key={skill.id}>
                        <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill.name)}
                            onChange={() => handleSkillSelect(skill.name)}
                        />
                        {skill.name}
                    </div>
                ))}
            </div>
            <button onClick={generateRoadmap}>Generate Roadmap</button>
            {roadmap && (
                <div>
                    <h3>Your Roadmap</h3>
                    <pre>{JSON.stringify(roadmap, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default RoadmapBuilder;