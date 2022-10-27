import {useRouter} from "next/router";
import {PublicKey} from "@solana/web3.js";
import registerAffiliateAccount from "../../../src/program/affiliate-accounts/register-affiliate-account";
import useProject from "../../../src/hooks/useProject";
import {useContext, useState} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import {PopupMessageContext, PopupMessageTypes} from "../../../src/providers/popup-message-provider";
import LoadingIcon from "../../../src/components/loading-icon";
import {WalletAffiliateAccountsContext} from "../../../src/providers/wallet-affiliate-accounts-provider";
import {sleep} from "@toruslabs/base-controllers";
import Image from "next/image";
import {Box, Container, Grid, List, ListItem, Typography} from "@mui/material";
import {LoadingButton} from "@mui/lab";

export default function ProjectDetails() {
    const router = useRouter();
    const {owner, candyMachine} = router.query;
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const {refreshWalletHasAffiliateAccounts} = useContext(WalletAffiliateAccountsContext);
    const {projectLoading, project} = useProject(owner as string, candyMachine as string, true);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);

    const onAffiliateRegistrationFormSubmit = async (e: any) => {
        e.preventDefault();

        if (isRegistering) {
            return;
        }

        setIsRegistering(true);

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

    return (
        <Container maxWidth="xl" sx={{p: 3}} className="nft-project nft-project--single">
            {projectLoading ? <LoadingIcon/> : !project ? null :
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <Box className="nft-project__image-container">
                            {project.projectData?.image_url &&
                                <Image src={project.projectData.image_url} className="nft-project__image" alt="" layout="fill"/>
                            }
                        </Box>
                    </Grid>

                    <Grid item xs>
                        <Box component="header" className="nft-project__header" mb={3}>
                            <Typography variant="h1" className="nft-project__title" mb={2}>
                                {project.getTitle()}
                            </Typography>

                            <Typography component="p" className="nft-project__description">
                                {project.projectData?.description}
                            </Typography>
                        </Box>

                        <Box component="section" className="nft-project__details">
                            <Typography component="h3" variant="h3" className="nft-project__title" mb={2}>
                                Details
                            </Typography>

                            <List dense disablePadding className="bullet-list">
                                <ListItem disableGutters>
                                    <strong>Created at:</strong>&nbsp;{project.projectAccount.createdAt()}
                                </ListItem>
                                <ListItem disableGutters>
                                    <strong>Updated at:</strong>&nbsp;{project.projectAccount.updatedAt()}
                                </ListItem>
                                <ListItem disableGutters>
                                    <strong>Affiliate fee:</strong>&nbsp;{project.projectAccount.data.affiliate_fee_percentage}%
                                </ListItem>
                                <ListItem disableGutters>
                                    <strong>Affiliate target:</strong>&nbsp;{project.projectAccount.data.affiliate_target_in_sol}◎
                                </ListItem>
                                <ListItem disableGutters>
                                    <strong>Max affiliate count:</strong>&nbsp;{project.projectAccount.data.max_affiliate_count}
                                </ListItem>
                                <ListItem disableGutters>
                                    <strong>Affiliate count:</strong>&nbsp;{project.projectAccount.data.affiliate_count}
                                </ListItem>
                            </List>
                        </Box>

                        {wallet.connected &&
                            <Box component="form" className="affiliate-registration-form" onSubmit={onAffiliateRegistrationFormSubmit} mt={2}>
                                <input type="hidden" name="owner" value={owner}/>
                                <input type="hidden" name="candy_machine_id" value={candyMachine}/>
                                <LoadingButton
                                    loading={isRegistering}
                                    onClick={onAffiliateRegistrationFormSubmit}
                                    variant="contained"
                                    color="success"
                                >
                                    Become an Affiliate
                                </LoadingButton>
                            </Box>
                        }
                    </Grid>
                </Grid>
            }
        </Container>
    );
}
