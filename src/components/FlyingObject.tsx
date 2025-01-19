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

    const [hitEffect, setHitEffect] = useState(false);
    const [geometryType, setGeometryType] = useState<'box' | 'sphere' | 'cylinder'>('box');
    const [geometryArgs, setGeometryArgs] = useState<[number, number, number] | [number] | [number, number, number, number]>([0.3, 0.3, 0.3]);

    const randomizeObject = () => {
        const randomX = THREE.MathUtils.randFloat(-5, -3);
        const randomY = THREE.MathUtils.randFloat(0.5, 2);
        setInitialPosition(new THREE.Vector3(randomX, randomY, 0));

        const randomSpeed = THREE.MathUtils.randFloat(2.0, 6.0);
        setSpeed(randomSpeed);

        const shapes: ("box" | "sphere" | "cylinder")[] = ['box', 'sphere', 'cylinder'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

        setGeometryType(randomShape);

        switch (randomShape) {
            case 'box':
                const boxWidth = THREE.MathUtils.randFloat(0.2, 0.3);
                const boxHeight = THREE.MathUtils.randFloat(0.2, 0.3);
                const boxDepth = THREE.MathUtils.randFloat(0.2, 0.3);
                setGeometryArgs([boxWidth, boxHeight, boxDepth]);
                break;
            case 'sphere':
                const sphereRadius = THREE.MathUtils.randFloat(0.2, 0.25);
                setGeometryArgs([sphereRadius]);
                break;
            case 'cylinder':
                const radiusTop = THREE.MathUtils.randFloat(0.1, 0.3);
                const radiusBottom = THREE.MathUtils.randFloat(0.1, 0.3);
                const height = THREE.MathUtils.randFloat(0.3, 0.5);
                const radialSegments = 10; // セグメント数
                setGeometryArgs([radiusTop, radiusBottom, height, radialSegments]);
                break;
        }
    };

    const triggerHitEffect = (part: string) => {
        if (part === "upper") {
            setHitEffect(true);
            onHit(part);
            // 即座にhitEffectをfalseに設定
        } else {
            console.error("Invalid part value:", part);
        }
    };

    useEffect(() => {
        randomizeObject();
    }, [isVisible]);

    useFrame((state, delta) => {
        if (targetRef.current && isVisible) {
            const currentPosition = targetRef.current.translation();

            const direction = targetPosition
                .clone()
                .sub(new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z))
                .normalize();

            const newPosition = new THREE.Vector3(currentPosition.x, currentPosition.y, currentPosition.z).add(
                direction.multiplyScalar(speed * delta)
            );

            targetRef.current.setTranslation({ x: newPosition.x, y: newPosition.y, z: newPosition.z }, true);

            if (newPosition.distanceTo(targetPosition) < 0.1) {
                targetRef.current.setTranslation(initialPosition, true);
            }
        }
    });

    return isVisible ? (
        <RigidBody
            ref={targetRef}
            type="dynamic"
            onCollisionEnter={(event) => {
                if (!isVisible) return; // 非表示中は処理しない
                const colliderName = (event.colliderObject as any).name;
                if (event.colliderObject && event.colliderObject.name) {
                    if (colliderName === "upper_sword" && upperSpeed > 1.0) {
                        triggerHitEffect("upper");
                        onHit("upper");
                    } else {
                        triggerHitEffect("lower");
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

                    // オブジェクトが消えるまで少し待つ
                    setTimeout(() => {
                        setHitEffect(false); // ヒットエフェクトをオフ
                        setIsVisible(false); // オブジェクトを非表示
                        console.log("visible false");
                    }, 250); // 300ms待つ (エフェクトが十分に見える時間)

                    // ランダムな遅延後にオブジェクトを再出現させる
                    const randomDelay = Math.random() * 1000 + 400;
                    setTimeout(() => {
                        randomizeObject();
                        setIsVisible(true);
                        console.log("visible true");
                    }, randomDelay + 400); // エフェクト表示時間を考慮
                }
            }}
            position={initialPosition.toArray()}
        >
            <mesh castShadow>
                <meshStandardMaterial color={hitEffect ? "#ff0" : "#f00"} />
                {geometryType === 'box' && <boxGeometry args={geometryArgs} />}
                {geometryType === 'sphere' && <sphereGeometry args={geometryArgs} />}
                {geometryType === 'cylinder' && <cylinderGeometry args={geometryArgs} />}
            </mesh>
        </RigidBody>
    ) : null;
}

