import * as CANNON from "cannon-es";
import makeBulb from "./makeBulb";
import makeCeil from "./makeCeil";
import makeFloor from "./makeFloor";

import makeVerticalWall from "./makeVerticalWall";
import makeWall from "./makeWall";

export default function makeBuilding() {
    const buildings = [];
    const defaultMaterial = new CANNON.Material('default');

    // buildings three.js

    // wall
    const wallThree = {
        'size': [0.1, 10, 10], 
        'position': {x: 5, y:5, z: 0}, 
        'rotation': {x: 0, y:0, z: 0},
        'material': {
            metalness: 0.3,
            roughness: 0.4,
        },
    }

    const wallOpositeThree = {
        'size': [0.1, 10, 10], 
        'position': {x: -5, y:5, z: 0}, 
        'rotation': {x: 0, y:0, z: 0},
        'material': {
            metalness: 0.3,
            roughness: 0.4,
        },
    }

    const wallVerticalThree = {
        'size': [0.1, 10, 10], 
        'position': {x: 0, y:5, z: 5}, 
        'rotation': {x: 0, y:Math.PI / 2, z: 0},
        'material': {
            metalness: 0.3,
            roughness: 0.4,
        },
    }

    const wallVerticalOpositeThree = {
        'size': [0.1, 10, 10], 
        'position': {x: 0, y:5, z: -5}, 
        'rotation': {x: 0, y:Math.PI / 2, z: 0},
        'material': {
            metalness: 0.3,
            roughness: 0.4,
        },
    }

    // floor
    const floorThree = {
        'size': [100, 0.1, 100],
        'rotation': {x: 0, y:Math.PI / 2, z: 0},
    }

    // ceil
    const ceilThree = {
        'size': [10, 0.1, 10],
        'position': {x: 0, y: 10, z: 0},
        'rotation': {x: 0, y:Math.PI / 2, z: 0},
    }

    // buildings cannon.js

    // wall
    const wallCannon = {
        'body' : {
            mass: 0,
            material: defaultMaterial
        },
    }

    // floor
    const floorCannon = {
        'body' : {
            mass: 0,
            material: defaultMaterial
        },
    }

    // ceil
    const ceilCannon = {
        'body' : {
            mass: 0,
            material: defaultMaterial
        },
    }

    // make buildings

    // make walls
    const wall = makeWall(wallThree, wallCannon);
    const opositeWall = makeWall(wallOpositeThree, wallCannon);
    const verticalWall = makeVerticalWall(wallVerticalThree, wallCannon);
    const vertialOpositeWall = makeVerticalWall(wallVerticalOpositeThree, wallCannon);

    // make floors 
    const floor = makeFloor(floorThree, floorCannon);

    // make bulbs
    const bulb = makeBulb({
        attr : {
            color: 0xffffbb,
            intensitiy: 1,
            distance: 2,
            decay: 2,
        },
        position : {x: 0, y: 3, z: 0}
    })

    // make ceil
    const ceil = makeCeil(ceilThree, ceilCannon);

    buildings.push(wall, opositeWall, verticalWall, vertialOpositeWall, floor, ceil, bulb);

    return buildings;
}