import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import Wall from '../components/Wall';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import Invitation from '../components/home/Invitation';
import styled from 'styled-components';

extend({ OrbitControls });
extend({ PointerLockControls });

const Container = styled.div`
    width: 95vw;
    height: 95vh;
`;

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
    const [init, setInit] = useState(false);

    const onInvitationClick = () => {
        setInit(true);
    }

    return (
        <Container>                
            <Canvas style={{width: '100vw', height: '100vh'}}>
                {init && 
                    <>
                        <Wall position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={1} />
                        <Wall position={[5, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={1} />
                        <Wall position={[2.5, 0, -2.5]} scale={1} />
                        <Wall position={[2.5, 0, 2.5]} scale={1} />
                        <Wall position={[0, -2.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={5} />
                    </>
                }
                <PointerLockControls />
            </Canvas>  
            {!init && <Invitation onInvitationClick={onInvitationClick} />}
        </Container>
    );
};

export default Home;