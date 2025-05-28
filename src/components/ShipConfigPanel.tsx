import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ThemeProvider,
    createTheme,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ShipColor } from '../game/ShipParts';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00ffff',
        },
        background: {
            default: '#000000',
            paper: 'rgba(0, 0, 0, 0.8)',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: 'Press Start 2P',
                    borderWidth: 2,
                    '&:hover': {
                        borderWidth: 2,
                        backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    },
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: 'Press Start 2P',
                },
            },
        },
    },
});

export interface ShipConfig {
    type: 'compact' | 'assault' | 'capital' | 'razorInterceptor' | 'strikeInterceptor' | 'phantomInterceptor';
    color: ShipColor;
    enabledParts?: {
        [key: string]: boolean;
    };
}

interface ShipConfigPanelProps {
    onConfigChange: (config: ShipConfig) => void;
    currentConfig: ShipConfig;
}

// Define which parts each ship type uses for debugging
const shipPartMappings: Record<ShipConfig['type'], { name: string; key: string }[]> = {
    compact: [
        { name: 'Compact Ship Hull', key: 'compactShip' },
        { name: 'Standard Wings', key: 'standardWings' },
        { name: 'Vector Thrusters', key: 'vectorThrusters' }
    ],
    assault: [
        { name: 'Assault Ship Hull', key: 'assaultShip' },
        { name: 'Assault Wings', key: 'assaultWings' },
        { name: 'Dual Engine', key: 'dualEngine' }
    ],
    capital: [
        { name: 'Capital Ship Hull', key: 'capitalShip' },
        { name: 'Quad Engine', key: 'quadEngine' },
        { name: 'Side Cannons', key: 'sideCannons' }
    ],
    razorInterceptor: [
        { name: 'Razor Interceptor Hull', key: 'razorInterceptor' },
        { name: 'Interceptor Wings', key: 'interceptorWings' },
        { name: 'Interceptor Engine', key: 'interceptorEngine' }
    ],
    strikeInterceptor: [
        { name: 'Strike Interceptor Hull', key: 'strikeInterceptor' },
        { name: 'Interceptor Wings', key: 'interceptorWings' },
        { name: 'Interceptor Engine', key: 'interceptorEngine' }
    ],
    phantomInterceptor: [
        { name: 'Phantom Interceptor Hull', key: 'phantomInterceptor' },
        { name: 'Interceptor Wings', key: 'interceptorWings' },
        { name: 'Interceptor Engine', key: 'interceptorEngine' }
    ]
};

