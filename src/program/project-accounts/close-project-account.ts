import {Connection, PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {WalletAdapter} from "@solana/wallet-adapter-base";
import * as borsh from "@project-serum/borsh";
import {Buffer} from "buffer";
import {CmaProgramInstructions, CmaProgramId} from "../constants";
import {ProjectAccountDiscriminator} from "./project-account";

class ProjectAccountClosureData {
    project_owner_pubkey: PublicKey;
    candy_machine_id: PublicKey;

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.publicKey('project_owner_pubkey'),
        borsh.publicKey('candy_machine_id'),
    ]);

    constructor(project_owner_pubkey: PublicKey, candy_machine_id: PublicKey) {
        this.project_owner_pubkey = project_owner_pubkey;
        this.candy_machine_id = candy_machine_id;
    }

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000);

        this.borshInstructionSchema.encode({...this, variant: CmaProgramInstructions.CloseProjectAccount}, buffer);

        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
    }
}

const closeProjectAccount = async (
    data: {
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
            new Buffer(ProjectAccountDiscriminator),
            data.owner.toBuffer(),
            data.candyMachineId.toBuffer()
        ],
        CmaProgramId
    );

    const closureInstructionData = new ProjectAccountClosureData(
        data.owner,
        data.candyMachineId,
    );
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
                pubkey: data.owner,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: closureInstructionData.serialize()
    });

    transaction.add(closureInstruction);

    const signature = await wallet.sendTransaction(transaction, connection, {skipPreflight: true});
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

export default closeProjectAccount;
