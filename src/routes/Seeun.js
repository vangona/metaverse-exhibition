import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import * as THREE from 'three';
import * as CANNON from "cannon-es";

// Global audio context types (for TypeScript support)

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import seeunMusic from '../music/seeun.mp3';
import fog from "../textures/particles/1.png";

const Container = styled.div`
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
`;

const ControlOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 100;
    opacity: ${props => props.visible ? 1 : 0};
    transition: opacity 0.3s ease;
`;

const InfoPanel = styled.div`
    position: absolute;
    top: 30px;
    left: 30px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-family: 'Arial', sans-serif;
    max-width: 400px;
    word-break: keep-all;
    backdrop-filter: blur(10px);
    
    @media (max-width: 768px) {
        top: 20px;
        left: 20px;
        right: 20px;
        max-width: none;
        padding: 15px;
    }
`;

const Title = styled.h2`
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #6667AB;
    
    @media (max-width: 768px) {
        font-size: 20px;
    }
`;

const Description = styled.p`
    margin: 0 0 15px 0;
    font-size: 14px;
    line-height: 1.5;
    color: #ccc;
    
    @media (max-width: 768px) {
        font-size: 12px;
        margin: 0 0 10px 0;
    }
`;

const PlayControls = styled.div`
    position: absolute;
    bottom: 50px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 15px;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px 25px;
    border-radius: 25px;
    backdrop-filter: blur(10px);
    
    @media (max-width: 768px) {
        bottom: 30px;
        padding: 12px 20px;
        gap: 10px;
    }
`;

const PlayButton = styled.button`
    background: #6667AB;
    border: none;
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: background 0.3s ease;
    pointer-events: auto;
    
    &:hover {
        background: #7778BC;
    }
    
    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }
`;

const StatusText = styled.span`
    color: white;
    font-size: 14px;
    margin-left: 10px;
    
    @media (max-width: 768px) {
        font-size: 12px;
        margin-left: 5px;
    }
`;

const ControlGuide = styled.div`
    position: absolute;
    top: 30px;
    right: 30px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-family: 'Arial', sans-serif;
    backdrop-filter: blur(10px);
    max-width: 280px;
`;

const GuideTitle = styled.h3`
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #6667AB;
`;

const GuideItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const GuideIcon = styled.span`
    background: rgba(102, 103, 171, 0.3);
    color: #6667AB;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: bold;
    margin-right: 12px;
    min-width: 60px;
    text-align: center;
    border: 1px solid rgba(102, 103, 171, 0.5);
`;

const GuideText = styled.span`
    color: #ccc;
    line-height: 1.4;
`;

const HideHint = styled.div`
    position: absolute;
    bottom: 30px;
    right: 30px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    text-align: right;
    
    @media (max-width: 768px) {
        bottom: 100px;
        left: 20px;
        right: 20px;
        text-align: center;
        background: rgba(0, 0, 0, 0.5);
        padding: 10px;
        border-radius: 8px;
    }
