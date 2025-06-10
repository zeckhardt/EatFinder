import React, { useState } from "react";
import "../styles/SearchBar.css";

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [input, setInput] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSearch(input.trim());
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="search-form"
        >
            <input
                type="text"
                placeholder="Search restaurants..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
        </form>
    );
};

export default SearchBar;