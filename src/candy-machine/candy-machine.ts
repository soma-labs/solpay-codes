import * as anchor from '@project-serum/anchor';
import {MintLayout, TOKEN_PROGRAM_ID, createInitializeMintInstruction, createMintToInstruction} from '@solana/spl-token';
import {SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY, PublicKey, Connection} from '@solana/web3.js';
import {CIVIC, getAtaForMint, getNetworkExpire, getNetworkToken, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID} from './candy-machine-utils';
import {PhantomWalletAdapter} from "@solana/wallet-adapter-wallets";
import {Wallet} from "@project-serum/anchor/dist/cjs/provider";
import {sleep} from "@toruslabs/base-controllers";

export const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',);

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',);

interface CandyMachineState {
    authority: anchor.web3.PublicKey;
    itemsAvailable: number;
    itemsRedeemed: number;
    itemsRemaining: number;
    treasury: anchor.web3.PublicKey;
    tokenMint: null | anchor.web3.PublicKey;
    isSoldOut: boolean;
    isActive: boolean;
    isPresale: boolean;
    isWhitelistOnly: boolean;
    goLiveDate: anchor.BN;
    price: anchor.BN;
    gatekeeper: null | {
        expireOnUse: boolean; gatekeeperNetwork: anchor.web3.PublicKey;
    };
    endSettings: null | {
        number: anchor.BN; endSettingType: any;
    };
    whitelistMintSettings: null | {
        mode: any; mint: anchor.web3.PublicKey; presale: boolean; discountPrice: null | anchor.BN;
    };
    hiddenSettings: null | {
        name: string; uri: string; hash: Uint8Array;
    };
    retainAuthority: boolean;
}

export interface CandyMachineAccount {
    id: anchor.web3.PublicKey;
    program: anchor.Program;
    state: CandyMachineState;
}

export interface CollectionData {
    mint: anchor.web3.PublicKey;
    candyMachine: anchor.web3.PublicKey;
}

export type SetupState = {
    mint: anchor.web3.Keypair;
    userTokenAccount: anchor.web3.PublicKey;
    transaction: string;
};

