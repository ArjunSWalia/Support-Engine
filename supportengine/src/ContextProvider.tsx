import React, { useState, ReactNode } from 'react';
import AppContext from './AppContext';


export const ContextProvider = ({ children } : {children : any}) => {
    const [value, setValue] = useState(0);

    return (
        <AppContext.Provider value={{ value,setValue }}>
            {children}
        </AppContext.Provider>
    );
};