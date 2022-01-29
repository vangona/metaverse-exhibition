import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import * as THREE from 'three';
import CANNON from "cannon";
import * as dat from "dat.gui";

import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import makeBuilding from '../components/building/makeBuilding';

const Container = styled.div``;

const Home = () => {
    const [controlState, setControlState] = useState(true);
    const mount = useRef();

    function init() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        renderer.shadowMap.enabled = true;

        mount.current.appendChild( renderer.domElement );

        const light = new THREE.DirectionalLight( 0xffffbb, 1 );

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        light.castShadow = true;

        light.position.x = 3;
        light.position.y = 5;
        light.position.z = 2;
        scene.add( light );

        camera.position.x = 0.5;
        camera.position.y = 0.5;
        camera.position.z = 3;

        const controls = new OrbitControls( camera, renderer.domElement );

        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );

        // cannon world setting
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);


        // world materials
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

        // build buildings
        const buildings = makeBuilding();

        for (const building of buildings) {
            if (building.mesh) {
                scene.add(building.mesh);
            } 
            if (building.body) {
                world.addBody(building.body);
            }
        }

        // addEventListner
        window.addEventListener('click', () => {
            controls.lock();
        })

        window.addEventListener('resize', () => {
            renderer.setSize( window.innerWidth, window.innerHeight );
        })

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