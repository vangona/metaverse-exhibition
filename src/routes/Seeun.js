import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import * as THREE from 'three';
import CANNON from "cannon";
import * as dat from "dat.gui";

import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import makeBuilding from '../components/building/makeBuilding';
import makeSeeunBuilding from '../components/seeun/makeSeeunBuilding';

import seeunMusic from '../music/seeun.mp3';
import fog from "../textures/particles/1.png";

const Container = styled.div`
    position: relative;
`;

const Label = styled.label`
    position: absolute;
`;
const Input = styled.input``;

const Seeun = () => {
    const mount = useRef();

    function init() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );

        renderer.shadowMap.enabled = true;

        mount.current.appendChild( renderer.domElement );

        const light = new THREE.HemisphereLight( 0x404040 );
        scene.add(light);

        light.position.y = 2.5;

        camera.position.x = 0;
        camera.position.y = 2.5;
        camera.position.z = 0;

        const controls = new PointerLockControls( camera, renderer.domElement );

        const axesHelper = new THREE.AxesHelper( 5 );
        scene.add( axesHelper );


        const audio = document.getElementById('seeunAudio');

        const context = new AudioContext();
        const analyser = context.createAnalyser();

        analyser.connect(context.destination);
        analyser.fftSize = 2048;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        const src = context.createMediaElementSource(audio);
        src.connect(analyser);

        // cannon world setting
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);

        // Particles\
        const particlesGeometry = new THREE.SphereBufferGeometry(1, 32, 32);
        const count = 1000;
        const particlesMaterial = new THREE.PointsMaterial();
        particlesMaterial.vertexColors = true;

        const textureLoader = new THREE.TextureLoader();
        const particleTexture = textureLoader.load(fog);

        particlesMaterial.transparent = true;
        particlesMaterial.alphaMap = particleTexture;
        particlesMaterial.alphaTest = 0.1;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            sizes[i] = 100;
        }

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 10;
        }

        for (let i = 0; i < count * 3; i += 3) {
            colors[i] = 0.392;
            colors[i + 1] = 0.396;
            colors[i + 2] = 0.650;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1).setUsage( THREE.DynamicDrawUsage ));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        particles.position.y = 2;

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
        const buildings = makeSeeunBuilding();

        for (const building of buildings) {
            if (building.mesh) {
                scene.add(building.mesh);
            } 
            if (building.body) {
                world.addBody(building.body);
            }
        }

        const clock = new THREE.Clock();
        let oldElapsedTime = 0;
        let rState = false;
        let gState = false;
        let bState = false;
        let rMax = 0.492;
        let rMin = 0.292;
        let gMax = 0.496;
        let gMin = 0.296;
        let bMax = 0.750;
        let bMin = 0.550;

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            const delataTime = elapsedTime - oldElapsedTime;
            oldElapsedTime = elapsedTime;

            if (!audio.paused) {
                analyser.getByteTimeDomainData(dataArray);

                const lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
                const upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);
          
                const overallAvg = avg(dataArray);
                const lowerMax = max(lowerHalfArray);
                const lowerAvg = avg(lowerHalfArray);
                const upperMax = max(upperHalfArray);
                const upperAvg = avg(upperHalfArray);
          
                const lowerMaxFr = lowerMax / lowerHalfArray.length;
                const lowerAvgFr = lowerAvg / lowerHalfArray.length;
                const upperMaxFr = upperMax / upperHalfArray.length;
                const upperAvgFr = upperAvg / upperHalfArray.length;

                for (let i = 0; i < count * 3; i += 3) {
                    let r = particlesGeometry.attributes.color.array[i];
                    let g = particlesGeometry.attributes.color.array[i + 1];
                    let b = particlesGeometry.attributes.color.array[i + 2];

                    if (rState) {
                        r += lowerMaxFr / 1000;
                    } else {
                        r -= lowerMaxFr / 1000;
                    }

                    if (gState) {
                        g += upperMaxFr / 1000;
                    } else {
                        g -= upperMaxFr / 1000;
                    }

                    if (bState) {
                        b += lowerAvgFr / 1000;
                    } else {
                        b -= lowerAvgFr / 1000;
                    }
                    
                    if (r > rMax) {
                        rState = false;
                    } 
                    if (r < rMin) {
                        rState = true;
                    }

                    if (g > gMax) {
                        gState = false;
                    }
                    if (g < gMin) {
                        gState = true;
                    }

                    if (b > bMax) {
                        bState = false;
                    }
                    if (b < bMin) {
                        bState = true;
                    }

                    particlesGeometry.attributes.color.array[i] = r;
                    particlesGeometry.attributes.color.array[i + 1] = g;
                    particlesGeometry.attributes.color.array[i + 2] = b;
                }

                const sizes = particlesGeometry.attributes.size.array;
                for (let i = 0; i < count; i++) {
                    sizes[i] = elapsedTime;
                }

                particlesGeometry.attributes.color.needsUpdate = true;
                particlesGeometry.attributes.size.needsUpdate = true;
                
                particles.rotation.x = elapsedTime * 0.1;
                particles.rotation.y = elapsedTime * 0.1;
                particles.rotation.z = elapsedTime * 0.1;
            }

            world.step(1 / 60, delataTime, 3);
        }

        const animate = function() {
            requestAnimationFrame( animate );
            tick();

            renderer.render( scene, camera );
        }

        animate();

        window.addEventListener('click', () => {
            // vizMusic();
            if(audio.paused) {
                context.resume();
                audio.play();    
            } else {
                audio.pause();
            }
            controls.lock();
        })

        window.addEventListener('resize', () => {
            renderer.setSize( window.innerWidth, window.innerHeight );
        })

        function vizMusic() {
            const listener = new THREE.AudioListener();
            particles.add( listener );
            const sound = new THREE.Audio( listener );
    
            const file = seeunMusic;

            const audioLoader = new THREE.AudioLoader();
            audioLoader.load( file, function (buffer) {
                sound.setBuffer( buffer );
                sound.setLoop( true );
                sound.setVolume( 0.5 );
                sound.play();
            })
        }

        function avg(arr){
            var total = arr.reduce(function(sum, b) { return sum + b; });
            return (total / arr.length);
        }
        
        function max(arr){
            return arr.reduce(function(a, b){ return Math.max(a, b); })
        }
    }

    useEffect(() => {
        init();
    }, [])

    return (
        <Container ref={mount}>
            <audio id='seeunAudio' src={seeunMusic} />
        </Container>
    );
};

export default Seeun;