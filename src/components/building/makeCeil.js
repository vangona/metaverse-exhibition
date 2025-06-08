import * as THREE from 'three';
import * as CANNON from "cannon-es";

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
    });
    const ceilMesh = new THREE.Mesh( ceilGeometry, ceilMaterial );

    ceilMesh.rotation.y = Math.PI / 2;
    ceilMesh.receiveShadow = true;

    // Cannon
    const ceilShape = new CANNON.Plane();
    const ceilBody = new CANNON.Body(cannonObj.body);
    
    ceilBody.addShape( ceilShape );
    ceilBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);

    ceilBody.material = cannonObj.body.material;
    ceilBody.position.copy(threeObj.position);
    ceilMesh.position.copy(ceilBody.position);


    const output = {
        'mesh': ceilMesh,
        'body': ceilBody
    }

    return output;
}