const ShipConfigPanel: React.FC<ShipConfigPanelProps> = ({ onConfigChange, currentConfig }) => {
    // Initialize enabled parts if not present
    const getEnabledParts = (): { [key: string]: boolean } => {
        if (currentConfig.enabledParts) {
            return currentConfig.enabledParts;
        }

        // Default all parts to enabled
        const defaultParts: { [key: string]: boolean } = {};
        shipPartMappings[currentConfig.type].forEach(part => {
            defaultParts[part.key] = true;
        });
        return defaultParts;
    };

    const handlePartToggle = (partKey: string, enabled: boolean) => {
        const newEnabledParts = {
            ...getEnabledParts(),
            [partKey]: enabled
        };

        onConfigChange({
            ...currentConfig,
            enabledParts: newEnabledParts
        });
    };

    const enabledParts = getEnabledParts();
    const currentShipParts = shipPartMappings[currentConfig.type];
    return (
        <ThemeProvider theme={theme}>            <Paper
            sx={{
                position: 'fixed',
                top: 20,
                right: 20,
                p: 3,
                width: 320,
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '2px solid cyan',
                zIndex: 1000,
            }}
        >
            <Typography variant="h6" sx={{ mb: 3, color: 'cyan' }}>
                Ship Configuration
            </Typography>

            <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: 'cyan' }}>Ship Type</InputLabel>
                    <Select
                        value={currentConfig.type}
                        label="Ship Type"
                        onChange={(e) => onConfigChange({
                            ...currentConfig,
                            type: e.target.value as ShipConfig['type']
                        })}
                        sx={{ color: 'cyan', borderColor: 'cyan' }}
                    >
                        <MenuItem value="compact">Compact Fighter</MenuItem>
                        <MenuItem value="assault">Assault Cruiser</MenuItem>
                        <MenuItem value="capital">Capital Ship</MenuItem>
                        <MenuItem value="razorInterceptor">Razor Interceptor</MenuItem>
                        <MenuItem value="strikeInterceptor">Strike Interceptor</MenuItem>
                        <MenuItem value="phantomInterceptor">Phantom Interceptor</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel sx={{ color: 'cyan' }}>Color Scheme</InputLabel>
                    <Select
                        value={currentConfig.color}
                        label="Color Scheme"
                        onChange={(e) => onConfigChange({
                            ...currentConfig,
                            color: e.target.value as ShipColor
                        })}
                        sx={{ color: 'cyan', borderColor: 'cyan' }}
                    >
                        <MenuItem value="red">Red Squadron</MenuItem>
                        <MenuItem value="blue">Blue Squadron</MenuItem>
                        <MenuItem value="green">Green Squadron</MenuItem>
                        <MenuItem value="orange">Orange Squadron</MenuItem>
                    </Select>                    </FormControl>
            </Box>

            {/* Ship Parts Debug Section */}
            <Accordion sx={{ backgroundColor: 'rgba(0, 40, 40, 0.8)', border: '1px solid cyan', mb: 2 }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'cyan' }} />}
                    sx={{
                        '& .MuiAccordionSummary-content': {
                            color: 'cyan',
                            fontFamily: 'Press Start 2P',
                            fontSize: '0.8rem'
                        }
                    }}
                >
                    <Typography variant="body2">Ship Parts Debug</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography variant="caption" sx={{ color: 'cyan', mb: 2, display: 'block', fontSize: '0.7rem' }}>
                        Toggle individual ship parts for debugging:
                    </Typography>
                    <FormGroup>
                        {currentShipParts.map((part) => (
                            <FormControlLabel
                                key={part.key}
                                control={
                                    <Checkbox
                                        checked={enabledParts[part.key] !== false}
                                        onChange={(e) => handlePartToggle(part.key, e.target.checked)}
                                        sx={{
                                            color: 'cyan',
                                            '&.Mui-checked': {
                                                color: 'cyan',
                                            },
                                            '& .MuiSvgIcon-root': {
                                                fontSize: '1.2rem',
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: enabledParts[part.key] !== false ? 'cyan' : '#666',
                                            fontFamily: 'Press Start 2P',
                                            fontSize: '0.6rem'
                                        }}
                                    >
                                        {part.name}
                                    </Typography>
                                }
                            />
                        ))}
                    </FormGroup>

                    <Divider sx={{ my: 2, borderColor: 'cyan' }} />

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                                const allEnabled: { [key: string]: boolean } = {};
                                currentShipParts.forEach(part => {
                                    allEnabled[part.key] = true;
                                });
                                onConfigChange({
                                    ...currentConfig,
                                    enabledParts: allEnabled
                                });
                            }}
                            sx={{
                                borderColor: 'cyan',
                                color: 'cyan',
                                fontSize: '0.5rem',
                                minWidth: 'auto',
                                px: 1
                            }}
                        >
                            All
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                                const allDisabled: { [key: string]: boolean } = {};
                                currentShipParts.forEach(part => {
                                    allDisabled[part.key] = false;
                                });
                                onConfigChange({
                                    ...currentConfig,
                                    enabledParts: allDisabled
                                });
                            }}
                            sx={{
                                borderColor: 'cyan',
                                color: 'cyan',
                                fontSize: '0.5rem',
                                minWidth: 'auto',
                                px: 1
                            }}
                        >
                            None
                        </Button>
                    </Box>
                </AccordionDetails>
            </Accordion>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                    variant="outlined"
                    onClick={() => onConfigChange(currentConfig)}
                    sx={{ borderColor: 'cyan', color: 'cyan' }}
                >
                    Apply
                </Button>
            </Box>
        </Paper>
        </ThemeProvider>
    );
};

export default ShipConfigPanel;
