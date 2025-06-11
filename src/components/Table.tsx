import React from "react";
import '../styles/Table.css';

const Table: React.FC = () => {
    const data = [
        { name: 'Alice Smith', position: 'Software Engineer', email: 'alice@example.com' },
        { name: 'Bob Johnson', position: 'Product Manager', email: 'bob@example.com' },
        { name: 'Carol Lee', position: 'UX Designer', email: 'carol@example.com' }
    ];

    return(
        <div className='table-container'>
            <h2>Lists</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Entries</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((person, index) => (
                        <tr key={index}>
                            <td>{person.name}</td>
                            <td>{person.position}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Table;