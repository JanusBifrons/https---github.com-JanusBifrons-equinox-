import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
} from '@mui/material';
import { Engine } from '../game/Engine';

interface ShipStatsProps {
    engine: Engine | null;
}

const ShipStats: React.FC<ShipStatsProps> = ({ engine }) => {
    const [stats, setStats] = useState<{
        type: string;
        color: string;
        speed: number;
        angle: number;
        zoom: number;
        acceleration: number;
        position: { x: number; y: number };
    }>({
        type: 'N/A',
        color: 'N/A',
        speed: 0,
        angle: 0,
        zoom: 1,
        acceleration: 0,
        position: { x: 0, y: 0 }
    });

    useEffect(() => {
        if (!engine) return; const updateStats = () => {
            const player = engine.getPlayer();
            if (player) {
                const velocity = player.body.velocity;
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                const angle = (player.body.angle * 180 / Math.PI);
                const accelerationValue = player.getAcceleration();

                // Access engine properties through reflection since they're private
                const engineAny = engine as any;
                const shipConfig = engineAny.shipConfig || { type: 'compact', color: 'blue' };
                const zoomLevel = engineAny.zoomLevel || 1.0;

                setStats({
                    type: shipConfig.type,
                    color: shipConfig.color,
                    speed: speed,
                    angle: angle,
                    zoom: zoomLevel,
                    acceleration: accelerationValue,
                    position: {
                        x: player.body.position.x,
                        y: player.body.position.y
                    }
                });
            }
        };

        const interval = setInterval(updateStats, 100); // Update every 100ms

        return () => clearInterval(interval);
    }, [engine]);

    if (!engine) return null;

    return (
        <Paper
            sx={{
                position: 'fixed',
                top: 20,
                left: 20,
                width: 200,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                border: '2px solid rgba(0, 255, 255, 0.8)',
                borderRadius: '8px',
                p: 2,
                backdropFilter: 'blur(4px)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
                zIndex: 999,
                '&:hover': {
                    borderColor: 'rgba(0, 255, 255, 1)',
                    boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.15)',
                },
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    fontFamily: 'Press Start 2P',
                    fontSize: '10px',
                    color: '#00ffff',
                    textAlign: 'center',
                    mb: 2,
                    textShadow: '0 0 4px rgba(0, 255, 255, 0.5)',
                }}
            >
                SHIP STATS
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <StatRow label="Type" value={stats.type} />
                <StatRow label="Color" value={stats.color} />
                <StatRow label="Speed" value={stats.speed.toFixed(2)} />
                <StatRow label="Angle" value={`${stats.angle.toFixed(1)}°`} />
                <StatRow label="Zoom" value={`${stats.zoom.toFixed(1)}x`} />
                <StatRow label="Accel" value={stats.acceleration.toFixed(1)} />
                <StatRow label="Pos X" value={stats.position.x.toFixed(0)} />
                <StatRow label="Pos Y" value={stats.position.y.toFixed(0)} />
            </Box>
        </Paper>
    );
};

interface StatRowProps {
    label: string;
    value: string;
}

const StatRow: React.FC<StatRowProps> = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
            variant="caption"
            sx={{
                fontFamily: 'Press Start 2P',
                fontSize: '6px',
                color: '#00ffff',
                textShadow: '0 0 2px rgba(0, 255, 255, 0.8)',
            }}
        >
            {label}:
        </Typography>
        <Typography
            variant="caption"
            sx={{
                fontFamily: 'Press Start 2P',
                fontSize: '6px',
                color: '#ffffff',
                textShadow: '0 0 2px rgba(255, 255, 255, 0.8)',
            }}
        >
            {value}
        </Typography>
    </Box>
);

export default ShipStats;
