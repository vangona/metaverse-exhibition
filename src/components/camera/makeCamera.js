import * as THREE from 'three';
import * as CANNON from "cannon-es";

export default function makeCamera() {
    const defaultMaterial = new CANNON.Material('default');

    // Three.js
    const wallGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial();
    const wallMesh = new THREE.Mesh( wallGeometry, wallMaterial );

    wallMesh.rotation.x = 0;
    wallMesh.rotation.y = 0;
    wallMesh.rotation.z = 0;

    wallMesh.position.copy({x: 0, y: 1, z:0});
    wallMesh.receiveShadow = true;

    // Cannon
    const wallShape = new CANNON.Box(new CANNON.Vec3(0.5, 1, 0.5));
    const wallBody = new CANNON.Body({
        mass: 1,
        material: defaultMaterial
    });

    wallBody.addShape(wallShape);
    wallBody.position.copy({x: 0, y: 1, z:0});

    const output = {
        'mesh' : wallMesh,
        'body' : wallBody
    }

    return output;
}