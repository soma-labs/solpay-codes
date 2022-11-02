import React, {useContext, useEffect, useState} from "react";
import {AvanaWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter} from "@solana/wallet-adapter-wallets";
import * as Web3 from "@solana/web3.js";
import {Connection, PublicKey} from "@solana/web3.js";
import {WalletAdapter, WalletNotReadyError, WalletReadyState} from "@solana/wallet-adapter-base";
import Image from "next/image";
import {PopupMessageContext, PopupMessageTypes} from "./popup-message-provider";
import {Box, Button, List, ListItem, Modal, Typography} from "@mui/material";

export type AuthContextType = {
    wallet: WalletAdapter,
    connection: Connection,
    showWalletsModal: () => void,
    logout: () => Promise<void>,
};

export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);

const defaultConnection = new Web3.Connection(
    process.env.NEXT_PUBLIC_CLUSTER_URL ? process.env.NEXT_PUBLIC_CLUSTER_URL : Web3.clusterApiUrl('devnet'),
    'confirmed'
);

const WalletAdapters = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new AvanaWalletAdapter(),
];

const ChosenWalletAdapterKey = 'solpay_codes_chosen_wallet';

export default function AuthProvider({children}: {children: any}) {
    const {setMessage} = useContext(PopupMessageContext);
    let [isConnected, setIsConnected] = useState<boolean>(false);
    let [chosenWallet, setChosenWallet] = useState<string | null>(null);
    let [modalVisible, setModalVisible] = useState<boolean>(false);
    let [wallet, setWallet] = useState<WalletAdapter>(WalletAdapters[0]);
    let [connection] = useState<Connection>(defaultConnection);

    WalletAdapters.forEach(wallet => {
        wallet.on('readyStateChange', (readyState: WalletReadyState) => {
            if (readyState === WalletReadyState.Installed && chosenWallet === wallet.name) {
                loginWithWallet(wallet);
            }
        });
    });

    wallet
        .on('connect', (publicKey: PublicKey) => setIsConnected(true))
        .on('disconnect', () => setIsConnected(false));

    const showWalletsModal = () => setModalVisible(true);
    const hideWalletsModal = () => setModalVisible(false);
    const loginWithWallet = async (walletAdapter: WalletAdapter) => {
        try {
            await walletAdapter.connect();
            window.localStorage.setItem(ChosenWalletAdapterKey, walletAdapter.name);
            setModalVisible(false);
            setChosenWallet(walletAdapter.name);
            setWallet(walletAdapter);
        } catch (e: any) {
            if (e instanceof Error) {
                setMessage(e.toString(), PopupMessageTypes.Error);
                if (e instanceof WalletNotReadyError) {
                    setMessage('Wallet not installed', PopupMessageTypes.Error);
                } else {
                    setMessage(e.toString(), PopupMessageTypes.Error);
                }
            } else {
                console.log(e);
            }
        }
    };
    const logout = async () => {
        await wallet.disconnect();
        setChosenWallet(null);
        window.localStorage.removeItem(ChosenWalletAdapterKey);
    };

    const defaultAuthContextValue: AuthContextType = {
        wallet,
        connection,
        showWalletsModal: showWalletsModal,
        logout,
    };

    useEffect(() => {
        const chosenWallet = window.localStorage.getItem(ChosenWalletAdapterKey);

        if (chosenWallet) {
            setChosenWallet(chosenWallet);
        }
    }, []);

    useEffect(() => {
        if (!isConnected && chosenWallet) {
            const wallet = WalletAdapters.find(walletAdapter => walletAdapter.name === chosenWallet);

            if (wallet && wallet.readyState === WalletReadyState.Installed) {
                loginWithWallet(wallet);
            }
        }
    }, [chosenWallet]);

    return (
        <AuthContext.Provider value={defaultAuthContextValue}>
            {children}
            <Modal
                open={modalVisible}
                onClose={hideWalletsModal}
                aria-labelledby="wallets-modal-title"
                aria-describedby="wallets-modal-description"
            >
                <Box sx={{
                    position: 'absolute' as 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: '#fff',
                    boxShadow: 24,
                    p: 2,
                }}>
                    <Typography id="wallets-modal-title" variant="h2" component="h2" textAlign="center">
                        Choose wallet
                    </Typography>
                    <List>
                        {WalletAdapters.map((walletAdapter, index) =>
                            <ListItem key={index}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}
                                    startIcon={<Image src={walletAdapter.icon} alt="" width={32} height={32} className="wallet-button__icon"/>}
                                    onClick={loginWithWallet.bind(null, walletAdapter)}
                                >
                                    {walletAdapter.name}
                                </Button>
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Modal>
        </AuthContext.Provider>
    );
};
