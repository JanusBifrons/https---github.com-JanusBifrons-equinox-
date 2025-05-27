import React from 'react';
import {
    Button,
    Container,
    Paper,
    Typography,
    Box,
    ThemeProvider,
    createTheme
} from '@mui/material';
import { GameMode } from '../game/Engine';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00ff00',
        },
        background: {
            default: '#000000',
            paper: 'transparent',
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
                        backgroundColor: 'rgba(0, 255, 0, 0.1)',
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

interface WelcomeScreenProps {
    onStartGame: (mode: GameMode) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartGame }) => {
    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle, rgba(0,0,0,0.9) 0%, rgba(0,0,0,1) 100%)',
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={0}
                        sx={{
                            bgcolor: 'transparent',
                            p: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Typography
                            variant="h2"
                            component="h1"
                            className="animate-glow"
                            sx={{
                                mb: 6,
                                color: 'primary.main',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em'
                            }}
                        >
                            Equinox
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            '& .MuiButton-root': {
                                py: 2,
                                fontSize: '1.2rem',
                                letterSpacing: '0.1em'
                            }
                        }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => onStartGame('classic')}
                            >
                                Classic Mode
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => onStartGame('survival')}
                            >
                                Survival Mode
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => onStartGame('practice')}
                            >
                                Practice Mode
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default WelcomeScreen;
