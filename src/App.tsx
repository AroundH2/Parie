import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Plane } from "@react-three/drei";
import * as THREE from "three";

function App() {
  return (
    <>
      <Canvas
        camera={{
          position: [0, 5, 8],
          fov: 50,
          near: 0.1,
          far: 2000,
        }}
        dpr={window.devicePixelRatio}
        shadows
        style={{ width: "100vw", height: "100vh" }}
      >
        {/* 背景色 */}
        <color attach="background" args={["#DDDDDD"]} />
        {/* カメラの操作 */}
        <OrbitControls />
        {/* ライトの設定 */}
        <ambientLight intensity={0.1} />
        <directionalLight
          position={[2, 6, 4]}
          intensity={1}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          castShadow
        />
        {/* オブジェクト */}
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#f00" />
        </mesh>
        {/* 床 */}
        <Plane rotation={[-Math.PI / 2, 0, 0]} args={[10, 10]} receiveShadow>
          <meshStandardMaterial color="#fff" side={THREE.DoubleSide} />
        </Plane>
      </Canvas>
    </>
  );
}

export default App;
