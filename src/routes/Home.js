import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
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
    const person = useRef();
    const [init, setInit] = useState(false);
    const velocity = 0.01;

    const onInvitationClick = () => {
        setInit(true);
    }

    const keyPress = (e) => {
        if (e.keyCode === 87) {
            person.current.moveForward(velocity);
        } else if (e.keyCode === 83) {
            person.current.moveForward(-velocity);
        } else if (e.keyCode === 65) {
            person.current.moveRight(-velocity);
        } else if (e.keyCode === 68) {
            person.current.moveRight(velocity);
        }
    }
    
    useEffect(() => {
        window.addEventListener('keydown', keyPress)
    }, [])

    return (
        <Container>                
            <Canvas style={{width: '100vw', height: '100vh'}}>
                {init && 
                    <>
                        <Wall position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.1} />
                        <Wall position={[0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.1} />
                        <Wall position={[0.25, 0, -0.25]} scale={0.1} />
                        <Wall position={[0.25, 0, 0.25]} scale={0.1} />
                        <Wall position={[0, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.5} />
                    </>
                }
                <PointerLockControls ref={person} />
            </Canvas>  
            {!init && <Invitation onInvitationClick={onInvitationClick} />}
        </Container>
    );
};

export default Home;