const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey,
    walletAddress: anchor.web3.PublicKey,
    splTokenMintAddress: anchor.web3.PublicKey,
) => {
    const keys = [
        {pubkey: payer, isSigner: true, isWritable: true},
        {pubkey: associatedTokenAddress, isSigner: false, isWritable: true},
        {pubkey: walletAddress, isSigner: false, isWritable: false},
        {pubkey: splTokenMintAddress, isSigner: false, isWritable: false},
        {pubkey: anchor.web3.SystemProgram.programId, isSigner: false, isWritable: false,},
        {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
        {pubkey: anchor.web3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false,},
    ];

    return new anchor.web3.TransactionInstruction({
        keys,
        programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([]),
    });
};

export const getCandyMachineAccount = async (
    connection: Connection | null,
    walletPublicKey: PublicKey,
    candyMachineId: string
): Promise<CandyMachineAccount | null> => {
    if (!connection) {
        console.log(`No connection.`);

        return null;
    }

    if (!walletPublicKey) {
        console.log(`No wallet public key.`);

        return null;
    }

    const wallet = new PhantomWalletAdapter();

    const anchorWallet = {
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
        publicKey: walletPublicKey
    };

    const candyMachinePublicKey = new PublicKey(candyMachineId);
    const cndy = await getCandyMachineState(
        anchorWallet,
        candyMachinePublicKey,
        connection,
    );

    const currentSlot = await connection.getSlot();
    let blockTime = null;
    let i = 0;

    while (i < 5) {
        try {
            blockTime = (await connection.getBlockTime(
                currentSlot,
            )) as number;

            break;
        } catch (e) {
            i++;
        }

        sleep(100 * i);
    }

    if (blockTime === null) {
        throw `failed to get block time for slot ${currentSlot}`;
    }

    const shift = new Date().getTime() / 1000 - blockTime;

    let active =
        cndy?.state.goLiveDate?.toNumber() + shift <
        new Date().getTime() / 1000;
    let presale = false;

    // duplication of state to make sure we have the right values!
    let isWLUser = false;
    let userPrice = cndy.state.price;

    // whitelist mint?
    if (cndy?.state.whitelistMintSettings) {
        // is it a presale mint?
        if (
            cndy.state.whitelistMintSettings.presale &&
            (!cndy.state.goLiveDate ||
                cndy.state.goLiveDate.toNumber() + shift >
                new Date().getTime() / 1000)
        ) {
            presale = true;
        }

        // is there a discount?
        if (cndy.state.whitelistMintSettings.discountPrice) {
            userPrice = cndy.state.whitelistMintSettings.discountPrice;
        } else {
            // when presale=false and discountPrice=null, mint is restricted
            // to whitelist users only
            if (!cndy.state.whitelistMintSettings.presale) {
                cndy.state.isWhitelistOnly = true;
            }
        }

        // retrieves the whitelist token
        // const mint = new anchor.web3.PublicKey(
        //     cndy.state.whitelistMintSettings.mint,
        // );
        // const token = (
        //     await getAtaForMint(mint, walletPublicKey)
        // )[0];
        //
        // try {
        //     const balance = await connection.getTokenAccountBalance(token);
        //     isWLUser = parseInt(balance.value.amount) > 0;
        //     // only whitelist the user if the balance > 0
        //
        //     if (cndy.state.isWhitelistOnly) {
        //         active = isWLUser && (presale || active);
        //     }
        // } catch (e) {
        //     // no whitelist user, no mint
        //     if (cndy.state.isWhitelistOnly) {
        //         active = false;
        //     }
        //     console.log(
        //         'There was a problem fetching whitelist token balance',
        //     );
        //     console.log(e);
        // }
    }

    userPrice = isWLUser ? userPrice : cndy.state.price;

    if (cndy?.state.tokenMint) {
        // retrieves the SPL token
        const mint = new anchor.web3.PublicKey(cndy.state.tokenMint);
        const token = (
            await getAtaForMint(mint, walletPublicKey)
        )[0];

        try {
            const balance = await connection.getTokenAccountBalance(token);

            const valid = new anchor.BN(balance.value.amount).gte(userPrice);

            // only allow user to mint if token balance >  the user if the balance > 0
            active = active && valid;
        } catch (e) {
            active = false;
            // no whitelist user, no mint
            console.log('There was a problem fetching SPL token balance');
            console.log(e);
        }
    } else {
        const balance = new anchor.BN(
            await connection.getBalance(walletPublicKey),
        );
        const valid = balance.gte(userPrice);
        active = active && valid;
    }

    // datetime to stop the mint?
    if (cndy?.state.endSettings?.endSettingType.date) {
        if (
            new Date().getTime() / 1000 >
            cndy.state.endSettings.number.toNumber() + shift
        ) {
            active = false;
        }
    }
    // amount to stop the mint?
    if (cndy?.state.endSettings?.endSettingType.amount) {
        const limit = Math.min(
            cndy.state.endSettings.number.toNumber(),
            cndy.state.itemsAvailable,
        );

        if (cndy.state.itemsRedeemed >= limit) {
            cndy.state.isSoldOut = true;
        }
    }

    if (cndy.state.isSoldOut) {
        active = false;
    }

    // const [collectionPDA] = await getCollectionPDA(candyMachinePublicKey);
    // const collectionPDAAccount = await connection.getAccountInfo(
    //     collectionPDA,
    // );

    cndy.state.isActive = active;
    cndy.state.isPresale = presale;

    // console.log(`Candy Machine:`, cndy);

    // const txnEstimate =
    //     892 +
    //     (!!collectionPDAAccount && cndy.state.retainAuthority ? 182 : 0) +
    //     (cndy.state.tokenMint ? 66 : 0) +
    //     (cndy.state.whitelistMintSettings ? 34 : 0) +
    //     (cndy.state.whitelistMintSettings?.mode?.burnEveryTime ? 34 : 0) +
    //     (cndy.state.gatekeeper ? 33 : 0) +
    //     (cndy.state.gatekeeper?.expireOnUse ? 66 : 0);

    // console.log(`Transaction estimate: ${txnEstimate}`);

    return cndy;
};

export const getCandyMachineState = async (
    anchorWallet: Wallet,
    candyMachineId: anchor.web3.PublicKey,
    connection: anchor.web3.Connection,
): Promise<CandyMachineAccount> => {
    const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        preflightCommitment: 'processed',
    });

    const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);
    const program = new anchor.Program(idl!, CANDY_MACHINE_PROGRAM, provider);
    const state: any = await program.account.candyMachine.fetch(candyMachineId);
    const itemsAvailable = state.data.itemsAvailable.toNumber();
    const itemsRedeemed = state.itemsRedeemed.toNumber();
    const itemsRemaining = itemsAvailable - itemsRedeemed;

    return {
        id: candyMachineId,
        program,
        state: {
            authority: state.authority,
            itemsAvailable,
            itemsRedeemed,
            itemsRemaining,
            isSoldOut: itemsRemaining === 0,
            isActive: false,
            isPresale: false,
            isWhitelistOnly: false,
            goLiveDate: state.data.goLiveDate,
            treasury: state.wallet,
            tokenMint: state.tokenMint,
            gatekeeper: state.data.gatekeeper,
            endSettings: state.data.endSettings,
            whitelistMintSettings: state.data.whitelistMintSettings,
            hiddenSettings: state.data.hiddenSettings,
            price: state.data.price,
            retainAuthority: state.data.retainAuthority,
        },
    };
};

