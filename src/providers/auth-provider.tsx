import React, {useContext, useEffect, useState} from "react";
import {AvanaWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter} from "@solana/wallet-adapter-wallets";
import * as Web3 from "@solana/web3.js";
import {Connection, PublicKey} from "@solana/web3.js";
import {WalletAdapter, WalletNotReadyError} from "@solana/wallet-adapter-base";
import Image from "next/image";
import {PopupMessageContext, PopupMessageTypes} from "./popup-message-provider";

export type AuthContextType = {
    wallet: WalletAdapter,
    connection: Connection,
    login: () => Promise<any>,
    logout: () => Promise<any>,
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
    let [wallet, setWallet] = useState<WalletAdapter>(new PhantomWalletAdapter());
    let [connection] = useState<Connection>(defaultConnection);

    let [modalVisible, setModalVisible] = useState<boolean>(false);

    wallet
        .on('connect', (publicKey: PublicKey) => setIsConnected(true))
        .on('disconnect', () => setIsConnected(false));

    const login = async () => setModalVisible(true);
    const logout = async () => {
        await wallet.disconnect();
        setChosenWallet(null);
        window.localStorage.removeItem(ChosenWalletAdapterKey);
    };
    const onModalOverlayClick = (e: any) => setModalVisible(!e.target.classList.contains('wallets-modal'));
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

    const defaultAuthContextValue: AuthContextType = {
        wallet,
        connection,
        login,
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
            if (wallet) {
                loginWithWallet(wallet);
            }
        }
    }, [chosenWallet]);

    return (
        <AuthContext.Provider value={defaultAuthContextValue}>
            {children}
            <div onClick={onModalOverlayClick} className={`wallets-modal ${modalVisible ? `wallets-modal--visible` : ``} d-flex justify-content-center align-items-center`}>
                <div className="wallets-modal__inner d-flex flex-column">
                    <ul className="wallet-list">
                        {WalletAdapters.map((walletAdapter, index) =>
                            <li key={index} className="wallet-list__item">
                                <button
                                    onClick={loginWithWallet.bind(null, walletAdapter)}
                                    className="wallet-button d-flex align-items-center"
                                >
                                    <Image src={walletAdapter.icon} alt="" width={32} height={32} className="wallet-button__icon"/>
                                    <span className="wallet-button__name">
                                        {walletAdapter.name}
                                    </span>
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </AuthContext.Provider>
    );
};
