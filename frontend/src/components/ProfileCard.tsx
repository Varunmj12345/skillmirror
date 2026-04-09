import React from 'react';

interface ProfileCardProps {
    name: string;
    email: string;
    skills: string[];
    experience: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, skills, experience }) => {
    return (
        <div className="profile-card">
            <h2>{name}</h2>
            <p>Email: {email}</p>
            <h3>Skills</h3>
            <ul>
                {skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                ))}
            </ul>
            <h3>Experience</h3>
            <p>{experience}</p>
        </div>
    );
};

export default ProfileCard;