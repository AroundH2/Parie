import { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber"; // useXRInputSourceStateもインポート
import * as THREE from "three";
import { createXRStore, XR, XROrigin, useXRInputSourceState } from "@react-three/xr";
import { Physics, RigidBody, RapierRigidBody } from "@react-three/rapier";

interface SwordProps {
    onUpperSpeedUpdate: (speed: number) => void;
}

// 剣のコンポーネント
export default function Sword({ onUpperSpeedUpdate }: SwordProps) {
    const upperSwordRef = useRef<RapierRigidBody>(null);  // 上半身部分
    const lowerSwordRef = useRef<RapierRigidBody>(null);  // 下半身部分
    const leftController = useXRInputSourceState("controller", "left"); // 左手のコントローラー
    const rightController = useXRInputSourceState("controller", "right"); // 右手のコントローラー

    const prevUpperPosition = useRef(new THREE.Vector3());
    const prevLowerPosition = useRef(new THREE.Vector3());
    const upperSpeed = useRef(0);
    const lowerSpeed = useRef(0);

    const guardSwordRef = useRef<RapierRigidBody>(null);  // ガード部分

    const [hitEffect, setHitEffect] = useState(false);  // エフェクト状態を管理
    let isGrabbing = false;


    const triggerHitEffect = (part: "upper" | "lower") => {
        if (part === "upper") {
            // Trigger hit effect on collision with "upper" or "lower" sword
            setHitEffect(true);
            onUpperSpeedUpdate(upperSpeed.current); // Update upper speed
            console.log(`${part} sword hit effect triggered`);

            // Reset the hit effect after a short delay
            setTimeout(() => {
                setHitEffect(false);
            }, 200); // 500ms for hit effect duration
        } else {
            console.log("no effect");
        }
    };


    useFrame((state) => {
        if (rightController) {
            const rightSqueezeState = rightController.gamepad["xr-standard-squeeze"];

            if (rightController?.object && rightSqueezeState?.state == "pressed") {
                const rightObject = rightController.object;
                isGrabbing = true;
                const rightPosition = new THREE.Vector3();
                const rightRotation = new THREE.Quaternion();
                const correctionQuaternion = new THREE.Quaternion();

                rightObject.getWorldPosition(rightPosition);
                rightObject.getWorldQuaternion(rightRotation);


                // 剣を垂直にする補正 (90度回転: X軸基準)
                correctionQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);

                // コントローラーの回転に補正を加える
                rightRotation.multiply(correctionQuaternion);

                if (upperSwordRef.current && lowerSwordRef.current && guardSwordRef.current) {
                    const currentPosition = new THREE.Vector3(
                        upperSwordRef.current.translation().x,
                        upperSwordRef.current.translation().y,
                        upperSwordRef.current.translation().z
                    );
                    upperSpeed.current = currentPosition.distanceTo(prevUpperPosition.current) / (1 / 60); // フレームレート補正
                    prevUpperPosition.current.copy(currentPosition);

                    upperSwordRef.current.setTranslation({ x: rightPosition.x, y: rightPosition.y, z: rightPosition.z }, true);
                    upperSwordRef.current.setRotation({ x: rightRotation.x, y: rightRotation.y, z: rightRotation.z, w: rightRotation.w }, true);
                    lowerSwordRef.current.setTranslation({ x: rightPosition.x, y: rightPosition.y, z: rightPosition.z }, true);
                    lowerSwordRef.current.setRotation({ x: rightRotation.x, y: rightRotation.y, z: rightRotation.z, w: rightRotation.w }, true);

                    guardSwordRef.current.setTranslation(lowerSwordRef.current.translation(), true);
                    guardSwordRef.current.setRotation(lowerSwordRef.current.rotation(), true);
                    // 現在の速度を親コンポーネントに渡す
                    onUpperSpeedUpdate(upperSpeed.current);
                }
            } else {
                isGrabbing = false;
            }

        }
    });

    return (
        <>
            {/* 剣の上半身部分 */}
            <RigidBody
                ref={upperSwordRef}
                position={[0, -0.5, 0]}
                type="fixed"
                name="upper_sword"
                onCollisionEnter={(event) => {
                    if (event && upperSpeed.current > 1.0) {
                        triggerHitEffect("upper");
                    } else {
                        triggerHitEffect("lower");
                    }
                }}
            >
                <mesh position={[0, -0.5, 0]} castShadow>
                    <cylinderGeometry args={[0.05, 0.05, 0.7, 8]} />
                    <meshStandardMaterial
                        color={hitEffect ? "#ff0" : "#00f"}  // ヒット時に色を変更
                        emissive={hitEffect ? new THREE.Color(1, 1, 0) : new THREE.Color(0, 0, 0)}  // 光るエフェクト
                        emissiveIntensity={hitEffect ? 1 : 0}  // 光の強さ
                    />
                </mesh>
            </RigidBody>

            {/* 剣の下半身部分 (柄部分) */}
            <RigidBody
                ref={lowerSwordRef}
                position={[0, 0, 0]}
                type="fixed"
                name="lower_sword"
            >
                <mesh position={[0, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 0.37, 10]} />
                    <meshStandardMaterial
                        color="#00f" // 色を変更しない
                        emissive={new THREE.Color(0, 0, 0)} // 光らせない
                        emissiveIntensity={0} // 光の強さは0
                    />
                </mesh>
            </RigidBody>

            {/* 剣のガード部分 */}
            <RigidBody
                ref={guardSwordRef}
                position={[0, -0.17, 0]}
                type="fixed"
                name="guard_sword"
            >
                <mesh position={[0, -0.17, 0]} castShadow>
                    {/* ガード部分はボックスジオメトリを使って表現 */}
                    <boxGeometry args={[0.2, 0.05, 0.2]} />
                    <meshStandardMaterial
                        color="#00f" // ガード部分の色を変更しない
                        emissive={new THREE.Color(0, 0, 0)} // ガード部分は光らせない
                        emissiveIntensity={0} // 光の強さは0
                    />
                </mesh>
            </RigidBody>
        </>
    );
}