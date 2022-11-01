import {useContext, useRef, useState} from 'react';
import {
    Avatar, Box, Button, Divider, Hidden, Popover, Typography
} from '@mui/material';

import {styled} from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import PersonTwoToneIcon from '@mui/icons-material/PersonTwoTone';
import {AuthContext} from "../../../../../providers/auth-provider";
import generateBoringAvatar from "../../../../../utils/boring-avatar-generator";

const UserBoxButton = styled(Button)(({theme}) => `
    padding-left: ${theme.spacing(1)};
    padding-right: ${theme.spacing(1)};
`);

const MenuUserBox = styled(Box)(({theme}) => `
    background: ${theme.colors.alpha.black[5]};
    padding: ${theme.spacing(2)};
`);

const UserBoxText = styled(Box)(({theme}) => `
    text-align: left;
    padding-left: ${theme.spacing(1)};
`);

const UserBoxLabel = styled(Typography)(({theme}) => `
    font-weight: ${theme.typography.fontWeightBold};
    color: ${theme.palette.secondary.main};
    display: block;
`);

const shortenUsername = (username: string): string => {
    if (username.length > 9) {
        return `${username.substring(0, 4)}...${username.substring(username.length - 4)}`;
    }

    return username;
};

function HeaderUserBox() {
    const {
        wallet,
        showWalletsModal,
        logout
    } = useContext(AuthContext);

    const ref = useRef<any>(null);
    const [isOpen, setOpen] = useState<boolean>(false);

    const handleOpen = (): void => {
        setOpen(true);
    };

    const handleClose = (): void => {
        setOpen(false);
    };

    return (
        <>
            {!wallet.connected || !wallet.publicKey ?
                <>
                    <Button
                        ref={ref}
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<PersonTwoToneIcon />}
                        onClick={showWalletsModal}
                    >
                        Connect Wallet
                    </Button>
                </>
                :
                <>
                    <UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
                        <Avatar variant="rounded" alt={wallet.publicKey.toString()} src={generateBoringAvatar(wallet.publicKey.toString())}/>

                        <Hidden mdDown>
                            <UserBoxText>
                                <UserBoxLabel variant="body1">
                                    {shortenUsername(wallet.publicKey.toString())}
                                </UserBoxLabel>
                            </UserBoxText>
                        </Hidden>

                        <Hidden smDown>
                            <ExpandMoreTwoToneIcon sx={{ml: 1}}/>
                        </Hidden>
                    </UserBoxButton>

                    <Popover
                        anchorEl={ref.current}
                        onClose={handleClose}
                        open={isOpen}
                        anchorOrigin={{
                            vertical: 'top', horizontal: 'right'
                        }}
                        transformOrigin={{
                            vertical: 'top', horizontal: 'right'
                        }}
                    >
                        <MenuUserBox sx={{minWidth: 210, display: 'flex', alignItems: 'center'}}>
                            <Avatar variant="rounded" alt={wallet.publicKey.toString()} src={generateBoringAvatar((wallet.publicKey.toString()))}/>
                            <UserBoxText>
                                <UserBoxLabel variant="body1">
                                    <span className="pubkey">{wallet.publicKey.toString()}</span>
                                </UserBoxLabel>
                            </UserBoxText>
                        </MenuUserBox>

                        <Divider/>

                        <Box sx={{m: 1}}>
                            <Button color="primary" fullWidth onClick={() => {
                                handleClose();
                                logout();
                            }}>
                                <LockOpenTwoToneIcon sx={{mr: 1}}/>
                                Sign out
                            </Button>
                        </Box>
                    </Popover>
                </>
            }
        </>
    );
}

export default HeaderUserBox;
