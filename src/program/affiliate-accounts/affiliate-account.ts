import * as borsh from '@project-serum/borsh';
import {Buffer} from "buffer";
import {AccountInfo, Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import getProjectAccount from "../project-accounts/get-project-account";
import Project from '../../models/project/project';
import getProjectData from "../../models/project/get-project-data";

export const AffiliateAccountDiscriminator = 'affiliate_account';
const AffiliateAccountRentInSol = 0.00171912;

export type AffiliateAccountPropsType = {
    discriminator: string;
    is_initialized: boolean;
    data_version: number;
    data: AffiliateAccountDataType;
    lamports: number;
}

export type AffiliateAccountDataType = {
    affiliate_pubkey: PublicKey,
    project_owner_pubkey: PublicKey,
    candy_machine_id: PublicKey,
}

export default class AffiliateAccount {
    discriminator: string;
    is_initialized: boolean;
    data_version: number;
    data: AffiliateAccountDataType;
    lamports: number;
    project: Project|null;

    static borshAccountSchema = borsh.struct([
        borsh.str('discriminator'),
        borsh.bool('is_initialized'),
        borsh.u8('data_version'),
        borsh.struct([
            borsh.publicKey('affiliate_pubkey'),
            borsh.publicKey('project_owner_pubkey'),
            borsh.publicKey('candy_machine_id'),
        ], 'data')
    ]);

    constructor({discriminator, is_initialized, data_version, data, lamports}: AffiliateAccountPropsType) {
        this.discriminator = discriminator;
        this.is_initialized = is_initialized;
        this.data_version = data_version;
        this.data = data;
        this.lamports = lamports;
        this.project = null;
    }

    setAssociatedProject(project: Project) {
        if (!project.projectData?.project_owner_pubkey.equals(this.data.project_owner_pubkey)
            || !project.projectData?.candy_machine_id.equals(this.data.candy_machine_id)
        ) {
            return;
        }

        this.project = project;
    }

    async getAssociatedProject(connection: Connection): Promise<Project|null> {
        const projectAccount = await getProjectAccount(
            this.data.project_owner_pubkey,
            this.data.candy_machine_id,
            connection
        );

        if (!projectAccount) {
            return null;
        }

        const projectData = await getProjectData(
            this.data.project_owner_pubkey,
            this.data.candy_machine_id
        );

        this.project = new Project(projectAccount, projectData);

        return this.project;
    }

    hasReachedTarget(): boolean {
        if (!this.project) {
            return false;
        }

        return (this.lamports / LAMPORTS_PER_SOL - AffiliateAccountRentInSol) >= this.project.projectAccount.data.redeem_threshold_in_sol;
    }

    targetProgress(): string {
        if (!this.project) {
            return '0';
        }

        return (100 * (this.lamports / LAMPORTS_PER_SOL - AffiliateAccountRentInSol) / this.project.projectAccount.data.redeem_threshold_in_sol).toFixed(2);
    }

    static deserialize(account: AccountInfo<Buffer>): AffiliateAccount | null {
        try {
            const {discriminator, is_initialized, data_version, data} = AffiliateAccount.borshAccountSchema.decode(account.data);

            return new AffiliateAccount({
                discriminator,
                is_initialized,
                data_version,
                data,
                lamports: account.lamports
            });
        } catch (e) {
            console.log(`Deserialization error`, e);

            return null;
        }
    }
}
