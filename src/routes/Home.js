import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import React, { useRef } from 'react';
import Wall from '../components/Wall';
import { OrbitControls } from '@react-three/drei';

extend({ OrbitControls });

const CameraControls = () => {
    const {
        camera,
        gl: { domElemnet },
    } = useThree();
    const controls = useRef();
    useFrame((state) => controls.current.update());
    return <OrbitControls ref={controls} args={[camera, domElemnet]} />;
}

const Home = () => {
    return (
        <Canvas style={{width: '100vw', height: '100vh'}}>
            <CameraControls />
            <Wall position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={1} />
            <Wall position={[5, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={1} />
            <Wall position={[2.5, 0, -2.5]} scale={1} />
            <Wall position={[2.5, 0, 2.5]} scale={1} />
            <Wall position={[0, -2.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={5} />
        </Canvas>
    );
};

export default Home;