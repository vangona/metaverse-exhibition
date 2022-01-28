import * as THREE from "three";

export default function makeBulb( bulbArgs ) {
    const bulb = new THREE.PointLight(bulbArgs.attr)

    bulb.castShadow = true;
    bulb.shadow.mapSize.width = 1024;
    bulb.shadow.mapSize.height = 1024;

    bulb.position.copy(bulbArgs.position)

    const output = { 'mesh': bulb }
    return output;
}