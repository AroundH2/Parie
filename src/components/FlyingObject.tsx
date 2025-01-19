// FlyingObject.tsx
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";

interface FlyingObjectProps {
    onHit: (part: "upper" | "lower") => void; // onHitの引数と戻り値の型を指定
    upperSpeed: number;
}

export default function FlyingObject({ onHit, upperSpeed }: FlyingObjectProps) {
    const targetRef = useRef<RapierRigidBody>(null);

    const [initialPosition, setInitialPosition] = useState(new THREE.Vector3(-5, 1, 0));
    const targetPosition = new THREE.Vector3(0, 1, 0);

    const [speed, setSpeed] = useState(2);
    const [isVisible, setIsVisible] = useState(true);

    const randomizeObject = () => {
        // X座標: -5 ~ -3, Y座標: 0.5 ~ 2 の範囲でランダム化
        const randomX = THREE.MathUtils.randFloat(-5, -3);
        const randomY = THREE.MathUtils.randFloat(0.5, 2);
        setInitialPosition(new THREE.Vector3(randomX, randomY, 0));

        // 速度を1.5 ~ 3.0の範囲でランダム化
        const randomSpeed = THREE.MathUtils.randFloat(1.5, 3.0);
        setSpeed(randomSpeed);
    };

    useEffect(() => {
        randomizeObject();
    }, [isVisible]);

    useFrame((state, delta) => {
        if (targetRef.current && isVisible) {

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
                    if (colliderName === "upper_sword" && upperSpeed > 1.0) {
                        console.log("obj1" + upperSpeed);
                        onHit("upper");
                    } else {
                        console.log("obj2" + upperSpeed);
                        onHit("lower");
                    }
                    // 衝突方向を計算し、物体を反発させる
                    if (targetRef.current) {
                        // 衝突点の法線ベクトルを計算（相対位置から推定）
                        const contactNormal = new THREE.Vector3()
                            .subVectors(
                                targetRef.current.translation(), // 自分の位置
                                event.colliderObject.position   // 衝突相手の位置
                            )
                            .normalize();

                        // 物体の現在の速度を取得
                        const velocity = new THREE.Vector3(
                            targetRef.current.linvel().x,
                            targetRef.current.linvel().y,
                            targetRef.current.linvel().z
                        );

                        // 反射ベクトルを計算
                        const reflectedVelocity = velocity.clone().sub(
                            contactNormal.clone().multiplyScalar(2 * velocity.dot(contactNormal))
                        );
                        if (reflectedVelocity.y < 0) {
                            reflectedVelocity.y = -reflectedVelocity.y;
                        }

                        // 反射方向にインパルスを適用
                        const impulseForce = 0.5; // 力の大きさを調整
                        const impulse = reflectedVelocity.normalize().multiplyScalar(impulseForce);
                        targetRef.current.applyImpulse(impulse, true);
                    }


                    setTimeout(() => {
                        setIsVisible(false); // 1秒後に非表示
                    }, 1000);

                    const randomDelay = Math.floor(THREE.MathUtils.randFloat(1000, 3000)); // 再生成遅延時間
                    setTimeout(() => {
                        randomizeObject();
                        setIsVisible(true);
                        console.log("delay");
                    }, 1000 + randomDelay); // 非表示後の遅延時間を含める

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
