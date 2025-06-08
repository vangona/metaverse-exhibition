import * as THREE from 'three';
import * as CANNON from "cannon-es";

export default function makeWall(
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
    const wallGeometry = new THREE.BoxGeometry(...threeObj.size);
    const wallMaterail = new THREE.MeshStandardMaterial(threeObj.material);
    const wallMesh = new THREE.Mesh( wallGeometry, wallMaterail );

    wallMesh.rotation.x = threeObj.rotation.x;
    wallMesh.rotation.y = threeObj.rotation.y;
    wallMesh.rotation.z = threeObj.rotation.z;

    wallMesh.receiveShadow = true;

    // Cannon
    const wallShape = new CANNON.Box(new CANNON.Vec3(threeObj.size[0]/2, threeObj.size[1]/2, threeObj.size[2]/2));
    const wallBody = new CANNON.Body({
        ...cannonObj.body,
    });

    wallBody.addShape(wallShape);
    wallBody.position.copy(threeObj.position);
    wallMesh.position.copy(wallBody.position);

    const output = {
        'mesh' : wallMesh,
        'body' : wallBody
    }
    
    return output;
}