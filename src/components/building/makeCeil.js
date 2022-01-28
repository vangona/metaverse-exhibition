import * as THREE from 'three';
import CANNON from "cannon";

export default function makeCeil(
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
    const ceilGeometry = new THREE.BoxGeometry(...threeObj.size);
    const ceilMaterial = new THREE.MeshStandardMaterial({
        ...threeObj.material,
        color: 'white'
    });
    const ceilMesh = new THREE.Mesh( ceilGeometry, ceilMaterial );

    ceilMesh.rotation.y = Math.PI / 2;
    ceilMesh.receiveShadow = true;
    ceilMesh.position.copy(threeObj.position);

    // Cannon
    const ceilShape = new CANNON.Plane(new CANNON.Vec3(threeObj.size[0], threeObj.size[1], threeObj.size[2]));
    const ceilBody = new CANNON.Body(cannonObj.body);
    
    ceilBody.addShape( ceilShape );
    ceilBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);

    ceilBody.material = cannonObj.body.material;
    ceilBody.position.copy(threeObj.position);

    const output = {
        'mesh': ceilMesh,
        'body': ceilBody
    }

    return output;
}