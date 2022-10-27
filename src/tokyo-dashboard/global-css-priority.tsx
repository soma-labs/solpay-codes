import * as React from 'react';
import { StyledEngineProvider } from '@mui/material/styles';

export default function GlobalCssPriority(props: any) {
    return (
        <StyledEngineProvider injectFirst>
            {props.children}
        </StyledEngineProvider>
    );
}
