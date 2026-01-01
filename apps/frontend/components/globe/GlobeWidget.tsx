import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Escrow {
  id: string;
  amount: number;
  status: 'pending' | 'locked' | 'released' | 'disputed';
  buyerLocation: { lat: number; lng: number };
  sellerLocation: { lat: number; lng: number };
  createdAt: Date;
  aiControlled: boolean;
  blockchainHash?: string;
  buyerName: string;
  sellerName: string;
}

interface GlobeWidgetProps {
  escrows?: Escrow[];
  userRole?: string;
}

// Convert lat/lng to 3D coordinates on a sphere
const latLngToVector3 = (lat: number, lng: number, radius: number = 1) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

// Marker component for escrow locations
const EscrowMarker: React.FC<{
  position: THREE.Vector3;
  color: string;
  amount: number;
}> = ({ position, color, amount }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
      />
      {/* Pulse effect */}
      <mesh position={position}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>
    </mesh>
  );
};

// Connection line between buyer and seller
const ConnectionLine: React.FC<{
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}> = ({ start, end, color }) => {
  const points = useMemo(() => {
    // Create a curved arc between two points
    const midPoint = new THREE.Vector3()
      .addVectors(start, end)
      .normalize()
      .multiplyScalar(1.5);
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    return curve.getPoints(50);
  }, [start, end]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.6}
      />
    </line>
  );
};

// Main Globe component
const Globe: React.FC<{ escrows: Escrow[] }> = ({ escrows }) => {
  const statusColors = {
    pending: '#F59E0B', // amber
    locked: '#3B82F6', // blue
    released: '#10B981', // green
    disputed: '#EF4444', // red
  };

  return (
    <>
      {/* Globe sphere */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#1C2A39"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Inner glow */}
      <Sphere args={[0.98, 32, 32]}>
        <meshStandardMaterial
          color="#D4AF37"
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Escrow connections and markers */}
      {escrows.map((escrow) => {
        if (!escrow.buyerLocation?.lat || !escrow.sellerLocation?.lat) {
          return null;
        }

        const buyerPos = latLngToVector3(escrow.buyerLocation.lat, escrow.buyerLocation.lng);
        const sellerPos = latLngToVector3(escrow.sellerLocation.lat, escrow.sellerLocation.lng);
        const color = statusColors[escrow.status] || '#FFFFFF';

        return (
          <group key={escrow.id}>
            <ConnectionLine start={buyerPos} end={sellerPos} color={color} />
            <EscrowMarker
              position={buyerPos}
              color={color}
              amount={escrow.amount}
            />
            <EscrowMarker
              position={sellerPos}
              color={color}
              amount={escrow.amount}
            />
          </group>
        );
      })}

      {/* Ambient lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  );
};

const GlobeWidget: React.FC<GlobeWidgetProps> = ({ escrows = [], userRole }) => {
  // Filter escrows based on user role if needed
  const visibleEscrows = useMemo(() => {
    if (!userRole || userRole === 'admin' || userRole === 'staff') {
      return escrows;
    }
    // For regular users, show only their escrows
    return escrows.filter((escrow) => {
      // You can add filtering logic here based on userRole
      return true;
    });
  }, [escrows, userRole]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Globe escrows={visibleEscrows} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          minDistance={2}
          maxDistance={5}
        />
      </Canvas>
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white text-xs">
        <div className="font-semibold mb-2">Escrow Status</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Released</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Disputed</span>
          </div>
        </div>
        {visibleEscrows.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20">
            <div className="text-gray-300">
              {visibleEscrows.length} active escrow{visibleEscrows.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobeWidget;

