import fs from "fs";
import path from "path";

import {
    ArWallet,
    SmartWeave,
    Contract,
    HandlerBasedContract, InteractionResult
} from 'redstone-smartweave';

/**
 * The result from the "balance" view method on the PST Contract.
 */
export interface BalanceResult {
    balance: number;
    ticker: string;
    target: string;
}

/**
 * The result from the "balance" view method on the PST Contract.
 */
export interface AllowanceResult {
    ticker: string;
    owner: string;
    spender: string;
    allowance: number;
}


/**
 * Interface for all contracts the implement the {@link Evolve} feature.
 * Evolve is a feature that allows to change contract's source
 * code, without having to deploy a new contract.
 * See ({@link Evolve})
 */
export interface EvolvingContract {
    /**
     * allows to post new contract source on Arweave
     * @param newContractSource - new contract source...
     */
    saveNewSource(newContractSource: string): Promise<string | null>;
    /**
     * effectively evolves the contract to the source.
     * This requires the {@link saveNewSource} to be called first
     * and its transaction to be confirmed by the network.
     * @param newSrcTxId - result of the {@link saveNewSource} method call.
     */
    evolve(newSrcTxId: string): Promise<string | null>;
}
/**
 * Interface describing state for all Evolve-compatible contracts.
 */
export interface EvolveState {
    settings: any[] | unknown | null;
    /**
     * whether contract is allowed to evolve. seems to default to true..
     */
    canEvolve: boolean;
    /**
     * the transaction id of the Arweave transaction with the updated source code.
     */
    evolve: string;
}
/**
 * Interface describing base state for all PST contracts.
 */
export interface ERC20State extends EvolveState {
    ticker: string;
    owner: string;
    balances: {
        [key: string]: number;
    };
    allowances: {
        [owner: string]: {
            [spender: string]: number;
        }
    }
}
/**
 * Interface describing data required for making a transfer
 */
export interface TransferInput {
    to: string;
    amount: number;
}

/**
 * Interface describing data required for making a transfer with allowance
 */
export interface TransferFromInput {
    from: string;
    to: string;
    amount: number;
}

/**
 * Interface describing data required for making a transfer
 */
export interface ApproveInput {
    spender: string;
    amount: number;
}


/**
 * A type of {@link Contract} designed specifically for the interaction with
 * Profit Sharing Token contract.
 */
export interface ERC20Contract extends Contract<ERC20State>, EvolvingContract {
    /**
     * return the current balance for the given wallet
     * @param target - wallet address
     */
    balanceOf(target: string): Promise<BalanceResult>;

    /**
     * return the current balance for the given wallet
     * @param target - wallet address
     */
    allowance(owner: string, spender: string): Promise<AllowanceResult>;

    /**
     * returns the current contract state
     */
    currentState(): Promise<ERC20State>;
    /**
     * allows to transfer PSTs between wallets
     * @param transfer - data required to perform a transfer, see {@link transfer}
     */
    transfer(transfer: TransferInput): Promise<string | null>;

    /**
     * allows transferring tokens using the allowance mechanism
     * @param transfer - data required to perform a transfer, see {@link transfer}
     */
    transferFrom(transfer: TransferFromInput): Promise<string | null>;

    /**
     * approve tokens to be spent by another account between wallets
     * @param transfer - data required to perform a transfer, see {@link transfer}
     */
    approve(transfer: ApproveInput): Promise<string | null>;
}

export class ERC20ContractImpl extends HandlerBasedContract<ERC20State> implements ERC20Contract {
    async balanceOf(target: string): Promise<BalanceResult> {
        const interactionResult = await this.viewState({ function: "balance", target });

        if (interactionResult.type !== "ok") {
            throw Error(interactionResult.errorMessage);
        }

        return interactionResult.result as BalanceResult;
    }

    async allowance(owner: string, spender: string): Promise<AllowanceResult> {
        const interactionResult = await this.viewState({ function: "allowance", owner, spender });

        if (interactionResult.type !== "ok") {
            throw Error(interactionResult.errorMessage);
        }

        return interactionResult.result as AllowanceResult;
    }

    async currentState() {
        return (await super.readState()).state;
    }

    async evolve(newSrcTxId: string): Promise<string | null> {
        return Promise.resolve(undefined);
    }

    saveNewSource(newContractSource: string): Promise<string | null> {
        return Promise.resolve(undefined);
    }

    async transfer(transfer: TransferInput): Promise<string | null> {
        return await this.writeInteraction({ function: "transfer", ...transfer},
            undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
    }

    async transferFrom(transfer: TransferFromInput): Promise<string | null> {
        return await this.writeInteraction({ function: "transferFrom", ...transfer},
        undefined, undefined, true // Strict mode to try dry-run first and report errors
        );
    }

    async approve(approve: ApproveInput): Promise<string | null> {
        return await this.writeInteraction({ function: "approve", ...approve});
    }
}

export async function deployERC20(
    smartweave: SmartWeave,
    initialState: ERC20State,
    ownerWallet: ArWallet
): Promise<[ERC20State, string]> {

    // deploying contract using the new SDK.
    return smartweave.createContract
        .deploy({
            wallet: ownerWallet,
            initState: JSON.stringify(initialState),
            src: fs.readFileSync(path.join(__dirname, "../pkg/erc20-contract_bg.wasm")),
            wasmSrcCodeDir: path.join(__dirname, "../src"),
            wasmGlueCode: path.join(__dirname, "../pkg/erc20-contract.js"),
        })
        .then((txId) => [initialState, txId]);
}

export async function connectERC20(
    smartweave: SmartWeave,
    contractTxId: string,
    wallet: ArWallet
): Promise<ERC20Contract> {
    let contract = new ERC20ContractImpl(
        contractTxId,
        smartweave
    ).setEvaluationOptions({
        internalWrites: true,
    }) as ERC20Contract;

    return contract.connect(wallet) as ERC20Contract;
}