const getMasterEdition = async (mint: anchor.web3.PublicKey,): Promise<anchor.web3.PublicKey> => {
    return (
        await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
                Buffer.from('edition'),
            ],
            TOKEN_METADATA_PROGRAM_ID,
        )
    )[0];
};

const getMetadata = async (mint: anchor.web3.PublicKey,): Promise<anchor.web3.PublicKey> => {
    return (
        await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID,
        )
    )[0];
};

export const getCandyMachineCreator = async (candyMachine: anchor.web3.PublicKey,): Promise<[anchor.web3.PublicKey, number]> => {
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('candy_machine'), candyMachine.toBuffer()
        ],
        CANDY_MACHINE_PROGRAM,
    );
};

export const getCollectionPDA = async (candyMachineAddress: anchor.web3.PublicKey,): Promise<[anchor.web3.PublicKey, number]> => {
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from('collection'),
            candyMachineAddress.toBuffer()
        ],
        CANDY_MACHINE_PROGRAM,
    );
};

export const getCollectionAuthorityRecordPDA = async (
    mint: anchor.web3.PublicKey,
    newAuthority: anchor.web3.PublicKey,
): Promise<anchor.web3.PublicKey> => {
    return (
        await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
                Buffer.from('collection_authority'),
                newAuthority.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID,
        )
    )[0];
};

