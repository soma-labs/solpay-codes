import {useContext, useRef, useState} from "react";
import {AuthContext} from "../../../../src/providers/auth-provider";
import {PopupMessageContext, PopupMessageTypes} from "../../../../src/providers/popup-message-provider";
import {useRouter} from "next/router";
import {PublicKey} from "@solana/web3.js";
import AdminPage from "../../../../src/components/admin/admin-page";
import updateProjectAccount from "../../../../src/program/project-accounts/update-project-account";
import useProject from "../../../../src/hooks/useProject";
import LoadingIcon from "../../../../src/components/loading-icon";
import ProjectAffiliates from "../../../../src/components/admin/projects/project-affiliates";
import getSolscanLink from "../../../../src/utils/solscan-link";
import {WalletProjectsContext} from "../../../../src/providers/wallet-projects-provider";
import {sleep} from "@toruslabs/base-controllers";
import Image from "next/image";
import {Box, Container, FormControl, Grid, InputAdornment, TextField, Typography} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import {Stack} from "@mui/system";

export default function AdminProjectDetails() {
    const {setMessage} = useContext(PopupMessageContext);
    const {refreshWalletProjects} = useContext(WalletProjectsContext);
    const {wallet, connection} = useContext(AuthContext);
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const {owner, candyMachine} = router.query;
    const {projectLoading, project} = useProject(owner as string, candyMachine as string, false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    const onProjectUpdateFormSubmit = async () => {
        if (isUpdating) {
            return;
        }

        setIsUpdating(true);

        const formData = new FormData(formRef.current as HTMLFormElement);

        try {
            const signature = await updateProjectAccount({
                owner: new PublicKey(owner as string),
                candyMachineId: new PublicKey(candyMachine as string),
                affiliateFeePercentage: parseFloat(formData.get('affiliate_fee_percentage') as string),
                affiliateTargetInSol: parseFloat(formData.get('affiliate_target_in_sol') as string),
                maxAffiliateCount: parseInt(formData.get('max_affiliate_count') as string),
                title: formData.get('title') as string,
            }, wallet, connection);

            setMessage(
                `Update successful! View <a class="link" target="_blank" href="${getSolscanLink(signature)}">transaction</a>`,
                PopupMessageTypes.Success
            );

            await sleep(1000);

            setIsUpdating(false);

            refreshWalletProjects();
        } catch (e) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }

            setIsUpdating(false);
        }
    };

    return (
        <AdminPage>
            <Container maxWidth="xl" sx={{p: 3}} className="nft-project nft-project--single">
                {projectLoading ? <LoadingIcon/>: !project ? null :
                    <>
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

                                <Container maxWidth="sm" sx={{m: 0}}>
                                    <Stack spacing={2} component="form" ref={formRef} onSubmit={onProjectUpdateFormSubmit}>
                                        <input type="hidden" name="candy_machine_id" value={project.projectAccount.data.candy_machine_id.toString()}/>
                                        <FormControl>
                                            <TextField
                                                name="affiliate_fee_percentage"
                                                label={`Affiliate fee percentage`}
                                                inputProps={{ inputMode: 'numeric', pattern: '^[1-9][0-9]?$|^100$' }}
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                                                }}
                                                defaultValue={project.projectAccount.data.affiliate_fee_percentage}
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
                                                defaultValue={project.projectAccount.data.affiliate_target_in_sol}
                                                required
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <TextField
                                                name="max_affiliate_count"
                                                label={`Max affiliate count`}
                                                inputProps={{ inputMode: 'numeric', pattern: '\\b(1?0|[1-9][0-9]{0,1}|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\\b' }}
                                                defaultValue={project.projectAccount.data.max_affiliate_count}
                                                required
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <TextField
                                                name="title"
                                                label={`Title`}
                                                defaultValue={project.projectAccount.data.title}
                                                required
                                            />
                                        </FormControl>
                                        <FormControl>
                                            <LoadingButton
                                                loading={isUpdating}
                                                variant="contained"
                                                onClick={() => {
                                                    if (formRef.current) {
                                                        if (formRef.current.reportValidity()) {
                                                            onProjectUpdateFormSubmit();
                                                        }
                                                    }
                                                }}
                                            >
                                                Update Project Data
                                            </LoadingButton>
                                        </FormControl>
                                    </Stack>
                                </Container>
                            </Grid>
                        </Grid>

                        <Container maxWidth="xl" sx={{m: 0, marginTop: 3, p: '0 !important'}}>
                            <ProjectAffiliates
                                owner={owner as string}
                                candyMachine={candyMachine as string}
                            />
                        </Container>
                    </>
                }
            </Container>
        </AdminPage>
    );
}
