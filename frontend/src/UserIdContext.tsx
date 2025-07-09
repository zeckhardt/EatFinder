import { createContext, useContext } from 'react';

const UserIdContext = createContext<string | null>(null);

export const useUserId = (): string => {
    const context = useContext(UserIdContext);
    if (!context) {
        throw new Error("useUserId must be used within a UserIdContext.Provider");
    }
    return context;
};

export { UserIdContext };