export const mintOneToken = async (
    candyMachine: CandyMachineAccount,
    payer: anchor.web3.PublicKey,
    setupState?: SetupState,
): Promise<[Array<anchor.web3.TransactionInstruction>, anchor.web3.Keypair[], anchor.BN]> => {
    const mint = setupState?.mint ?? anchor.web3.Keypair.generate();
    const userTokenAccountAddress = (await getAtaForMint(mint.publicKey, payer))[0];
    const userPayingAccountAddress = candyMachine.state.tokenMint ? (await getAtaForMint(candyMachine.state.tokenMint, payer))[0] : payer;
    const candyMachineAddress = candyMachine.id;
    const remainingAccounts = [];
    const instructions = [];
    const signers: anchor.web3.Keypair[] = [];

    if (!setupState) {
        signers.push(mint);

        instructions.push(
            ...[
                anchor.web3.SystemProgram.createAccount({
                    fromPubkey: payer,
                    newAccountPubkey: mint.publicKey,
                    space: MintLayout.span,
                    lamports: await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(MintLayout.span,),
                    programId: TOKEN_PROGRAM_ID,
                }),
                createInitializeMintInstruction(
                    mint.publicKey,
                    0,
                    payer,
                    payer,
                    TOKEN_PROGRAM_ID,
                ),
                createAssociatedTokenAccountInstruction(
                    userTokenAccountAddress,
                    payer,
                    payer,
                    mint.publicKey,
                ),
                createMintToInstruction(
                    mint.publicKey,
                    userTokenAccountAddress,
                    payer,
                    1,
                    [],
                    TOKEN_PROGRAM_ID,
                ),
            ],
        );
    }

    if (candyMachine.state.gatekeeper) {
        remainingAccounts.push({
            pubkey: (await getNetworkToken(payer, candyMachine.state.gatekeeper.gatekeeperNetwork,))[0],
            isWritable: true,
            isSigner: false,
        });

        if (candyMachine.state.gatekeeper.expireOnUse) {
            remainingAccounts.push({
                pubkey: CIVIC, isWritable: false, isSigner: false,
            });
            remainingAccounts.push({
                pubkey: (await getNetworkExpire(candyMachine.state.gatekeeper.gatekeeperNetwork,))[0],
                isWritable: false,
                isSigner: false,
            });
        }
    }

    if (candyMachine.state.whitelistMintSettings) {
        const mint = new anchor.web3.PublicKey(candyMachine.state.whitelistMintSettings.mint,);

        const whitelistToken = (await getAtaForMint(mint, payer))[0];
        remainingAccounts.push({
            pubkey: whitelistToken, isWritable: true, isSigner: false,
        });

        if (candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
            remainingAccounts.push({
                pubkey: mint, isWritable: true, isSigner: false,
            });
            remainingAccounts.push({
                pubkey: payer, isWritable: false, isSigner: true,
            });
        }
    }

    if (candyMachine.state.tokenMint) {
        remainingAccounts.push({
            pubkey: userPayingAccountAddress, isWritable: true, isSigner: false,
        });
        remainingAccounts.push({
            pubkey: payer, isWritable: false, isSigner: true,
        });
    }

    const metadataAddress = await getMetadata(mint.publicKey);
    const masterEdition = await getMasterEdition(mint.publicKey);
    const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(candyMachineAddress,);

    instructions.push(
        await candyMachine.program.instruction.mintNft(
            creatorBump,
            {
                accounts: {
                    candyMachine: candyMachineAddress,
                    candyMachineCreator,
                    payer: payer,
                    wallet: candyMachine.state.treasury,
                    mint: mint.publicKey,
                    metadata: metadataAddress,
                    masterEdition,
                    mintAuthority: payer,
                    updateAuthority: payer,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                    recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
                    instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                },
                remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined,
            }
        )
    );

    const [collectionPDA] = await getCollectionPDA(candyMachineAddress);
    const collectionPDAAccount = await candyMachine.program.provider.connection.getAccountInfo(collectionPDA,);

    if (collectionPDAAccount && candyMachine.state.retainAuthority) {
        try {
            const collectionData = (await candyMachine.program.account.collectionPda.fetch(collectionPDA,) as unknown) as CollectionData;

            console.log(collectionData);

            const collectionMint = collectionData.mint;
            const collectionAuthorityRecord = await getCollectionAuthorityRecordPDA(collectionMint, collectionPDA,);

            console.log(collectionMint);

            if (collectionMint) {
                const collectionMetadata = await getMetadata(collectionMint);
                const collectionMasterEdition = await getMasterEdition(collectionMint);

                console.log('Collection PDA: ', collectionPDA.toBase58());
                console.log('Authority: ', candyMachine.state.authority.toBase58());

                instructions.push(await candyMachine.program.instruction.setCollectionDuringMint({
                    accounts: {
                        candyMachine: candyMachineAddress,
                        metadata: metadataAddress,
                        payer: payer,
                        collectionPda: collectionPDA,
                        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                        instructions: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                        collectionMint,
                        collectionMetadata,
                        collectionMasterEdition,
                        authority: candyMachine.state.authority,
                        collectionAuthorityRecord,
                    },
                }),);
            }
        } catch (error) {
            console.error(error);
        }
    }

    return [instructions, signers, candyMachine.state.price];
};
