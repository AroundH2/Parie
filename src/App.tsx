import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Plane } from "@react-three/drei";
import Sword from "./components/Sword";
import FlyingObject from "./components/FlyingObject";
import Lighting from "./components/Lighting";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { createXRStore, XR } from "@react-three/xr";
import { Physics } from "@react-three/rapier"; // Import Physics
import hitSound from './assets/mp3/hit-sound.mp3';

const store = createXRStore();

function App() {
  const [upperSpeed, setUpperSpeed] = useState(0);

  const successaudioRef = useRef<HTMLAudioElement | null>(null);
  const failaudioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!successaudioRef.current) {
      const audio = new Audio("./mp3/hit-sound.mp3");
      successaudioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    if (!failaudioRef.current) {
      const audio = new Audio("./mp3/fail-sound.mp3");
      failaudioRef.current = audio;
    }
  }, []);

  const handleHit = (part: string) => {
    console.log(part);
    if (part === "upper" && successaudioRef.current) {
      successaudioRef.current.currentTime = 0;
      successaudioRef.current.play();
      console.log("success");
    } else if (part === "lower" && failaudioRef.current) {
      failaudioRef.current.currentTime = 0;
      failaudioRef.current.play();
      console.log("fail");
    }
  };

  return (
    <>
      <button
        onClick={() => store.enterVR()}
        style={{
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          height: "100px",
          width: "200px",
        }}
      >
        Enter VR
      </button>
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
        {/* XRコンポーネントをここでラップする */}
        <XR store={store}>
          <color attach="background" args={["#DDDDDD"]} />
          <OrbitControls />
          <Lighting />

          <Physics gravity={[0, 0, 0]}>
            <Sword onUpperSpeedUpdate={setUpperSpeed} />
            <FlyingObject upperSpeed={upperSpeed} onHit={handleHit} />
          </Physics>

          <Plane rotation={[-Math.PI / 2, 0, 0]} args={[10, 10]} receiveShadow>
            <meshStandardMaterial color="#fff" side={THREE.DoubleSide} />
          </Plane>
        </XR>
      </Canvas>
    </>
  );
}

export default App;