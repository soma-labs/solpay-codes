import {useContext} from 'react';
import Scrollbar from '../../../components/Scrollbar';
import {SidebarContext} from '../../../contexts/SidebarContext';

import {
    Box, Drawer, alpha, styled, Divider, useTheme, lighten, darken, Button
} from '@mui/material';

import SidebarMenu from './SidebarMenu';
import Image from "next/image";
import Link from "next/link";

const SidebarWrapper = styled(Box)(({theme}) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
`);

function Sidebar() {
    const {sidebarToggle, toggleSidebar} = useContext(SidebarContext);
    const closeSidebar = () => toggleSidebar();
    const theme = useTheme();

    return (
        <>
            <SidebarWrapper
                sx={{
                    display: {
                        xs: 'none',
                        lg: 'inline-block'
                    },
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    background:
                        theme.palette.mode === 'dark'
                            ? alpha(lighten(theme.header.background as string, 0.1), 0.5)
                            : darken(theme.colors.alpha.black[100], 0.5),
                    boxShadow:
                        theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
                }}
            >
                <Box mt={3} sx={{textAlign: 'center'}}>
                    <Link href="/">
                        <a>
                            <Image src={`/images/solpay-codes-logo.jpg`} alt="solpay.codes logo" width={183.6} height={183.6}/>
                        </a>
                    </Link>
                </Box>
                <Divider
                    sx={{
                        mt: theme.spacing(3),
                        mx: theme.spacing(2),
                        background: theme.colors.alpha.trueWhite[10]
                    }}
                />
                <SidebarMenu />
            </SidebarWrapper>
            <Drawer
                sx={{
                    boxShadow: `${theme.sidebar.boxShadow}`
                }}
                anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                open={sidebarToggle}
                onClose={closeSidebar}
                variant="temporary"
                elevation={9}
            >
                <SidebarWrapper
                    sx={{
                        background: theme.palette.mode === 'dark' ? theme.colors.alpha.white[100] : darken(theme.colors.alpha.black[100], 0.5)
                    }}
                >
                    <Scrollbar>
                        <SidebarMenu/>
                    </Scrollbar>
                </SidebarWrapper>
            </Drawer>
        </>
    );
}

export default Sidebar;
