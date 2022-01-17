import React, { useRef } from 'react';
import {Canvas,useFrame} from '@react-three/fiber';

const Coin = () => {
    const mesh = useRef(null);

    useFrame(() => (mesh.current.rotation.y =  mesh.current.rotation.z += 0.01)); // #2

    return (
      <mesh ref={mesh} scale={0.7}>
        <cylinderBufferGeometry args={[1, 1, 0.3, 50]} />
        <meshLambertMaterial attach="material" color="#ff9800" />
      </mesh>
    );

  }

export default Coin;