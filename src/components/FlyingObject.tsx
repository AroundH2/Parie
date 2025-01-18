// FlyingObject.tsx
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";

interface FlyingObjectProps {
    onHit: (part: "upper" | "lower") => void; // onHitの引数と戻り値の型を指定
}

export default function FlyingObject({ onHit }: FlyingObjectProps) {
    const targetRef = useRef<RapierRigidBody>(null);

    const initialPosition = new THREE.Vector3(-5, 1, 0);
    const targetPosition = new THREE.Vector3(0, 1, 0);

    const [isVisible, setIsVisible] = useState(true);

    useFrame((state, delta) => {
        if (targetRef.current && isVisible) {
            const speed = 2;

            // RigidBodyの現在の位置を取得し、THREE.Vector3に変換
            const currentPosition = targetRef.current.translation();

            // 方向ベクトルを計算
            const direction = targetPosition
                .clone()
                .sub(new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z))
                .normalize();

            // 新しい位置を計算
            const newPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z).add(
                direction.multiplyScalar(speed * delta)
            );

            // 新しい位置を更新
            targetRef.current.setTranslation({ x: newPosition.x, y: newPosition.y, z: newPosition.z }, true);

            // 目標位置に近づいた場合、初期位置にリセット
            if (newPosition.distanceTo(targetPosition) < 0.1) {
                targetRef.current.setTranslation(initialPosition, true);
            }
        }
    });

    return isVisible ? (
        <RigidBody
            ref={targetRef} // 1つのrefでRigidBodyを管理
            type="dynamic"

            onCollisionEnter={(event) => {
                console.log(event);
                const colliderName = (event.colliderObject as any).name; // 型アサーションで名前を取得
                console.log(colliderName);
                if (event.colliderObject && event.colliderObject.name) {
                    // オブジェクトを非表示にする
                    // nameをstring型で取得し、"sword"と比較
                    if (colliderName === "upper_sword") {
                        onHit("upper");
                    } else if (colliderName === "lower_sword") {
                        onHit("lower");
                    }
                    // 衝突方向を計算し、物体を反発させる
                    if (targetRef.current) {
                        const impulseDirection = new THREE.Vector3(1, 1, 1);
                        const impulseForce = 1; // 力の大きさ
                        const impulse = new THREE.Vector3().copy(impulseDirection).normalize().multiplyScalar(impulseForce);

                        targetRef.current.applyImpulse(impulse, true);
                    }
                    setTimeout(() => {
                        setIsVisible(false); // オブジェクトを再表示する
                    }, 1000);

                    setTimeout(() => {
                        setIsVisible(true); // オブジェクトを再表示する
                    }, 2000); // 3秒後に再表示
                    console.log("Collision with sword detected!");
                }
            }}
            position={initialPosition.toArray()}
        >
            <mesh castShadow>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial color="#f00" />
            </mesh>
        </RigidBody>
    ) : null;
}
