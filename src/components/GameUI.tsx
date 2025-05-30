import React, { useState, useEffect } from 'react';
import {
    Menu,
    MenuItem,
    IconButton,
    Box,
    Typography,
    Paper
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Player } from '../game/Player';

interface GameUIProps {
    player: Player | null;
    onReturnToMenu: () => void;
    onShowOptions: () => void;
}

interface HexagonStatsProps {
    label: string;
    current: number;
    max: number;
    color: string;
}

const HexagonStats: React.FC<HexagonStatsProps> = ({ label, current, max, color }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
            <Box sx={{ position: 'relative' }}>
                {/* Hexagon Background */}
                <svg width="60" height="52" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
                    <polygon
                        points="30,2 52,15 52,37 30,50 8,37 8,15"
                        fill="rgba(0,0,0,0.7)"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="1"
                    />
                    {/* Progress hexagon */}
                    <polygon
                        points="30,2 52,15 52,37 30,50 8,37 8,15"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray={`${percentage * 1.8} 180`}
                        strokeDashoffset="0"
                        transform="rotate(-90 30 26)"
                        style={{ transition: 'all 0.3s ease' }}
                    />
                </svg>

                {/* Center value */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontFamily: 'Press Start 2P',
                            fontSize: '8px'
                        }}
                    >
                        {current}
                    </Typography>
                </Box>
            </Box>

            {/* Label */}
            <Typography
                variant="caption"
                sx={{
                    color: 'white',
                    mt: 1,
                    fontFamily: 'Press Start 2P',
                    fontSize: '8px'
                }}
            >
                {label}
            </Typography>
        </Box>
    );
};

const GameUI: React.FC<GameUIProps> = ({ player, onReturnToMenu, onShowOptions }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [, forceUpdate] = useState(0);
    const open = Boolean(anchorEl);

    // Force re-render every frame to show real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate(prev => prev + 1);
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleReturnToMenu = () => {
        onReturnToMenu();
        handleMenuClose();
    };

    const handleShowOptions = () => {
        onShowOptions();
        handleMenuClose();
    };

    return (
        <>
            {/* Top Corner Dropdown Menu */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 16,
                    left: 16,
                    zIndex: 1000,
                }}
            >
                <IconButton
                    onClick={handleMenuClick}
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#00ff00',
                        border: '1px solid rgba(0, 255, 0, 0.3)',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 255, 0, 0.1)',
                            borderColor: '#00ff00',
                        },
                    }}
                >
                    <MoreVertIcon />
                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    PaperProps={{
                        sx: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            border: '1px solid #00ff00',
                            '& .MuiMenuItem-root': {
                                color: '#00ff00',
                                fontFamily: 'Press Start 2P',
                                fontSize: '12px',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                                },
                            },
                        },
                    }}
                >
                    <MenuItem onClick={handleShowOptions}>Options</MenuItem>
                    <MenuItem onClick={handleReturnToMenu}>Main Menu</MenuItem>
                </Menu>
            </Box>

            {/* Bottom Status Bar */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '120px',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderTop: '2px solid rgba(0, 255, 0, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
            >                {player && !player.isDestroyed && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HexagonStats
                        label="SHIELD"
                        current={player.stats.shield.current}
                        max={player.stats.shield.max}
                        color="#00aaff"
                    />
                    <HexagonStats
                        label="ARMOR"
                        current={player.stats.armor.current}
                        max={player.stats.armor.max}
                        color="#ffaa00"
                    />
                    <HexagonStats
                        label="HULL"
                        current={player.stats.hull.current}
                        max={player.stats.hull.max}
                        color="#ff4444"
                    />
                    <HexagonStats
                        label="POWER"
                        current={Math.round(player.stats.power.current)}
                        max={player.stats.power.max}
                        color="#00ff88"
                    />
                    {/* Afterburner status indicator */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: player.isAfterburnerActive() ? '#ff8800' : 'rgba(255, 136, 0, 0.3)',
                                backgroundColor: player.isAfterburnerActive() ? 'rgba(255, 136, 0, 0.3)' : 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: player.isAfterburnerActive() ? '0 0 10px rgba(255, 136, 0, 0.5)' : 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: player.isAfterburnerActive() ? '#ff8800' : 'rgba(255, 136, 0, 0.5)',
                                    fontFamily: 'Press Start 2P',
                                    fontSize: '6px',
                                    fontWeight: 'bold'
                                }}
                            >
                                AB
                            </Typography>
                        </Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'white',
                                mt: 1,
                                fontFamily: 'Press Start 2P',
                                fontSize: '8px'
                            }}
                        >
                            BURN
                        </Typography>
                    </Box>
                    {/* Added speed display */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'white',
                                fontFamily: 'Press Start 2P',
                                fontSize: '8px'
                            }}
                        >
                            SPEED
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'white',
                                fontFamily: 'Press Start 2P',
                                fontSize: '16px'
                            }}
                        >
                            {player.getSpeed().toFixed(2)}
                        </Typography>
                    </Box>
                    {/* Added acceleration display */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'white',
                                fontFamily: 'Press Start 2P',
                                fontSize: '8px'
                            }}
                        >
                            ACCEL
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'white',
                                fontFamily: 'Press Start 2P',
                                fontSize: '16px'
                            }}
                        >
                            {player.getAcceleration().toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            )}

                {player && player.isDestroyed && (
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#ff4444',
                            fontFamily: 'Press Start 2P',
                            fontSize: '16px'
                        }}
                    >
                        SHIP DESTROYED
                    </Typography>
                )}

                {!player && (
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#888888',
                            fontFamily: 'Press Start 2P',
                            fontSize: '12px'
                        }}
                    >
                        NO SHIP DATA
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default GameUI;
