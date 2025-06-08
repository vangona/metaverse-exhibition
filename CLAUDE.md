# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based metaverse exhibition application built with Three.js and Cannon.js physics engine. The project creates 3D virtual spaces where users can navigate and interact with immersive environments.

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Architecture

### Core Stack
- **React 17** with functional components and hooks
- **Three.js** for 3D rendering and graphics
- **Cannon.js** for physics simulation
- **@react-three/fiber** and **@react-three/drei** for React-Three.js integration
- **react-router-dom v6** for routing
- **styled-components** for styling
- **dat.gui** for debug controls

### Project Structure

#### Routes (`src/routes/`)
- `Home.js` - Main exhibition space with physics-based navigation and object interaction
- `Seeun.js` - Audio visualizer space with particle effects synchronized to music

#### Components Architecture
- `src/components/building/` - Modular 3D building components (walls, floors, ceilings, lights)
- `src/components/camera/` - Camera system with physics body for collision detection
- `src/components/seeun/` - Specialized building components for the Seeun exhibition space

#### Key Patterns
- **Dual Physics/Render System**: Each 3D object has both a Three.js mesh (visual) and Cannon.js body (physics)
- **Factory Functions**: Building components use factory pattern (e.g., `makeWall()`, `makeFloor()`)
- **Object Synchronization**: Physics bodies drive visual mesh positions via `object.mesh.position.copy(object.body.position)`

### Physics Integration
- Cannon.js world with gravity (-9.82 Y-axis)
- Contact materials for different surface interactions
- Real-time synchronization between physics bodies and Three.js meshes in animation loop

### Navigation Controls
- **Home**: PointerLockControls with WASD/mouse movement, physics-based camera collision
- **Seeun**: OrbitControls for free camera movement around audio visualizer

### Audio Features (Seeun Route)
- Web Audio API integration with real-time frequency analysis
- Particle system responds to audio frequencies (color, position, rotation)
- Click-to-play/pause audio with visual state changes