import {useContext} from 'react';

import {
    Box, Button, alpha, lighten, IconButton, Tooltip, styled, useTheme
} from '@mui/material';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import {SidebarContext} from '../../../contexts/SidebarContext';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';

import HeaderUserBox from './UserBox';
import Link from "next/link";
import Image from "next/image";

const HeaderWrapper = styled(Box)(({theme}) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: 0;
        z-index: 6;
        background-color: ${alpha(theme.header.background as string, 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            left: ${theme.sidebar.width};
            width: auto;
        }
`);

function Header() {
    const {sidebarToggle, toggleSidebar} = useContext(SidebarContext);
    const theme = useTheme();

    return (
        <HeaderWrapper
            display="flex"
            alignItems="center"
            sx={{
                boxShadow: theme.palette.mode === 'dark' ? `0 1px 0 ${alpha(lighten(theme.colors.primary.main, 0.7), 0.15)}, 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)` : `0px 2px 8px -3px ${alpha(theme.colors.alpha.black[100], 0.2)}, 0px 5px 22px -4px ${alpha(theme.colors.alpha.black[100], 0.1)}`
            }}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
            >
                <Box
                    component="span"
                    sx={{
                        display: {lg: 'none', xs: 'flex'}
                    }}
                >
                    <Link href="/">
                        <a>
                            <Image src={`/images/solpay-codes-logo-mobile.jpg`} alt="solpay.codes logo" width={50} height={50}/>
                        </a>
                    </Link>
                </Box>
                <Box sx={{marginLeft: 'auto'}} display="flex" alignItems="center">
                    <Box
                        component="span"
                        sx={{
                            display: {lg: 'inline-block', xs: 'none'}
                        }}
                    >
                        <Link href="/projects/new">
                            <a>
                                <Button variant="contained" size="small" sx={{marginRight: 1}}>Register Project</Button>
                            </a>
                        </Link>
                    </Box>

                    <HeaderUserBox/>

                    <Box
                        component="span"
                        sx={{
                            display: {lg: 'none', xs: 'flex'}
                        }}
                    >
                        <Tooltip arrow title="Toggle Menu">
                            <IconButton color="primary" onClick={toggleSidebar} sx={{ml: 1}}>
                                {!sidebarToggle ? (<MenuTwoToneIcon fontSize="large"/>) : (<CloseTwoToneIcon fontSize="large"/>)}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
        </HeaderWrapper>
    );
}

export default Header;
