export default function Lighting() {
    return (
        <>
            <ambientLight intensity={0.1} />
            <directionalLight
                position={[2, 6, 4]}
                intensity={1}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                castShadow
            />
        </>
    );
}
