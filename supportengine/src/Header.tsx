import React, { useState, useEffect, useRef, useContext,  } from 'react';
import Button from '@mui/material/Button';
import { Box, TextField, InputBase, colors } from '@mui/material';
import OpenAI from 'openai';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Chat } from 'openai/resources';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import AppContext from './AppContext';
import Cookies from 'js-cookie';
import './App.css';


const Header = () => {
    const navigate = useNavigate();
    const buttons = [
        <Button key="Affiliate Link" onClick={() => navigate('/')}>Affiliate Link</Button>,
        <Button key="Business" onClick={() => navigate('/link')}>Service</Button>,
        <Button key="Product" onClick={() => navigate('/product')}>Product</Button>,

    ];
    return (
        <div className='buttonGroup'>
            <ButtonGroup
                orientation="vertical"
                aria-label="vertical contained button group"
                variant="contained"
                sx = {{minWidth: '100px',marginRight: '10px', marginTop: '30px'}}
                >
                {buttons}
            </ButtonGroup>
        </div>
    );
};

export default Header;