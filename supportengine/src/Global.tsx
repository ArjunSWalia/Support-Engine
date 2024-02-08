import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ContextProvider } from './ContextProvider';
import App from './App';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NonLink from './NonLink';
import Header from './Header';
function Global() {
    return (
        <ContextProvider>
            <Router>
                <Header/>
                <Routes>
                    <Route path="" element={<App />} />
                    <Route path="/link" element={<NonLink />} /> 
                </Routes>
            </Router>
        </ContextProvider>
    );
}

export default Global;