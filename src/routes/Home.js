import { Canvas } from '@react-three/fiber';
import React from 'react';
import Coin from '../components/Coin';

const Home = () => {
    return (
        <Canvas>
            <Coin />
        </Canvas>
    );
};

export default Home;