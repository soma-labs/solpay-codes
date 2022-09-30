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
        <section className="nft-project nft-project--mint d-flex flex-wrap justify-content-center">
            {projectLoading ? <LoadingIcon/>: !project ? null :
                <>
                    <div className="col-12 col-md-4">
                        <div className="nft-project__image-container d-flex justify-content-center align-items-center mb-3">
                            {project.projectData?.image_url &&
                                <img src={project.projectData?.image_url} className="nft-project__image" alt=""/>}
                        </div>
                        <header className="nft-project__header mb-5">
                            <h1 className="nft-project__title">
                                {project.projectData?.title || `Candy Machine: ${candyMachine}`}
                            </h1>
                            <div className="nft-project__description">
                                {project.projectData?.description}
                            </div>
                        </header>
                    </div>
                    <div className="col-12 col-md-4 ps-4 d-flex flex-column align-items-center">
                        {qrImageData &&
                            <div className="mb-5">
                                <Image src={qrImageData} width={512} height={512} alt=""/>
                            </div>
                        }
                        {wallet.connected &&
                            <button
                                disabled={isMinting}
                                className={`button button--mint ${isMinting ? 'button--is-minting' : ''}`}
                                onClick={onMintClick}>
                                {isMinting ? 'MINTING...' : 'MINT!'}
                            </button>
                        }
                    </div>
                </>
            }
        </section>
    );
}
