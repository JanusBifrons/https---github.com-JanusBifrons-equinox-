import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    ThemeProvider,
    createTheme
} from '@mui/material';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00ff00',
        },
        background: {
            default: '#000000',
            paper: 'rgba(0, 0, 0, 0.9)',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: 'Press Start 2P',
                    fontSize: '12px',
                    border: '1px solid #00ff00',
                    '&:hover': {
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
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    border: '2px solid #00ff00',
                },
            },
        },
    },
});

interface OptionsMenuProps {
    open: boolean;
    onClose: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({ open, onClose }) => {
    return (
        <ThemeProvider theme={theme}>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ color: '#00ff00', textAlign: 'center' }}>
                    <Typography variant="h6" style={{ fontFamily: 'Press Start 2P' }}>
                        OPTIONS
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Typography
                            variant="body1"
                            sx={{ color: '#00ff00', mb: 2 }}
                            style={{ fontFamily: 'Press Start 2P', fontSize: '14px' }}
                        >
                            Options menu coming soon!
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{ color: 'rgba(0, 255, 0, 0.7)' }}
                            style={{ fontFamily: 'Press Start 2P', fontSize: '10px' }}
                        >
                            Future features:
                        </Typography>

                        <Box sx={{ mt: 2, textAlign: 'left' }}>
                            <Typography
                                variant="body2"
                                sx={{ color: 'rgba(0, 255, 0, 0.7)', mb: 1 }}
                                style={{ fontFamily: 'Press Start 2P', fontSize: '10px' }}
                            >
                                • Audio Settings
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: 'rgba(0, 255, 0, 0.7)', mb: 1 }}
                                style={{ fontFamily: 'Press Start 2P', fontSize: '10px' }}
                            >
                                • Graphics Quality
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: 'rgba(0, 255, 0, 0.7)', mb: 1 }}
                                style={{ fontFamily: 'Press Start 2P', fontSize: '10px' }}
                            >
                                • Control Mapping
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: 'rgba(0, 255, 0, 0.7)' }}
                                style={{ fontFamily: 'Press Start 2P', fontSize: '10px' }}
                            >
                                • Gameplay Settings
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="primary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
};

export default OptionsMenu;
