import {Connection, PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {WalletAdapter} from "@solana/wallet-adapter-base";
import * as borsh from "@project-serum/borsh";
import {Buffer} from "buffer";
import {AffiliateAccountDiscriminator} from "./affiliate-account";
import {CmaProgramInstructions, CmaProgramId, SolPayTreasuryAccount} from "../constants";

class AffiliateAccountClosureData {
    affiliate_pubkey: PublicKey;
    project_owner_pubkey: PublicKey;
    candy_machine_id: PublicKey;

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.publicKey('affiliate_pubkey'),
        borsh.publicKey('project_owner_pubkey'),
        borsh.publicKey('candy_machine_id'),
    ]);

    constructor(affiliate_pubkey: PublicKey, project_owner_pubkey: PublicKey, candy_machine_id: PublicKey) {
        this.affiliate_pubkey = affiliate_pubkey;
        this.project_owner_pubkey = project_owner_pubkey;
        this.candy_machine_id = candy_machine_id;
    }

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000);

        this.borshInstructionSchema.encode({...this, variant: CmaProgramInstructions.CloseAffiliateAccount}, buffer);

        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
    }
}

const closeAffiliateAccount = async (
    data: {
        affiliate: PublicKey,
        owner: PublicKey,
        candyMachineId: PublicKey,
    },
    wallet: WalletAdapter,
    connection: Connection,
): Promise<string> => {
    if (!connection) {
        throw 'Not connected to RPC';
    }

    if (!wallet || !wallet.publicKey) {
        throw 'Wallet not connected';
    }

    const [pda] = await PublicKey.findProgramAddress(
        [
            new Buffer(AffiliateAccountDiscriminator),
            data.affiliate.toBuffer(),
            data.owner.toBuffer(),
            data.candyMachineId.toBuffer()
        ],
        CmaProgramId
    );

    const closureInstructionData = new AffiliateAccountClosureData(data.affiliate, data.owner, data.candyMachineId);
    const transaction = new Transaction();
    const closureInstruction = new TransactionInstruction({
        programId: CmaProgramId,
        keys: [
            {
                pubkey: wallet.publicKey,
                isSigner: true,
                isWritable: false,
            },
            {
                pubkey: pda,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: SolPayTreasuryAccount,
                isSigner: false,
                isWritable: true,
            }
        ],
        data: closureInstructionData.serialize()
    });

    transaction.add(closureInstruction);

    const signature = await wallet.sendTransaction(transaction, connection); // {skipPreflight: true}
    const latestBlockHash = await connection.getLatestBlockhash();

    if (!connection.rpcEndpoint.includes('localhost')) {
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature,
        });
    }

    return signature;
};

export default closeAffiliateAccount;
