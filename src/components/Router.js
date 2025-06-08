import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from '../routes/Home';
import Seeun from '../routes/Seeun';

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<Seeun />} />
                <Route path='/practice' element={<Home />} />
            </Routes>
        </Router>
    );
};

export default AppRouter;