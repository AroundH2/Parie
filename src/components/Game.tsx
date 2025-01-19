import React, { useState, useCallback } from "react";
import { Text } from "@react-three/drei";

const TimerButton = ({ onClick, position }: { onClick: () => void; position: [number, number, number] }) => {
    return (
        <mesh position={position} onClick={onClick}>
            <boxGeometry args={[2, 1, 0.2]} />
            <meshStandardMaterial color="green" />
            <Text fontSize={0.3} color="white" position={[0, 0, 0.1]}>
                Start Timer
            </Text>
        </mesh>
    );
};

const TimeDisplay = ({ timeLeft }: { timeLeft: number }) => {
    return (
        <Text fontSize={0.5} color="black" position={[0, 2, -2]}>
            Time Left: {timeLeft}s
        </Text>
    );
};

const SuccessDisplay = ({ successCount }: { successCount: number }) => {
    console.log(successCount);
    successCount = successCount / 2;
    return (
        <Text fontSize={0.5} color="black" position={[0, 2, -2]}>
            You made {successCount} successful hits!
        </Text>
    );
};

const Game = ({ successCount, setSuccessCount }: { successCount: number; setSuccessCount: React.Dispatch<React.SetStateAction<number>> }) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const startTimer = useCallback(() => {
        if (!isTimerRunning) {
            setSuccessCount(0);
            setTimeLeft(15);
            setIsTimerRunning(true);

            let countdown = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(countdown);
                        setIsTimerRunning(false);
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
    }, [isTimerRunning, setSuccessCount]);

    return (
        <>
            <TimerButton onClick={startTimer} position={[1, 1, -2]} />
            {isTimerRunning && <TimeDisplay timeLeft={timeLeft} />}
            {!isTimerRunning && timeLeft === 0 && <SuccessDisplay successCount={successCount} />}
        </>
    );
};

export default Game;
