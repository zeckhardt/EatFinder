import React from 'react';
import '../Chips.css';

interface ChipProps {
    label: string;
}

const formatChip = (text: string): string => {
    const words = text.split('_');
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
};


const Chip: React.FC<ChipProps> = ({ label }) => {
    return <div className="chip">{formatChip(label)}</div>;
};

export default Chip;
