import * as borsh from '@project-serum/borsh';
import {Buffer} from "buffer";
import {PublicKey} from "@solana/web3.js";

export const ProjectAccountDiscriminator = 'project_account';

export type ProjectAccountPropsType = {
    discriminator: string;
    is_initialized: boolean;
    data_version: number;
    data: ProjectAccountDataType;
}

export type ProjectAccountDataType = {
    project_owner_pubkey: PublicKey,
    candy_machine_id: PublicKey,
    affiliate_fee_percentage: number,
    redeem_threshold_in_sol: number,
}

export default class ProjectAccount {
    discriminator: string;
    is_initialized: boolean;
    data_version: number;
    data: ProjectAccountDataType;

    static borshAccountSchema = borsh.struct([
        borsh.str('discriminator'),
        borsh.bool('is_initialized'),
        borsh.u8('data_version'),
        borsh.struct([
            borsh.publicKey('project_owner_pubkey'),
            borsh.publicKey('candy_machine_id'),
            borsh.f64('affiliate_fee_percentage'),
            borsh.u8('redeem_threshold_in_sol'),
        ], 'data')
    ]);

    constructor({discriminator, is_initialized, data_version, data}: ProjectAccountPropsType) {
        this.discriminator = discriminator;
        this.is_initialized = is_initialized;
        this.data_version = data_version;
        this.data = data;
    }

    static deserialize(buffer?: Buffer): ProjectAccount | null {
        if (!buffer) {
            return null;
        }

        try {
            const {discriminator, is_initialized, data_version, data} = ProjectAccount.borshAccountSchema.decode(buffer);

            return new ProjectAccount({discriminator, is_initialized, data_version, data});
        } catch (e) {
            console.log(`Deserialization error`, e);

            return null;
        }
    }
}
