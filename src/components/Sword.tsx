import { useRef } from "react";
import { useFrame } from "@react-three/fiber"; // `useXRInputSourceState`もインポート
import * as THREE from "three";
import { createXRStore, XR, XROrigin, useXRInputSourceState } from "@react-three/xr";
import { Physics, RigidBody, RapierRigidBody } from "@react-three/rapier";

// 剣のコンポーネント
export default function Sword() {
    const swordRef = useRef<RapierRigidBody>(null);
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

                if (swordRef.current) {
                    swordRef.current.setTranslation({ x: rightPosition.x, y: rightPosition.y, z: rightPosition.z }, true);
                    swordRef.current.setRotation({ x: rightRotation.x, y: rightRotation.y, z: rightRotation.z, w: rightRotation.w }, true);
                }
            } else {
                isGrabbing = false;
            }
        }
    });

    return (
        <>
            <XROrigin>
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
            </XROrigin>
        </>
    );
}
