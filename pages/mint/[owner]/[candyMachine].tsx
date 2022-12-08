import {useRouter} from "next/router";
import useProject from "../../../src/hooks/useProject";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import LoadingIcon from "../../../src/components/loading-icon";
import {createQR} from "@solana/pay";
import Image from "next/image";
import {LAMPORTS_PER_SOL, Transaction} from "@solana/web3.js";
import {PopupMessageContext, PopupMessageTypes} from "../../../src/providers/popup-message-provider";
import getSolscanLink from "../../../src/utils/solscan-link";
import {Box, Button, CircularProgress, Container, Grid, List, ListItem, Typography} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import useCandyMachineAccount from "../../../src/hooks/useCandyMachineAccount";
import {SolTokenIcon} from "../../../src/program/constants";
import getDiscountedNftPrice from "../../../src/program/utils/discount-price-calculator";
import {CandyMachineAccount} from "../../../src/candy-machine/candy-machine";
import Link from "next/link";

export default function ProjectMint() {
    const {setMessage} = useContext(PopupMessageContext);
    const router = useRouter();
    const {owner, candyMachine, affiliate} = router.query;
    const {wallet, connection, showWalletsModal} = useContext(AuthContext);
    const [qrImageData, setQrImageData] = useState<string | null>(null);
    const {projectLoading, project} = useProject(owner as string, candyMachine as string);
    const [isMinting, setIsMinting] = useState<boolean>(false);
    const candyMachineAccount = useCandyMachineAccount(candyMachine as string|null);

    const onMintClick = () => {
        if (isMinting) {
            return;
        }

        setIsMinting(true);
        mintNft();
    };

    const mintNft = async () => {
        if (!owner || !candyMachine) {
            return;
        }

        if (!wallet.connected || !wallet.publicKey) {
            setMessage(`Wallet not connected.`, PopupMessageTypes.Error);

            return;
        }

        try {
            const response = await fetch(`/api/candy-machine-mint/${owner}/${candyMachine}?affiliate=${affiliate ?? ''}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({account: wallet.publicKey.toString()})
            });
            const jsonResponse: {transaction: string} = await response.json();
            const transaction = Transaction.from(
                Buffer.from(jsonResponse.transaction, "base64")
            );
            const signature = await wallet.sendTransaction(transaction, connection);

            setMessage(
                `Mint successful! View <a class="link" target="_blank" href="${getSolscanLink(signature)}">transaction</a>`,
                PopupMessageTypes.Success
            );
        } catch (error: any) {
            let message = error.msg || 'Minting failed! Please try again!';

            if (!error.msg) {
                if (!error.message) {
                    message = 'Transaction timeout! Please try again.';
                } else if (error.message.indexOf('0x137')) {
                    message = error.toString();
                } else if (error.message.indexOf('0x135')) {
                    message = `Insufficient funds to mint. Please fund your wallet.`;
                }
            } else {
                if (error.code === 311) {
                    message = `SOLD OUT!`;
                    window.location.reload();
                } else if (error.code === 312) {
                    message = `Minting period hasn't started yet.`;
                }
            }

            setMessage(message, PopupMessageTypes.Error);
        }

        setIsMinting(false);
    };

    const isLive = (candyMachineAccount: CandyMachineAccount | null): boolean => {
        if (!candyMachineAccount) {
            return false;
        }

        return candyMachineAccount.state.goLiveDate.muln(1000).toNumber() <= (new Date()).getTime();
    };

    const getGoLiveDate = (candyMachineAccount: CandyMachineAccount | null, withTime: boolean = false): string => {
        if (!candyMachineAccount) {
            return '';
        }

        const date = (new Date(candyMachineAccount.state.goLiveDate.muln(1000).toNumber())).toISOString();

        if (withTime) {
            return date;
        }

        return (new Date(candyMachineAccount.state.goLiveDate.muln(1000).toNumber())).toISOString().split('T')[0];
    };

    useEffect(() => {
        if (!owner || !candyMachine) {
            return;
        }

        const url = encodeURIComponent(`${document.location.origin}/api/candy-machine-mint/${owner}/${candyMachine}?affiliate=${affiliate ?? ''}`);
        const qr = createQR(`solana:${url}`);

        qr.getRawData('png')
            .then(data => {
                if (data === null) {
                    return;
                }

                const reader = new FileReader();

                reader.readAsDataURL(data);
                reader.onload = () => setQrImageData(reader.result as string);
            });
    }, [owner, candyMachine]);

    return (
        <Container maxWidth="xl" sx={{p: 3}} className="nft-project nft-project--mint">
            {projectLoading ? <LoadingIcon/>: !project ? null :
                <Grid container display="flex" justifyContent="center" spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Box className="nft-project__image-container" mb={3}>
                            {project.projectData?.image_url &&
                                <Image src={project.projectData.image_url} className="nft-project__image" alt="" layout="fill"/>
                            }
                        </Box>
                        <Box className="nft-project__social-links" mb={3}>
                            {project.projectData?.url &&
                                <Link href={project.projectData.url}>
                                    <a target={'_blank'}>
                                        <Image src={`/images/website-icon.png`} alt="" width={50} height={50}/>
                                    </a>
                                </Link>
                            }
                            {project.projectData?.twitter_url &&
                                <Link href={project.projectData.twitter_url}>
                                    <a target={'_blank'}>
                                        <Image src={`/images/twitter-icon.png`} alt="" width={50} height={50}/>
                                    </a>
                                </Link>
                            }
                            {project.projectData?.discord_url &&
                                <Link href={project.projectData.discord_url}>
                                    <a target={'_blank'}>
                                        <Image src={`/images/discord-icon.png`} alt="" width={50} height={50}/>
                                    </a>
                                </Link>
                            }
                        </Box>
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
                    <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
                        {qrImageData &&
                            <Box mb={2}>
                                <Image src={qrImageData} width={512} height={512} alt=""/>
                            </Box>
                        }
                        {!wallet.connected ?
                            <Typography variant="h4">
                                You have to
                                &nbsp;
                                <a href='#' className="link" onClick={(e: any) => {
                                    e.preventDefault();
                                    showWalletsModal();
                                }}>
                                    connect your wallet
                                </a>
                                &nbsp;
                                in order to mint
                            </Typography>
                            :
                            candyMachineAccount !== null && (
                                !isLive(candyMachineAccount) ?
                                    <Button fullWidth variant="contained" color="secondary" size="large">
                                        Minting starts on {getGoLiveDate(candyMachineAccount, true)}
                                    </Button>
                                    :
                                    <LoadingButton
                                        fullWidth
                                        loading={isMinting}
                                        variant="contained"
                                        color="success"
                                        size="large"
                                        onClick={onMintClick}>
                                        {isMinting ? 'MINTING...' : 'MINT'}
                                    </LoadingButton>
                            )
                        }
                        <Box
                            component="section"
                            className="candy-machine-details"
                            display="flex"
                            justifyContent="center"
                            mt={3}
                            sx={{width: '100%'}}
                        >
                            {!candyMachineAccount ?
                                <CircularProgress size="2rem"/>
                                :
                                <List dense disablePadding sx={{width: '100%'}}>
                                    <ListItem disableGutters>
                                        <Box display="flex" justifyContent="space-between" sx={{width: '100%'}}>
                                            <strong>Total Minted:</strong>
                                            <span>
                                                {candyMachineAccount.state.itemsRedeemed * 100 / candyMachineAccount.state.itemsAvailable}%
                                                ({candyMachineAccount.state.itemsRedeemed}/{candyMachineAccount.state.itemsAvailable})
                                            </span>
                                        </Box>
                                    </ListItem>
                                    <ListItem disableGutters>
                                        <Box display="flex" justifyContent="space-between" sx={{width: '100%'}}>
                                            <strong>Go Live Date:</strong>
                                            <span>
                                                {getGoLiveDate(candyMachineAccount)}
                                            </span>
                                        </Box>
                                    </ListItem>
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
                                </List>
                            }
                        </Box>
                    </Grid>
                </Grid>
            }
        </Container>
    );
}
