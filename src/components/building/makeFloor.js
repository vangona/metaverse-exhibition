import * as THREE from 'three';
import CANNON from "cannon";

export default function makeFloor(
        threeObj={
            'size': [1, 1, 1], 
            'position': {x: 0, y:0, z: 0}, 
            'rotation': {x: 0, y:0, z: 0},
            'material': {},
        },
        cannonObj={
            'body': {},
        }) 
    {

    // Three.js
    const floorGeometry = new THREE.BoxGeometry(...threeObj.size);
    const floorMaterial = new THREE.MeshStandardMaterial({
        ...threeObj.material,
        color: 'blue'
    });
    const floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );

    floorMesh.rotation.y = Math.PI / 2;
    floorMesh.receiveShadow = true;

    // Cannon
    const floorShape = new CANNON.Plane(new CANNON.Vec3(threeObj.size[0], threeObj.size[1], threeObj.size[2]));
    const floorBody = new CANNON.Body(cannonObj.body);
    
    floorBody.addShape( floorShape );
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);

    floorBody.material = cannonObj.body.material;

    const output = {
        'mesh': floorMesh,
        'body': floorBody
    }

    return output;
}