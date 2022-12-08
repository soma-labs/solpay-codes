import {useContext, useEffect, useRef, useState} from "react";
import {AuthContext} from "../../src/providers/auth-provider";
import {useRouter} from "next/router";
import {PublicKey} from "@solana/web3.js";
import registerProjectAccount from "../../src/program/project-accounts/register-project-account";
import ProjectData from "../../src/models/project/project-data";
import {PopupMessageContext, PopupMessageTypes} from "../../src/providers/popup-message-provider";
import {WalletPendingProjectsContext} from "../../src/providers/wallet-pending-projects-provider";
import {WalletProjectsContext} from "../../src/providers/wallet-projects-provider";
import {sleep} from "@toruslabs/base-controllers";
import Image from "next/image";
import {Box, Container, FormControl, Grid, InputAdornment, TextField, Typography} from "@mui/material";
import AuthenticatedPage from "../../src/components/authenticated-page";
import {Stack} from "@mui/system";
import {LoadingButton} from "@mui/lab";

export default function MyPendingProject() {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const {candyMachine} = router.query;
    const [pendingProject, setPendingProject] = useState<ProjectData|null>(null);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const {refreshWalletProjects} = useContext(WalletProjectsContext);
    const {pendingProjects, refreshPendingProjects} = useContext(WalletPendingProjectsContext);

    const onProjectRegistrationFormSubmit = async () => {
        if (isRegistering) {
            return;
        }

        setIsRegistering(true);

        try {
            const formData = new FormData(formRef.current as HTMLFormElement);

            await registerProjectAccount({
                candyMachineId: new PublicKey(formData.get('candy_machine_id') as string),
                affiliateFeePercentage: parseFloat(formData.get('affiliate_fee_percentage') as string),
                affiliateTargetInSol: parseFloat(formData.get('affiliate_target_in_sol') as string),
                maxAffiliateCount: parseInt(formData.get('max_affiliate_count') as string),
                title: formData.get('title') as string,
            }, wallet, connection);

            await sleep(1000);

            refreshWalletProjects();
            refreshPendingProjects();

            setIsRegistering(false);

            router.push(`/`);
        } catch (e) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }

            setIsRegistering(false);
        }
    };

    useEffect(() => {
        (async () => {
            if (!wallet.publicKey || !candyMachine) {
                return;
            }

            setPendingProject(
                pendingProjects.find(
                    pendingProject => pendingProject.candy_machine_id.equals(new PublicKey(candyMachine))
                ) as ProjectData
            );
        })();
    }, [wallet.connected, candyMachine, pendingProjects]);

    return (
        <AuthenticatedPage>
            {!pendingProject ? null :
                <Container maxWidth="xl" sx={{p: 3}} className="nft-project nft-project--single">
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <Box className="nft-project__image-container">
                                {pendingProject.image_url &&
                                    <Image src={pendingProject.image_url} className="nft-project__image" alt="" layout="fill"/>
                                }
                            </Box>
                        </Grid>

                        <Grid item xs>
                            <Box component="header" className="nft-project__header" mb={3}>
                                <Typography variant="h1" className="nft-project__title" mb={2}>
                                    {pendingProject.title}
                                </Typography>

                                <Typography
                                    component="div"
                                    className="nft-project__description"
                                    dangerouslySetInnerHTML={{
                                        __html: pendingProject.description?.replace(/\r\n|\r|\n/g, "<br>") ?? ''
                                    }}
                                />
                            </Box>

                            <Container maxWidth="sm" sx={{m: 0}}>
                                <Stack spacing={2} component="form" ref={formRef} onSubmit={onProjectRegistrationFormSubmit}>
                                    <input type="hidden" name="candy_machine_id" value={pendingProject.candy_machine_id.toString()}/>
                                    <FormControl>
                                        <TextField
                                            name="affiliate_fee_percentage"
                                            label={`Affiliate fee percentage`}
                                            inputProps={{ inputMode: 'numeric', pattern: '^[1-9][0-9]?$|^100$' }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>
                                            }}
                                            required
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <TextField
                                            name="affiliate_target_in_sol"
                                            label={`Affiliate target in SOL`}
                                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">◎</InputAdornment>
                                            }}
                                            required
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <TextField
                                            name="max_affiliate_count"
                                            label={`Max affiliate count`}
                                            inputProps={{ inputMode: 'numeric', pattern: '\\b(1?0|[1-9][0-9]{0,1}|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\\b' }}
                                            defaultValue={255}
                                            required
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <TextField
                                            name="title"
                                            label={`Title`}
                                            defaultValue={pendingProject.title}
                                            required
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <LoadingButton
                                            loading={isRegistering}
                                            variant="contained"
                                            onClick={() => {
                                                if (formRef.current) {
                                                    if (formRef.current.reportValidity()) {
                                                        onProjectRegistrationFormSubmit();
                                                    }
                                                }
                                            }}
                                        >
                                            Finish registration
                                        </LoadingButton>
                                    </FormControl>
                                </Stack>
                            </Container>
                        </Grid>
                    </Grid>
                </Container>
            }
        </AuthenticatedPage>
    );
}
