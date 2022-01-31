import CANNON from "cannon";
import makeBulb from "../building/makeBulb";
import makeCeil from "../building/makeCeil";
import makeFloor from "../building/makeFloor";
import makeVerticalWall from "../building/makeVerticalWall";
import makeWall from "../building/makeWall";

export default function makeSeeunBuilding() {
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
            color: 'white',
        },
    }

    const wallOpositeThree = {
        'size': [0.1, 10, 10], 
        'position': {x: -5, y:5, z: 0}, 
        'rotation': {x: 0, y:0, z: 0},
        'material': {
            metalness: 0.3,
            roughness: 0.4,
            color: 'white',
        },
    }

    const wallVerticalThree = {
        'size': [0.1, 10, 10], 
        'position': {x: 0, y:5, z: 5}, 
        'rotation': {x: 0, y:Math.PI / 2, z: 0},
        'material': {
            metalness: 0.3,
            roughness: 0.4,
            color: 'white',
        },
    }

    const wallVerticalOpositeThree = {
        'size': [0.1, 10, 10], 
        'position': {x: 0, y:5, z: -5}, 
        'rotation': {x: 0, y:Math.PI / 2, z: 0},
        'material': {
            metalness: 0.3,
            roughness: 0.4,
            color: 'white',
        },
    }

    // floor
    const floorThree = {
        'size': [100, 0.1, 100],
        'rotation': {x: 0, y:Math.PI / 2, z: 0},
        'material': {
            color: 'white'
        }
    }

    // ceil
    const ceilThree = {
        'size': [10, 0.1, 10],
        'position': {x: 0, y: 10, z: 0},
        'rotation': {x: 0, y:Math.PI / 2, z: 0},
        'material': {
            color: 'white',
        }
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

    // add keyboard controller
    const velocity = 0.1;
    const keyPress = (e) => {
        if (e.keyCode === 119) {
            wall.body.position.z -= velocity;
        } else if (e.keyCode === 115) {
            wall.body.position.z += velocity;
        } else if (e.keyCode === 97) {
            wall.body.position.x -= velocity;
        } else if (e.keyCode === 100) {
            wall.body.position.x += velocity;
        }
    }

    window.addEventListener('keypress', keyPress);

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
            intensitiy: 3,
            distance: 2,
            decay: 5,
        },
        position : {x: 0, y: 2.5, z: 0}
    })

    // make ceil
    const ceil = makeCeil(ceilThree, ceilCannon);

    buildings.push(wall, opositeWall, verticalWall, vertialOpositeWall, floor, ceil);

    return buildings;
}