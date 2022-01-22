import React, { useRef } from 'react';
import { Physics, useBox } from "@react-three/cannon";

const Wall = (props) => {
    const [boxRef, api] = useBox(() => ({ mass : 1 }))

    return (
      <Physics>
        <mesh 
          {...props}
          ref={boxRef} 
          >
          <boxGeometry args={[5, 5, 0.5, 50]} />
          <meshStandardMaterial attach="material" color={'orange'} />
        </mesh>
      </Physics>
    );

  }

export default Wall;