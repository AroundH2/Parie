import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";

interface FlyingObjectProps {
    onHit: () => void;
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
                if (event.colliderObject && event.colliderObject.name === "sword") {
                    console.log("test");
                    onHit(); // ヒット時の処理を呼び出し
                    setIsVisible(false); // オブジェクトを非表示にする

                    if (targetRef.current) {
                        // 衝突後にランダムな位置に移動
                        targetRef.current.setTranslation(
                            {
                                x: Math.random() * 5 - 2.5, // ランダムなX位置
                                y: 6, // 固定のY位置
                                z: Math.random() * 5 - 2.5, // ランダムなZ位置
                            },
                            true
                        );
                    }

                    setTimeout(() => {
                        setIsVisible(true); // オブジェクトを再表示する
                    }, 3000); // 3秒後に再表示
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
