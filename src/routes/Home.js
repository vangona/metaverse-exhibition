import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { OrbitControls, PointerLockControls } from '@react-three/drei';
import Invitation from '../components/home/Invitation';
import styled from 'styled-components';
import { Physics, useBox, usePlane } from '@react-three/cannon';
 
extend({ OrbitControls });
extend({ PointerLockControls });

const Container = styled.div`
    width: 95vw;
    height: 95vh;
`;

const Home = () => {
    const person = useRef();
    const [init, setInit] = useState(false);
    const velocity = 0.01;

    const Floor = (props) => {
        const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))

        return (
            <mesh ref={ref} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <shadowMaterial color="#171717" transparent opacity={0.4} />
                <meshLambertMaterial color="lightblue" />
            </mesh>
        )
    }

    const Cube = (props) => {
        const [ref] = useBox(() => ({ mass: 1, position: [0, 5, 0], rotation: [0.4, 0.2, 0.5], ...props }))

        return (
            <mesh receiveShadow castShadow ref={ref}>
                <boxGeometry />
                <meshLambertMaterial color="hotpink" />
            </mesh>
        )
    }

    const Wall = (props) => {
        const [ref] = useBox(() => ({ mass: 1, position: [0, 0, 0], ...props }))

        return (
            <mesh ref={ref}>
                <boxGeometry args={[5, 5]} />
                <meshLambertMaterial color="black" />
            </mesh>
        )
    }

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
        <Canvas color={'blue'} shadows dpr={[1, 2]} gl={{ alpha: false }} camera={{ position: [-1, 5, 5], fov: 45 }}>
                <ambientLight />
                <directionalLight position={[10, 10, 10]} castShadow shadow-mapSize={[2048, 2048]} />
                {init && 
                    <Physics>
                        <Wall position={[-1, 1, 1]} />
                        <Floor position={[0, 0, 0]} />
                        <Cube position={[0.1, 10, 0]} />
                        <Cube position={[0, 20, -1]} />
                        <Cube position={[0, 30, -2]} />        
                    </Physics>
                }
                <PointerLockControls ref={person} />
            </Canvas>  
            {!init && <Invitation onInvitationClick={onInvitationClick} />}
        </Container>
    );
};

export default Home;