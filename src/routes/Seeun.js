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

        const controls = new OrbitControls( camera, renderer.domElement );
        controls.enabled = true;

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


        // visualizers

        const textureLoader = new THREE.TextureLoader();
        const particleTexture = textureLoader.load(fog);

        const sphereVisualizerGeometry = new THREE.SphereBufferGeometry(0.6, 24, 24);

        const sphereVisualizerMaterial = new THREE.PointsMaterial();
        sphereVisualizerMaterial.alphaMap = particleTexture;

        sphereVisualizerMaterial.transparent = true;
        sphereVisualizerMaterial.alphaTest = 0.1;
        sphereVisualizerMaterial.size = 0.11;
        sphereVisualizerMaterial.sizeAttenuation = true;

        const sphereVisualizer = new THREE.Points(sphereVisualizerGeometry, sphereVisualizerMaterial);

        sphereVisualizer.position.y = 2.5;
        sphereVisualizerMaterial.color = new THREE.Color('#6667AB')
        
        scene.add(sphereVisualizer);

        // Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial();
        particlesMaterial.vertexColors = true;
        particlesMaterial.alphaMap = particleTexture;

        particlesMaterial.alphaTest = 0.1;
        particlesMaterial.size = 0.1;
        particlesMaterial.sizeAttenuation = true;

        const count = 250;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 10;
        }
        for (let i = 0; i < count * 3; i += 3) {
            colors[i] = 0.392;
            colors[i + 1] = 0.396;
            colors[i + 2] = 0.650;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);

        particles.position.y = 2.5;

        // build buildings

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

        let lowerSum = 0;
        let upperSum = 0;

        camera.position.x = 0;
        camera.position.y = 9;
        camera.position.z = 0;

        const tick = () => {
            const elapsedTime = clock.getElapsedTime();
            const delataTime = elapsedTime - oldElapsedTime;
            oldElapsedTime = elapsedTime;

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

            if (audio.paused) {
                const speed = 0.01;

                particles.rotation.x = 0;
                particles.rotation.y = 0;
                particles.rotation.z = 0;

                if (particlesGeometry.attributes.position.array) {
                    for (let i = 0; i < count * 3; i += 3) {
                        const y = particlesGeometry.attributes.position.array[i + 1];
                        if (Math.abs(y) > 0) {
                            if (y > 0) {
                                particlesGeometry.attributes.position.array[i + 1] = y - speed;
                            } else {
                                particlesGeometry.attributes.position.array[i + 1] = y + speed;
                            }
                        }
                    }
                }
                particlesGeometry.attributes.position.needsUpdate = true
            }

            if (!audio.paused) {

                for (let i = 0; i < count * 3; i += 3) {
                    let r = particlesGeometry.attributes.color.array[i];
                    let g = particlesGeometry.attributes.color.array[i + 1];
                    let b = particlesGeometry.attributes.color.array[i + 2];

                    const randNum = Math.random() * 0.002;

                    if (rState) {
                        r += lowerMaxFr * randNum;
                    } else {
                        r -= lowerMaxFr * randNum;
                    }

                    if (gState) {
                        g += upperMaxFr * randNum;
                    } else {
                        g -= upperMaxFr * randNum;
                    }

                    if (bState) {
                        b += lowerAvgFr * randNum;
                    } else {
                        b -= lowerAvgFr * randNum;
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

                particlesGeometry.attributes.color.needsUpdate = true;

                const velocity = overallAvg / 2000;
                
                lowerSum += lowerAvgFr / 100;
                upperSum += upperAvgFr / 100;
                for(let i = 0; i < count; i += 3)
                {
                    const x = particlesGeometry.attributes.position.array[i]
                    particlesGeometry.attributes.position.array[i + 1] = Math.sin(lowerSum + x)
                }

                for (let i = count * 2; i < count * 3; i++) {
                    const x = particlesGeometry.attributes.position.array[i]

                    particlesGeometry.attributes.position.array[i] = Math.sin(x + (Math.random() - 0.5) / 10000) * 5;
                }

                particlesGeometry.attributes.position.needsUpdate = true
            
                particles.rotation.x = lowerSum * 0.1;
                particles.rotation.y = lowerSum * 0.1;
                particles.rotation.z = lowerSum * 0.1;

                sphereVisualizer.rotation.y += lowerAvgFr / 500;
            }

            sphereVisualizer.scale.x = sphereVisualizer.scale.y = sphereVisualizer.scale.z = 3 + lowerMaxFr / 2 + upperMaxFr / 2;

            world.step(1 / 60, delataTime, 3);
        }

        const animate = function() {
            requestAnimationFrame( animate );
            tick();

            renderer.render( scene, camera );
        }

        animate();

        let drag = false;
        document.addEventListener('mousedown', () => drag = false);
        document.addEventListener('mousemove', () => drag = true);
        document.addEventListener('mouseup', () => {
            if (drag) {
                return;
            } else {
                if(audio.paused) {
                    for (let i = count; i < count * 2; i++) {
                        particlesGeometry.attributes.position.array[i] = (Math.random() - 0.5) * 10;
                    }
                    audio.play();    
                    context.resume();
                } else {
                    audio.pause();
                    camera.position.x = 0;
                    camera.position.y = 9;
                    camera.position.z = 0;

                    camera.rotation.x = -1.563966;
                    camera.rotation.y = 0;
                    camera.rotation.z = 0;
                }
            } 
        });

        document.addEventListener('resize', () => {
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