import {useRouter} from "next/router";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import registerAffiliateAccount from "../../../src/program/affiliate-accounts/register-affiliate-account";
import useProject from "../../../src/hooks/useProject";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import {PopupMessageContext, PopupMessageTypes} from "../../../src/providers/popup-message-provider";
import LoadingIcon from "../../../src/components/loading-icon";
import {WalletAffiliateAccountsContext} from "../../../src/providers/wallet-affiliate-accounts-provider";
import {sleep} from "@toruslabs/base-controllers";
import Image from "next/image";
import {Box, Button, CircularProgress, Container, Grid, List, ListItem, Typography} from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {LoadingButton} from "@mui/lab";
import {SolTokenIcon} from "../../../src/program/constants";
import Link from "next/link";
import useCandyMachineAccount from "../../../src/hooks/useCandyMachineAccount";
import getDiscountedNftPrice from "../../../src/program/utils/discount-price-calculator";

export default function ProjectDetails() {
    const router = useRouter();
    const {owner, candyMachine} = router.query;
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection, showWalletsModal} = useContext(AuthContext);
    const {refreshWalletHasAffiliateAccounts} = useContext(WalletAffiliateAccountsContext);
    const {projectLoading, project, affiliateAccounts} = useProject(owner as string, candyMachine as string, true);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const candyMachineAccount = useCandyMachineAccount(candyMachine as string|null);
    const walletIsProjectAffiliate = affiliateAccounts.findIndex(affiliateAccount => {
        if (!wallet || !wallet.publicKey) {
            return false;
        }

        return affiliateAccount.data.affiliate_pubkey.toString() === wallet.publicKey.toString();
    }) !== -1;

    const registerAsAffiliate = async () => {
        try {
            await registerAffiliateAccount({
                owner: new PublicKey(owner as string),
                candyMachineId: new PublicKey(candyMachine as string)
            }, wallet, connection);

            await sleep(1000);

            refreshWalletHasAffiliateAccounts();

            setIsRegistering(false);

            router.push(`/my-earnings`);
        } catch (e: any) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }

            setIsRegistering(false);
        }
    };

    const onAffiliateRegistrationClick = () => {
        if (isRegistering) {
            return;
        }

        setIsRegistering(true);

        if (!wallet.connected) {
            showWalletsModal();

            return;
        }

        registerAsAffiliate();
    };

    useEffect(() => {
        (async () => {
            if (wallet.connected && isRegistering) {
                registerAsAffiliate();
            }
        })();
    }, [wallet.connected]);

    return (
        <Container maxWidth="xl" sx={{p: 3}} className="nft-project nft-project--single">
            {projectLoading ? <LoadingIcon/> : !project ? null :
                <Grid container display="flex" justifyContent="center" spacing={3}>
                    <Grid item xs={12} md={6} xl={4} display="flex" flexDirection="column" alignItems="center">
                        <Box className="nft-project__image-container" mb={3}>
                            {project.projectData?.image_url &&
                                <Image src={project.projectData.image_url} className="nft-project__image" alt="" layout="fill"/>
                            }
                        </Box>
                        <Box className="nft-project__social-links">
                            {project.projectData?.url &&
                                <Link href={project.projectData.url}>
                                    <a target={'_blank'}>
                                        <Typography component="span" sx={{display: 'flex', alignItems: 'center', mr: 1}}>
                                            <OpenInNewIcon fontSize="small" sx={{mr: 1}}/>
                                            Website
                                        </Typography>
                                    </a>
                                </Link>
                            }
                            {project.projectData?.twitter_url &&
                                <Link href={project.projectData.twitter_url}>
                                    <a target={'_blank'}>
                                        <Typography component="span" sx={{display: 'flex', alignItems: 'center', mr: 1}}>
                                            <OpenInNewIcon fontSize="small" sx={{mr: 1}}/>
                                            Twitter
                                        </Typography>
                                    </a>
                                </Link>
                            }
                            {project.projectData?.discord_url &&
                                <Link href={project.projectData.discord_url}>
                                    <a target={'_blank'}>
                                        <Typography component="span" sx={{display: 'flex', alignItems: 'center', mr: 1}}>
                                            <OpenInNewIcon fontSize="small" sx={{mr: 1}}/>
                                            Discord
                                        </Typography>
                                    </a>
                                </Link>
                            }
                        </Box>

                        <Box
                            component="section"
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            className="nft-project__actions"
                            sx={{width: '100%', marginTop: 3, marginBottom: 3}}
                        >
                            {project.projectAccount.data.max_affiliate_count > project.projectAccount.data.affiliate_count && !walletIsProjectAffiliate &&
                                <LoadingButton
                                    loading={isRegistering}
                                    onClick={onAffiliateRegistrationClick}
                                    variant="contained"
                                    color="success"
                                >
                                    Register as Affiliate
                                </LoadingButton>
                            }

                            <Link href={project.getMintLink()}>
                                <a>
                                    <Button
                                        variant="contained"
                                        color="success"
                                    >
                                        GET NFT
                                    </Button>
                                </a>
                            </Link>
                        </Box>

                        <Box component="section" className="nft-project__details" sx={{width: '100%'}}>
                            <Typography component="h3" variant="h3" mb={2}>
                                Details
                            </Typography>

                            <List dense disablePadding>
                                {!candyMachineAccount ?
                                    <CircularProgress size="2rem"/>
                                    :
                                    <>
                                        <ListItem disableGutters>
                                            <Box display="flex" justifyContent="space-between" sx={{width: '100%'}}>
                                                <strong>Full Mint Price:</strong>
                                                <span>
                                                    {candyMachineAccount.state.price.toNumber() / LAMPORTS_PER_SOL}{SolTokenIcon}
                                                </span>
                                            </Box>
                                        </ListItem>
                                        {candyMachineAccount.state.whitelistMintSettings && candyMachineAccount.state.whitelistMintSettings.discountPrice !== null &&
                                            <ListItem disableGutters>
                                                <Box display="flex" justifyContent="space-between" sx={{width: '100%'}}>
                                                    <strong>Discounted Mint Price:</strong>
                                                    <span>
                                                        {getDiscountedNftPrice(
                                                            candyMachineAccount.state.whitelistMintSettings.discountPrice.toNumber(),
                                                            project.projectAccount.data.affiliate_fee_percentage
                                                        ).toPrecision(3)}{SolTokenIcon}
                                                    </span>
                                                </Box>
                                            </ListItem>
                                        }
                                    </>
                                }
                                <ListItem disableGutters>
                                    <Box display="flex" justifyContent="space-between" sx={{width: '100%'}}>
                                        <strong>Affiliate Fee:</strong>
                                        <span>
                                            {project.projectAccount.data.affiliate_fee_percentage}%
                                        </span>
                                    </Box>
                                </ListItem>
                                <ListItem disableGutters>
                                    <Box display="flex" justifyContent="space-between" sx={{width: '100%'}}>
                                        <strong>Affiliate Target:</strong>
                                        <span>
                                            {project.projectAccount.data.affiliate_target_in_sol}{SolTokenIcon}
                                        </span>
                                    </Box>
                                </ListItem>
                                <ListItem disableGutters>
                                    <Box display="flex" justifyContent="space-between" sx={{width: '100%'}}>
                                        <strong>Number of Registered Affiliates:</strong>
                                        <span>
                                            {project.projectAccount.data.affiliate_count}/{project.projectAccount.data.max_affiliate_count}
                                        </span>
                                    </Box>
                                </ListItem>
                            </List>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6} xl={4}>
                        <Box component="header" className="nft-project__header" mb={3}>
                            <Typography variant="h1" className="nft-project__title" mb={2}>
                                {project.getTitle()}
                            </Typography>

                            <Typography
                                component="div"
                                className="nft-project__description"
                                dangerouslySetInnerHTML={{
                                    __html: project.projectData?.description?.replace(/\r\n|\r|\n/g, "<br>") ?? ''
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            }
        </Container>
    );
}
