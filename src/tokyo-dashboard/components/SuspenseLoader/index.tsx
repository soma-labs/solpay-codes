import {useEffect} from 'react';
import {Box, CircularProgress} from '@mui/material';
const NProgress = require('nprogress');

function SuspenseLoader() {
    useEffect(() => {
        NProgress.start();

        return () => {
            NProgress.done();
        };
    }, []);

    return (
        <Box
            sx={{
                position: 'fixed', left: 0, top: 0, width: '100%', height: '100%'
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
        >
            <CircularProgress size={64} disableShrink thickness={3}/>
        </Box>
    );
}

export default SuspenseLoader;
