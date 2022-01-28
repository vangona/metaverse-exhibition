import * as THREE from 'three';
import CANNON from "cannon";

export default function makeWall(
        threeObj={
            'size': [1, 1, 1], 
            'position': {x: 0, y:0, z: 0}, 
            'rotation': {x: 0, y:0, z: 0},
            'material': {},
        },
        cannonObj={
            'body': {},
        },
    ) {

    // Three.js
    const wallGeometry = new THREE.BoxGeometry(...threeObj.size);
    const wallMaterail = new THREE.MeshStandardMaterial(threeObj.material);
    const wallMesh = new THREE.Mesh( wallGeometry, wallMaterail );

    wallMesh.position.x = threeObj.position.x;
    wallMesh.position.y = threeObj.position.y;
    wallMesh.position.z = threeObj.position.z;

    wallMesh.rotation.x = threeObj.rotation.x;
    wallMesh.rotation.y = threeObj.rotation.y;
    wallMesh.rotation.z = threeObj.rotation.z;

    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;

    // Cannon
    const wallShape = new CANNON.Box(new CANNON.Vec3(...threeObj.size));
    const wallBody = new CANNON.Body({
        ...cannonObj.body,
        shape: wallShape,
    });

    wallBody.position.copy(threeObj.position);

    const output = {
        'mesh' : wallMesh,
        'body' : wallBody
    }
    
    return output;
}