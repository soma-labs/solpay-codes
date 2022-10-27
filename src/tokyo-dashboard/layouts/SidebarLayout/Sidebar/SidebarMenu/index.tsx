import {
    ListSubheader, alpha, Box, List, styled, Button, ListItem, Divider, useTheme
} from '@mui/material';
import Link from 'next/link';

import AppsTwoTone from '@mui/icons-material/AppsTwoTone';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PendingActionsTwoToneIcon from '@mui/icons-material/PendingActionsTwoTone';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import {useContext} from "react";
import {AuthContext} from "../../../../../providers/auth-provider";
import {WalletProjectsContext} from "../../../../../providers/wallet-projects-provider";
import {WalletPendingProjectsContext} from "../../../../../providers/wallet-pending-projects-provider";
import {WalletAffiliateAccountsContext} from "../../../../../providers/wallet-affiliate-accounts-provider";
import {useRouter} from "next/router";

const MenuWrapper = styled(Box)(({theme}) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

    .MuiListSubheader-root {
      text-transform: uppercase;
      font-weight: bold;
      font-size: ${theme.typography.pxToRem(12)};
      color: ${theme.colors.alpha.trueWhite[50]};
      padding: ${theme.spacing(0, 2.5)};
      line-height: 1.4;
    }
`);

const SubMenuWrapper = styled(Box)(({theme}) => `
    .MuiList-root {
      a {
        width: 100%;
      }

      .MuiListItem-root {
        padding: 1px 0;

        .MuiBadge-root {
          position: absolute;
          right: ${theme.spacing(3.2)};

          .MuiBadge-standard {
            background: ${theme.colors.primary.main};
            font-size: ${theme.typography.pxToRem(10)};
            font-weight: bold;
            text-transform: uppercase;
            color: ${theme.palette.primary.contrastText};
          }
        }
    
        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            transition: ${theme.transitions.create(['color'])};

            .MuiSvgIcon-root {
              font-size: inherit;
              transition: none;
            }
          }

          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }
          
          .MuiButton-endIcon {
            color: ${theme.colors.alpha.trueWhite[50]};
            margin-left: auto;
            opacity: .8;
            font-size: ${theme.typography.pxToRem(20)};
          }

          &.active,
          &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};

            .MuiButton-startIcon,
            .MuiButton-endIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(0.8, 3)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: ${theme.colors.alpha.trueWhite[100]};
                opacity: 0;
                transition: ${theme.transitions.create(['transform', 'opacity'])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.active,
              &:hover {

                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`);

function SidebarMenu() {
    const {
        wallet,
    } = useContext(AuthContext);
    const theme = useTheme();
    const {walletProjects} = useContext(WalletProjectsContext);
    const {pendingProjects} = useContext(WalletPendingProjectsContext);
    const {walletHasAffiliateAccounts} = useContext(WalletAffiliateAccountsContext);
    const router = useRouter();

    return (
        <>
            <MenuWrapper>
                {wallet.publicKey?.toString() !== process.env.NEXT_PUBLIC_SOLPAY_ADMIN ? null :
                    <List>
                        <SubMenuWrapper>
                            <List>
                                <ListItem sx={{width: '100%'}} selected={router.asPath === `/admin`}>
                                    <Link href={`/admin`}>
                                        <a>
                                            <Button
                                                disableRipple
                                                startIcon={<SettingsApplicationsIcon/>}
                                            >
                                                Admin
                                            </Button>
                                        </a>
                                    </Link>
                                </ListItem>
                            </List>
                        </SubMenuWrapper>

                        <Divider
                            sx={{
                                mx: theme.spacing(2),
                                background: theme.colors.alpha.trueWhite[10]
                            }}
                        />
                    </List>
                }

                <List>
                    <SubMenuWrapper>
                        <List>
                            <ListItem sx={{width: '100%'}} selected={router.asPath === `/`}>
                                <Link href={`/`}>
                                    <a>
                                        <Button
                                            disableRipple
                                            startIcon={<AppsTwoTone/>}
                                        >
                                            Projects
                                        </Button>
                                    </a>
                                </Link>
                            </ListItem>

                            {walletHasAffiliateAccounts &&
                                <ListItem sx={{width: '100%'}} selected={router.asPath === `/my-earnings`}>
                                    <Link href={`/my-earnings`}>
                                        <a>
                                            <Button
                                                disableRipple
                                                startIcon={<AttachMoneyIcon/>}
                                            >
                                                My Earnings
                                            </Button>
                                        </a>
                                    </Link>
                                </ListItem>
                            }
                        </List>
                    </SubMenuWrapper>
                </List>
                {wallet.connected && (pendingProjects.length > 0) &&
                    <List
                        subheader={
                            <ListSubheader component="h4" disableSticky sx={{m: 0}}>
                                My Pending Projects
                            </ListSubheader>
                        }
                    >
                        <SubMenuWrapper>
                            <List>
                                {pendingProjects.map(
                                    (pendingProject, index) =>
                                        <ListItem key={index} sx={{width: '100%'}} selected={router.asPath === `/my-pending-projects/${pendingProject.candy_machine_id.toString()}`}>
                                            <Link href={`/my-pending-projects/${pendingProject.candy_machine_id.toString()}`}>
                                                <a>
                                                    <Button
                                                        disableRipple
                                                        startIcon={<PendingActionsTwoToneIcon/>}
                                                    >
                                                        {pendingProject.title}
                                                    </Button>
                                                </a>
                                            </Link>
                                        </ListItem>
                                )}
                            </List>
                        </SubMenuWrapper>
                    </List>
                }
                {wallet.connected && (walletProjects.length > 0) &&
                    <List
                        subheader={
                            <ListSubheader component="h4" disableSticky sx={{m: 0}}>
                                My Projects
                            </ListSubheader>
                        }
                    >
                        <SubMenuWrapper>
                            <List>
                                {walletProjects.map(
                                    (project, index) =>
                                        <ListItem key={index} sx={{width: '100%'}} selected={router.asPath === `/my-projects/${project.projectAccount.data.candy_machine_id.toString()}`}>
                                            <Link href={`/my-projects/${project.projectAccount.data.candy_machine_id.toString()}`}>
                                                <a>
                                                    <Button
                                                        disableRipple
                                                    >
                                                        {project.getTitle()}
                                                    </Button>
                                                </a>
                                            </Link>
                                        </ListItem>
                                )}
                            </List>
                        </SubMenuWrapper>
                    </List>
                }
            </MenuWrapper>
        </>
    );
}

export default SidebarMenu;