`;


const Seeun = () => {
    const mount = useRef();
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const mediaSourceRef = useRef(null);
    const [showControls, setShowControls] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const hideControlsTimeoutRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    // Mouse movement handler to show/hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        
        // Clear existing timeout
        if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current);
        }
        
        // Set new timeout to hide controls after 3 seconds
        hideControlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    // Audio control functions
    const togglePlayPause = () => {
        const audio = document.getElementById('seeunAudio');
        if (audio) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play();
                setIsPlaying(true);
                if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume();
                }
            }
        }
    };

    function init() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer({ 
            antialias: window.devicePixelRatio === 1,
            powerPreference: 'high-performance'
        });
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        renderer.shadowMap.enabled = true;

        mount.current.appendChild( renderer.domElement );

        const light = new THREE.HemisphereLight( 0x404040 );
        scene.add(light);

        light.position.y = 2.5;

        camera.position.x = 3;
        camera.position.y = 7;
        camera.position.z = 3;

        const controls = new OrbitControls( camera, renderer.domElement );
        controls.enabled = true;
        controls.target.set(0, 2.5, 0); // Look at sphereVisualizer position
        controls.enableDamping = true; // 부드러운 움직임
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enableRotate = true;
        controls.enablePan = true;
        
        // Touch configuration for mobile
        controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };
        
        controls.update();

        const audio = document.getElementById('seeunAudio');

        // Check if audio element already has a source node using a data attribute
        if (audio.hasAttribute('data-source-connected')) {
            // Use existing context if available
            if (!audioContextRef.current && window._globalAudioContext) {
                audioContextRef.current = window._globalAudioContext;
                analyserRef.current = window._globalAnalyser;
            }
            if (!audioContextRef.current) return () => {}; // Skip if no context available
        } else {
            // Initialize audio context and analyser only once
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
                analyserRef.current = audioContextRef.current.createAnalyser();
                analyserRef.current.connect(audioContextRef.current.destination);
                analyserRef.current.fftSize = 2048;
                
                // Create media source only once and mark as connected
                try {
                    mediaSourceRef.current = audioContextRef.current.createMediaElementSource(audio);
                    mediaSourceRef.current.connect(analyserRef.current);
                    audio.setAttribute('data-source-connected', 'true');
                    
                    // Store globally to reuse
                    window._globalAudioContext = audioContextRef.current;
                    window._globalAnalyser = analyserRef.current;
                } catch (error) {
                    console.warn('Audio source already connected:', error);
                    return () => {};
                }
            }
        }

        const context = audioContextRef.current;
        const analyser = analyserRef.current;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        // cannon world setting
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);


        // visualizers

        const textureLoader = new THREE.TextureLoader();
        
        // Create geometries first
        const particlesGeometry = new THREE.BufferGeometry();
        
        // Create simple test sphere with basic SphereGeometry converted to points
        const tempSphereGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        const sphereVisualizerGeometry = new THREE.BufferGeometry();
        
        // Get positions from the sphere geometry
        const spherePositions = tempSphereGeometry.attributes.position.array;
        sphereVisualizerGeometry.setAttribute('position', new THREE.BufferAttribute(spherePositions, 3));
        
        // Create materials with placeholder texture
        const sphereVisualizerMaterial = new THREE.PointsMaterial({
            transparent: true,
            alphaTest: 0.1,
            size: 0.1,
            sizeAttenuation: true,
            color: new THREE.Color('#6667AB'),
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particlesMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            transparent: true,
            alphaTest: 0.01,
            size: 0.2,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Load texture with proper error handling
        // eslint-disable-next-line no-unused-vars
        const particleTexture = textureLoader.load(
            fog,
            function (texture) {
                // onLoad callback
                console.log('Texture loaded successfully');
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false;
                
                // Apply texture to materials
                sphereVisualizerMaterial.map = texture;
                sphereVisualizerMaterial.alphaMap = texture;
                sphereVisualizerMaterial.needsUpdate = true;
                
                particlesMaterial.map = texture;
                particlesMaterial.alphaMap = texture;
                particlesMaterial.needsUpdate = true;
            },
            function (progress) {
                // onProgress callback
                console.log('Loading progress:', progress);
            },
            function (error) {
                // onError callback
                console.error('Error loading texture:', error);
            }
        );

        const sphereVisualizer = new THREE.Points(sphereVisualizerGeometry, sphereVisualizerMaterial);

        sphereVisualizer.position.set(0, 2.5, 0);
        
        scene.add(sphereVisualizer);

        // Particles setup
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

        // Camera position already set above

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
            
            // Update controls for smooth damping
            controls.update();

            renderer.render( scene, camera );
        }

        animate();

        // Mouse and touch event handlers
        document.addEventListener('mousemove', handleMouseMove);
        
        // Touch events for mobile
        let touchStartTime = 0;
        const handleTouchStart = () => {
            touchStartTime = Date.now();
            handleMouseMove();
        };
        
        const handleTouchMove = () => {
            handleMouseMove();
        };
        
        const handleTouchEnd = () => {
            const touchDuration = Date.now() - touchStartTime;
            // Double tap detection (two taps within 300ms)
            if (touchDuration < 300) {
                camera.position.set(3, 7, 3);
                controls.target.set(0, 2.5, 0);
                controls.update();
            }
        };
        
        if ('ontouchstart' in window) {
            renderer.domElement.addEventListener('touchstart', handleTouchStart);
            renderer.domElement.addEventListener('touchmove', handleTouchMove);
            renderer.domElement.addEventListener('touchend', handleTouchEnd);
        }
        
        // Double click to reset camera position
        renderer.domElement.addEventListener('dblclick', () => {
            camera.position.set(3, 7, 3);
            controls.target.set(0, 2.5, 0);
            controls.update();
        });
        
        // Audio state change listeners
        audio.addEventListener('play', () => setIsPlaying(true));
        audio.addEventListener('pause', () => setIsPlaying(false));

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize)


        function avg(arr){
            var total = arr.reduce(function(sum, b) { return sum + b; });
            return (total / arr.length);
        }
        
        function max(arr){
            return arr.reduce(function(a, b){ return Math.max(a, b); })
        }

        // Return cleanup function
        return () => {
            // Remove event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            
            // Remove touch listeners if they were added
            if ('ontouchstart' in window && renderer && renderer.domElement) {
                renderer.domElement.removeEventListener('touchstart', handleTouchStart);
                renderer.domElement.removeEventListener('touchmove', handleTouchMove);
                renderer.domElement.removeEventListener('touchend', handleTouchEnd);
            }
            
            if (renderer && renderer.domElement) {
                renderer.domElement.removeEventListener('dblclick', () => {});
            }
            const audio = document.getElementById('seeunAudio');
            if (audio) {
                audio.removeEventListener('play', () => setIsPlaying(true));
                audio.removeEventListener('pause', () => setIsPlaying(false));
            }
            
            // Clear timeout
            if (hideControlsTimeoutRef.current) {
                clearTimeout(hideControlsTimeoutRef.current);
            }
            
            // Don't close the audio context in development due to Strict Mode
            // The context will be reused across re-renders
            if (process.env.NODE_ENV === 'production') {
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                    if (audio) {
                        audio.removeAttribute('data-source-connected');
                    }
                }
                audioContextRef.current = null;
                analyserRef.current = null;
                mediaSourceRef.current = null;
                window._globalAudioContext = null;
                window._globalAnalyser = null;
            }
        };
    }

    useEffect(() => {
        // Check if mobile device
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        const cleanup = init();
        return () => {
            window.removeEventListener('resize', checkMobile);
            cleanup();
        };
    }, [])

    return (
        <Container ref={mount} onMouseMove={handleMouseMove}>
            <audio id='seeunAudio' src={seeunMusic} />
            
            <ControlOverlay visible={showControls}>
                <InfoPanel>
                    <Title>Solace Piano Visualization</Title>
                    <Description>
                        이 시각화는 Liszt - Solace 피아노 연주를 바탕으로, 음의 크기와 높낮이를 기반으로 입자들이 움직이는 것을 시각화하여 연주에 더 몰입할 수 있게 합니다.
                    </Description>
                    <Description>
                        중앙의 구형 시각화와 주변 파티클들이 음악에 반응하여 실시간으로 변화합니다.
                    </Description>
                </InfoPanel>
                
                {!isMobile && (
                    <ControlGuide>
                        <GuideTitle>시점 조작 가이드</GuideTitle>
                        <GuideItem>
                            <GuideIcon>드래그</GuideIcon>
                            <GuideText>마우스 좌클릭 + 드래그로 시점 회전</GuideText>
                        </GuideItem>
                        <GuideItem>
                            <GuideIcon>휠</GuideIcon>
                            <GuideText>마우스 휠로 줌인/줌아웃</GuideText>
                        </GuideItem>
                        <GuideItem>
                            <GuideIcon>우클릭</GuideIcon>
                            <GuideText>우클릭 + 드래그로 시점 이동</GuideText>
                        </GuideItem>
                        <GuideItem>
                            <GuideIcon>더블클릭</GuideIcon>
                            <GuideText>더블클릭으로 시점 초기화</GuideText>
                        </GuideItem>
                    </ControlGuide>
                )}
                
                <PlayControls>
                    <PlayButton onClick={togglePlayPause}>
                        {isPlaying ? '⏸' : '▶'}
                    </PlayButton>
                    <StatusText>
                        {isPlaying ? '재생 중...' : '클릭하여 재생'}
                    </StatusText>
                </PlayControls>
                
                <HideHint>
                    {isMobile ? (
                        <>터치 조작: 한 손가락으로 회전, 두 손가락으로 확대/축소 및 이동</>
                    ) : (
                        <>마우스를 정지하면 3초 후 컨트롤이 숨겨집니다<br/>
                        마우스를 움직이면 다시 나타납니다</>
                    )}
                </HideHint>
            </ControlOverlay>
        </Container>
    );
};

export default Seeun;