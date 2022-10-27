import {useRouter} from "next/router";
import useProject from "../../../src/hooks/useProject";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import LoadingIcon from "../../../src/components/loading-icon";
import {createQR} from "@solana/pay";
import Image from "next/image";
import {Transaction} from "@solana/web3.js";
import {PopupMessageContext, PopupMessageTypes} from "../../../src/providers/popup-message-provider";
import getSolscanLink from "../../../src/utils/solscan-link";
import {Box, Container, Grid, Typography} from "@mui/material";
import {LoadingButton} from "@mui/lab";

export default function ProjectMint() {
    const {setMessage} = useContext(PopupMessageContext);
    const router = useRouter();
    const {owner, candyMachine, affiliate} = router.query;
    const {wallet, connection} = useContext(AuthContext);
    const [qrImageData, setQrImageData] = useState<string | null>(null);
    const {projectLoading, project} = useProject(owner as string, candyMachine as string);
    const [isMinting, setIsMinting] = useState<boolean>(false);

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
                <Grid container display="flex" justifyContent="center">
                    <Grid item xs={12} md={4}>
                        <Box className="nft-project__image-container" mb={3}>
                            {project.projectData?.image_url &&
                                <Image src={project.projectData.image_url} className="nft-project__image" alt="" layout="fill"/>
                            }
                        </Box>
                        <Box component="header" className="nft-project__header" mb={3}>
                            <Typography variant="h1" className="nft-project__title" mb={2}>
                                {project.getTitle()}
                            </Typography>

                            <Typography component="p" className="nft-project__description">
                                {project.projectData?.description}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
                        {qrImageData &&
                            <Box mb={2}>
                                <Image src={qrImageData} width={512} height={512} alt=""/>
                            </Box>
                        }
                        {wallet.connected &&
                            <LoadingButton
                                fullWidth
                                loading={isMinting}
                                variant="contained"
                                color="success"
                                size="large"
                                onClick={onMintClick}>
                                {isMinting ? 'MINTING...' : 'MINT!'}
                            </LoadingButton>
                        }
                    </Grid>
                </Grid>
            }
        </Container>
    );
}
