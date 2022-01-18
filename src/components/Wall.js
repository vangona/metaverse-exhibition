import React, { useRef } from 'react';
import {Canvas,useFrame} from '@react-three/fiber';

const Wall = (props) => {
    const mesh = useRef(null);


    return (
      <mesh 
        {...props}
        ref={mesh} 
        >
        <boxGeometry args={[5, 5, 0.5, 50]} />
        <meshStandardMaterial attach="material" color={'orange'} />
      </mesh>
    );

  }

export default Wall;