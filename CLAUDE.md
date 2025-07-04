# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based metaverse exhibition application featuring an immersive audio visualizer for "Liszt's Solace" piano performance. The project creates 3D virtual spaces with real-time audio-reactive particle animations and physics-based navigation.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy

# Build then deploy (runs predeploy automatically)
npm run predeploy && npm run deploy
```

## Architecture

### Core Stack
- **React 18** with functional components and hooks
- **Three.js 0.177** for 3D rendering and graphics
- **Cannon-ES 0.20** for physics simulation (migrated from cannon.js)
- **@react-three/fiber** and **@react-three/drei** for React-Three.js integration
- **react-router-dom v6** for routing
- **styled-components** for CSS-in-JS styling
- **lil-gui** for debug controls (migrated from dat.gui)

### Critical Implementation Details

#### Audio Context Management
- **React 18 Strict Mode Issue**: The application does NOT use React.StrictMode due to Web Audio API double initialization issues
- Audio elements must track connection state via `data-source-connected` attribute to prevent multiple MediaElementSourceNode connections
- Cleanup functions in useEffect must properly handle audio context disconnection

#### Three.js Geometry Patterns
- **PointsMaterial Compatibility**: When using PointsMaterial, geometry must be BufferGeometry
- Convert standard geometries to BufferGeometry before using with PointsMaterial:
  ```javascript
  const tempGeometry = new THREE.SphereGeometry(0.6, 32, 32);
  const positions = tempGeometry.attributes.position.array;
  bufferGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  ```
- **sizeAttenuation**: Set to `true` for proper zoom behavior with PointsMaterial

### Project Structure

#### Routes (`src/routes/`)
- `Home.js` - Main exhibition space with first-person physics-based navigation (WASD controls)
- `Seeun.js` - Solace piano audio visualizer with orbit camera controls and real-time particle effects

#### Components Architecture
- `src/components/building/` - Factory pattern 3D building components
  - Each component returns objects with both `mesh` (Three.js visual) and `body` (Cannon-ES physics)
  - Components: `makeWall()`, `makeFloor()`, `makeCeil()`, `makeBulb()`
- `src/components/camera/` - Camera system with physics body for collision detection
- `src/components/seeun/` - Specialized building components for the Seeun exhibition space

#### Key Patterns
- **Dual Physics/Render System**: Each 3D object has both a Three.js mesh and Cannon-ES body
- **Animation Loop Sync**: Physics bodies drive visual mesh positions via `mesh.position.copy(body.position)`
- **Factory Functions**: All building components use factory pattern returning `{mesh, body}` objects
- **Audio Frequency Analysis**: 
  - FFT size: 2048 for frequency resolution
  - Separate low/high frequency band analysis
  - 60fps synchronized visual updates

### Physics Integration
- Cannon-ES world with gravity (-9.82 Y-axis)
- Contact materials for surface friction/restitution
- Camera has physics body for collision detection in Home route
- Real-time position synchronization in render loop

### Navigation Controls
- **Home Route**: 
  - PointerLockControls with WASD movement
  - Physics-based collision detection
  - Jump functionality with spacebar
- **Seeun Route**: 
  - OrbitControls with mouse interactions
  - Auto-rotation when idle
  - Initial camera position: (3, 7, 3) for diagonal view

### Audio Visualization Features (Seeun Route)
- **Sphere Visualizer**: Central particle cloud responding to audio frequencies
- **Floating Particles**: 250 particles with frequency-based movement
- **UI Overlay**: Auto-hiding control guide (3 second timeout)
- **Audio Analysis**: Web Audio API with real-time FFT analysis
- **Visual Effects**: 
  - Particle color shifts based on frequency bands
  - Gravity effect on particles when music stops
  - Additive blending for glow effects

### Important Migration Notes
- **React 18**: Uses new createRoot API instead of ReactDOM.render
- **Cannon-ES**: Import from 'cannon-es' not 'cannon'
- **lil-gui**: Replace `new GUI()` imports from 'lil-gui' not 'dat.gui'
- **Three.js**: SphereBufferGeometry → SphereGeometry (BufferGeometry is now default)