import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import * as THREE from 'three';
import CANNON from "cannon";
import * as dat from "dat.gui";

import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { AxesHelper, Vector3 } from 'three';
import makeWall from '../components/building/makeWall';

const Container = styled.div``;

const Home = () => {
    const mount = useRef();

    function init() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        renderer.shadowMap.enabled = true;

        mount.current.appendChild( renderer.domElement );
      

        // cube
        const cubeGeometry = new THREE.SphereGeometry( 1, 20, 20 );
        const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0x7e31eb } );
        const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
        cube.position.y = 3;
        cube.castShadow = true;
        // scene.add( cube );

        // floor
        const floorGeometry = new THREE.BoxGeometry( 100, 0.1, 100 );
        const floorMaterial = new THREE.MeshStandardMaterial( { color: 'white' } );
        const floor = new THREE.Mesh( floorGeometry, floorMaterial );
        floor.rotation.y = Math.PI / 2;
        floor.receiveShadow = true;

        scene.add( floor );

        const light = new THREE.DirectionalLight( 0xffffbb, 1 );

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        light.castShadow = true;

        light.position.x = 2;
        light.position.y = 10;
        light.position.z = 2;
        scene.add( light );

        camera.position.x = 0.5;
        camera.position.y = 0.5;
        camera.position.z = 3;

        const controls = new OrbitControls( camera, renderer.domElement );


        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );

        // cannon world
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);


        //material
        const defaultMaterial = new CANNON.Material('default');
        const concreteMaterial = new CANNON.Material('concrete');
        const plasticMaterial = new CANNON.Material('plastic');

        const defaultContactMaterial = new CANNON.ContactMaterial(
            defaultMaterial,
            defaultMaterial,
            {
                friction: 0.1,
                restitution: 0.7
            }
        )

        world.addContactMaterial(defaultContactMaterial);

        const concretePlasticContactMaterial = new CANNON.ContactMaterial(
            concreteMaterial,
            plasticMaterial,
            {
                friction: 0.1,
                restitution: 0.7
            }
        )

        world.addContactMaterial(concretePlasticContactMaterial);

        world.defaultContactMaterial = defaultContactMaterial;

        // objects
        const sphereShape = new CANNON.Sphere(1);
        const sphereBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 0),
            shape: sphereShape,
            material: defaultMaterial
        })

        sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0));

        // world.addBody(sphereBody);

        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body();
        floorBody.mass = 0;
        floorBody.addShape( floorShape );
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);

        floorBody.material = defaultMaterial;

        world.addBody(floorBody);

        // addEventListner
        window.addEventListener('click', () => {
            controls.lock();
        })


        const wallThree = {
                'size': [1, 1, 1], 
                'position': {x: 0, y:1, z: 0}, 
                'rotation': {x: 0, y:0, z: 0},
                'material': {
                    metalness: 0.3,
                    roughness: 0.4,
                },
            }

        const wallVerticalThree = {
            'size': [0.1, 1, 1], 
            'position': {x: 0, y:1, z: 0}, 
            'rotation': {x: 0, y:Math.PI / 2, z: 0},
            'material': {
                metalness: 0.3,
                roughness: 0.4,
            },
        }

        const wallCannon = {
                'body' : {
                    mass: 1,
                    material: defaultMaterial
                } 
            }

        const verticalWall = makeWall(wallVerticalThree, wallCannon);
        const wall = makeWall(wallThree, wallCannon);

        scene.add(wall.mesh);
        world.addBody(wall.body);
        // scene.add(verticalWall.mesh);
        // world.addBody(verticalWall.body);

        // functions
        const objToUpdate = [];
        const createSphere = (radius, position, color) => {
            // Three.js mesh
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 20, 20),
                new THREE.MeshStandardMaterial({
                    metalness: 0.3,
                    roughness: 0.4,
                    color: color,
                })
            );
            mesh.castShadow = true;
            mesh.position.copy(position);
            scene.add(mesh);

            // Cannon.js body
            const shape = new CANNON.Sphere(radius);

            const body = new CANNON.Body({
                mass: 1,
                position: new CANNON.Vec3(0, 3, 0),
                shape,
                material: defaultMaterial,
            });

            body.applyLocalForce(
                new CANNON.Vec3(
                    Math.random()*100 + -50,
                    0, 
                    Math.random()*100 + -50,
                ), 
                new CANNON.Vec3(0, 0, 0))
            body.position.copy(position);
            world.addBody(body);

            objToUpdate.push({ mesh, body });
        }

        // Dat.GUI

        const gui = new dat.GUI();
        const debugObject = {};

        debugObject.createSphere = () => {
            createSphere(
                Math.random() * 0.3 + 0.2, 
                { 
                    x: (Math.random() - 0.5) * 3, 
                    y: 3, 
                    z: (Math.random() - 0.5) * 3 
                },
                Math.random() * 0xffffff
            );
        }

        gui.add(debugObject, 'createSphere')

        // body with time
        const clock = new THREE.Clock();
        let oldElapsedTime = 0;

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            const delataTime = elapsedTime - oldElapsedTime;
            oldElapsedTime = elapsedTime;

            world.step(1 / 60, delataTime, 3);

            wall.mesh.position.copy(wall.body.position);
            for (const object of objToUpdate) {
                object.mesh.position.copy(object.body.position)
            }
        }

        const animate = function() {
            requestAnimationFrame( animate );
            tick();
            // cube.rotation.x += 0.01;
            // cube.rotation.y += 0.01;
            // cube.rotation.z += 0.01;

            // controls.update();

            renderer.render( scene, camera );
        }

        animate();
    }

    useEffect(() => {
           init();
    }, [])

    return (
        <Container ref={mount}>  
        </Container>
    );
};

export default Home;