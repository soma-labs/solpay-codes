import {Connection, PublicKey, Transaction, TransactionInstruction} from "@solana/web3.js";
import {WalletAdapter} from "@solana/wallet-adapter-base";
import * as borsh from "@project-serum/borsh";
import {Buffer} from "buffer";
import {CmaProgramInstructions, CmaProgramId} from "../constants";
import {ProjectAccountDiscriminator} from "./project-account";

class ProjectAccountUpdateData {
    project_owner_pubkey: PublicKey;
    candy_machine_id: PublicKey;
    affiliate_fee_percentage: number;
    affiliate_target_in_sol: number;
    max_affiliate_count: number;
    title: string;

    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        borsh.publicKey('project_owner_pubkey'),
        borsh.publicKey('candy_machine_id'),
        borsh.f64('affiliate_fee_percentage'),
        borsh.u8('affiliate_target_in_sol'),
        borsh.u8('max_affiliate_count'),
        borsh.str('title'),
    ]);

    constructor(
        project_owner_pubkey: PublicKey,
        candy_machine_id: PublicKey,
        affiliate_fee_percentage: number,
        affiliate_target_in_sol: number,
        max_affiliate_count: number,
        title: string
    ) {
        this.project_owner_pubkey = project_owner_pubkey;
        this.candy_machine_id = candy_machine_id;
        this.affiliate_fee_percentage = affiliate_fee_percentage;
        this.affiliate_target_in_sol = affiliate_target_in_sol;
        this.max_affiliate_count = max_affiliate_count;
        this.title = title;
    }

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000);

        this.borshInstructionSchema.encode({...this, variant: CmaProgramInstructions.UpdateProjectAccount}, buffer);

        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
    }
}

const updateProjectAccount = async (
    data: {
        owner: PublicKey,
        candyMachineId: PublicKey,
        affiliateFeePercentage: number,
        affiliateTargetInSol: number,
        maxAffiliateCount: number,
        title: string,
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

    const updateInstructionData = new ProjectAccountUpdateData(
        data.owner,
        data.candyMachineId,
        data.affiliateFeePercentage,
        data.affiliateTargetInSol,
        data.maxAffiliateCount,
        data.title
    );
    const transaction = new Transaction();
    const updateInstruction = new TransactionInstruction({
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
        ],
        data: updateInstructionData.serialize()
    });

    transaction.add(updateInstruction);

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

export default updateProjectAccount;
