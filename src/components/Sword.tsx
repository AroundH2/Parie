import { useRef } from "react";
import { useFrame } from "@react-three/fiber"; // useXRInputSourceStateもインポート
import * as THREE from "three";
import { createXRStore, XR, XROrigin, useXRInputSourceState } from "@react-three/xr";
import { Physics, RigidBody, RapierRigidBody } from "@react-three/rapier";

// 剣のコンポーネント
export default function Sword() {
    const swordRef = useRef<RapierRigidBody>(null);
    const upperSwordRef = useRef<RapierRigidBody>(null);  // 上半身部分
    const lowerSwordRef = useRef<RapierRigidBody>(null);  // 下半身部分
    const leftController = useXRInputSourceState("controller", "left"); // 左手のコントローラー
    const rightController = useXRInputSourceState("controller", "right"); // 右手のコントローラー

    let isGrabbing = false;

    useFrame(() => {
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

                if (upperSwordRef.current && lowerSwordRef.current) {

                    upperSwordRef.current.setTranslation({ x: rightPosition.x, y: rightPosition.y, z: rightPosition.z }, true);
                    upperSwordRef.current.setRotation({ x: rightRotation.x, y: rightRotation.y, z: rightRotation.z, w: rightRotation.w }, true);

                    lowerSwordRef.current.setTranslation({ x: rightPosition.x, y: rightPosition.y, z: rightPosition.z }, true);
                    lowerSwordRef.current.setRotation({ x: rightRotation.x, y: rightRotation.y, z: rightRotation.z, w: rightRotation.w }, true);
                }
            } else {
                isGrabbing = false;
            }
        }
    });

    return (
        <>
            <RigidBody
                ref={swordRef}
                position={[0, 0, 0]}
                type="dynamic"
                name="sword" // 衝突判定のための名前を設定
            >
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[0.2, 1, 0.2]} />
                    <meshStandardMaterial color="#00f" />
                </mesh>
            </RigidBody>

            {/* 剣の上半身部分 */}
            <RigidBody
                ref={upperSwordRef}
                position={[0, -0.7, 0]}
                type="fixed"
                name="upper_sword"
            >
                <mesh position={[0, -0.7, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.3, 0.2]} />
                    <meshStandardMaterial color="#00f" />
                </mesh>
            </RigidBody>

            {/* 剣の下半身部分 */}
            <RigidBody
                ref={lowerSwordRef}
                position={[0, -0.25, 0]}
                type="fixed"
                name="lower_sword"
            >
                <mesh position={[0, -0.25, 0]} castShadow>
                    <boxGeometry args={[0.2, 0.63, 0.2]} />
                    <meshStandardMaterial color="#00f" />
                </mesh>
            </RigidBody>
        </>
    );
}