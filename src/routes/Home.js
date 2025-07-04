import React, { useEffect, useRef, useState } from "react";
import { Helmet } from 'react-helmet-async';
import styled from "styled-components";

import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GUI } from "lil-gui";

import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import makeBuilding from "../components/building/makeBuilding";
import makeCamera from "../components/camera/makeCamera";
import { Raycaster } from "three";

const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const MobileWarning = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  max-width: 90%;
  width: 400px;
  font-family: Arial, sans-serif;
  
  h2 {
    color: #6667AB;
    margin-bottom: 20px;
  }
  
  p {
    margin-bottom: 20px;
    line-height: 1.5;
  }
  
  a {
    color: #6667AB;
    text-decoration: none;
    font-weight: bold;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Home = () => {
  const mount = useRef();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;

    mount.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffbb, 1);

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    light.castShadow = true;

    light.position.x = 3;
    light.position.y = 5;
    light.position.z = 2;
    scene.add(light);

    camera.position.x = 0.5;
    camera.position.y = 0.5;
    camera.position.z = 3;

    const controls = new PointerLockControls(camera, renderer.domElement);

    const raycaster = new Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = mouse.y = -1;
    raycaster.setFromCamera(mouse, camera);

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.position.y = 2;
    scene.add(axesHelper);

    // cannon world setting
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // world materials definition, adding to world.
    const defaultMaterial = new CANNON.Material("default");
    const concreteMaterial = new CANNON.Material("concrete");
    const plasticMaterial = new CANNON.Material("plastic");

    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0.1,
        restitution: 0.7,
      }
    );

    world.addContactMaterial(defaultContactMaterial);

    const concretePlasticContactMaterial = new CANNON.ContactMaterial(
      concreteMaterial,
      plasticMaterial,
      {
        friction: 0.1,
        restitution: 0.7,
      }
    );

    world.addContactMaterial(concretePlasticContactMaterial);
    world.defaultContactMaterial = defaultContactMaterial;

    // build buildings
    const buildings = makeBuilding();
    const objToUpdate = [];

    for (const building of buildings) {
      if (building.mesh) {
        scene.add(building.mesh);
        if (building.body) {
          objToUpdate.push(building);
        }
      }
      if (building.body) {
        world.addBody(building.body);
      }
    }

    const cameraPosition = makeCamera();

    scene.add(cameraPosition.mesh);
    world.addBody(cameraPosition.body);

    // Control event handlers.
    let forwardState = false;
    let backwardState = false;
    window.addEventListener("keydown", (e) => {
      if (e.key === "w") {
        forwardState = true;
      }
      if (e.key === "s") {
        backwardState = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "w") {
        forwardState = false;
      }
      if (e.key === "s") {
        backwardState = false;
      }
    });

    window.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        forwardState = true;
      }

      if (e.button === 2) {
        backwardState = true;
      }
    });

    window.addEventListener("mouseup", (e) => {
      backwardState = false;
      forwardState = false;
    });

    window.addEventListener("mousemove", () => {
      // z축은 ok, x축에 무언가 문제가 있음.
      // Euler 변환법의 짐벌락 문제로 추정 (2022.06.15.)
      cameraPosition.mesh.quaternion.copy(raycaster.camera.quaternion);
    });

    window.addEventListener("click", () => {
      controls.lock();
    });

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // functions
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
        position: new CANNON.Vec3(position.x, position.y, position.z),
        shape,
        material: defaultMaterial,
      });

      body.position.copy(position);
      world.addBody(body);

      objToUpdate.push({ mesh, body });
    };

    // Dat.GUI

    const gui = new GUI();
    const debugObject = {};

    debugObject.createSphere = () => {
      createSphere(
        Math.random() * 0.3 + 0.2,
        {
          x: (Math.random() - 0.5) * 3,
          y: 3,
          z: (Math.random() - 0.5) * 3,
        },
        Math.random() * 0xffffff
      );
    };

    gui.add(debugObject, "createSphere");

    // body with time
    const clock = new THREE.Clock();
    let oldElapsedTime = 0;

    let rotation;
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const delataTime = elapsedTime - oldElapsedTime;
      oldElapsedTime = elapsedTime;

      world.step(1 / 60, delataTime, 3);

      for (const object of objToUpdate) {
        object.mesh.position.copy(object.body.position);
      }

      let speed = 0.01;
      if (speed < 0.3) {
        speed += 0.01;
      }

      // move event
      if (forwardState) {
        rotation = new THREE.Euler().setFromQuaternion(
          cameraPosition.mesh.quaternion
        );
        cameraPosition.body.position.x += speed * Math.sin(rotation.x);
        cameraPosition.body.position.z -= speed * Math.cos(rotation.z);
      }

      // move event
      if (backwardState) {
        cameraPosition.body.position.x -=
          speed * Math.sin(cameraPosition.mesh.quaternion.x);
        cameraPosition.body.position.z +=
          speed * Math.cos(cameraPosition.mesh.quaternion.z);
      }

      cameraPosition.mesh.position.copy(cameraPosition.body.position);
      camera.position.copy(cameraPosition.body.position);
    };

    const animate = function () {
      requestAnimationFrame(animate);
      tick();
      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;
      // cube.rotation.z += 0.01;

      // controls.update();

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Return cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      gui.destroy();
      if (renderer && renderer.domElement && mount.current) {
        mount.current.removeChild(renderer.domElement);
      }
    };
  }

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, []);

  return (
    <Container ref={mount}>
      <Helmet>
        <title>Metaverse Exhibition | 3D Virtual Space</title>
        <meta name="description" content="3D 가상 전시 공간에서 피아노 시각화를 체험해보세요. Three.js와 물리 엔진을 활용한 몰입형 메타버스 전시회입니다." />
        <meta property="og:title" content="Metaverse Exhibition - 3D Virtual Exhibition Space" />
        <meta property="og:description" content="WASD 키보드 조작으로 탐험하는 3D 가상 전시 공간. 피아노 시각화와 인터랙티브 요소가 있는 메타버스 경험을 제공합니다." />
        <meta name="keywords" content="metaverse, 3d exhibition, virtual space, three.js, cannon.js, 메타버스, 가상전시, 3d공간" />
      </Helmet>
      {isMobile && (
        <MobileWarning>
          <h2>데스크톱 전용 콘텐츠</h2>
          <p>
            이 전시 공간은 WASD 키보드 조작과 마우스 움직임이 필요하여
            데스크톱 환경에서만 이용 가능합니다.
          </p>
          <p>
            모바일에서는 <a href="/seeun">Solace 피아노 시각화</a>를
            체험해보세요.
          </p>
        </MobileWarning>
      )}
    </Container>
  );
};

export default Home;
