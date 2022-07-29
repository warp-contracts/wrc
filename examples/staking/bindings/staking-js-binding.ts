import fs from 'fs';
import path from 'path';

import {
  ArWallet,
  Contract,
  ContractDeploy,
  HandlerBasedContract,
  Warp,
  WriteInteractionResponse,
} from 'warp-contracts';

/**
 * The result from the "balance" view method on the PST Contract.
 */
export interface StakeResult {
  stake: number;
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
export interface StakingState extends EvolveState {
  owner: string;
  token: string;
  stakes: {
    [key: string]: number;
  };
}

/**
 * A type of {@link Contract} designed specifically for the interaction with
 * Profit Sharing Token contract.
 */
export interface StakingContract extends Contract<StakingState> {
  /**
   * return the current balance for the given wallet
   * @param target - wallet address
   */
  stakeOf(target: string): Promise<StakeResult>;

  /**
   * returns the current contract state
   */
  currentState(): Promise<StakingState>;

  /**
   * stake ERC0 tokens
   * @param amount - amount of tokens to stake
   */
  stake(amount: number): Promise<WriteInteractionResponse | null>;

  /**
   * stake all the ERC0 tokens owned
   * @param amount - amount of tokens to stake
   */
  stakeAll(): Promise<WriteInteractionResponse | null>;

  /**
   * Returns staked tokens and stake all tokens owned
   * @param amount - amount of tokens to stake
   */
  reStake(): Promise<WriteInteractionResponse | null>;

  /**
   * withdraws ERC20 tokens
   * @param transfer - amount of tokens to withdraw
   */
  withdraw(amount: number): Promise<WriteInteractionResponse | null>;
}

export class StakingContractImpl extends HandlerBasedContract<StakingState> implements StakingContract {
  async stakeOf(target: string): Promise<StakeResult> {
    const interactionResult = await this.viewState({ function: 'stakeOf', target });

    if (interactionResult.type !== 'ok') {
      throw Error(interactionResult.errorMessage);
    }

    return interactionResult.result as StakeResult;
  }

  async stake(amount: number): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction(
      { function: 'stake', amount },
      { strict: true } // Strict mode to try dry-run first and report errors
    );
  }

  async stakeAll(): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction(
      { function: 'stakeAll' },
      { strict: true } // Strict mode to try dry-run first and report errors
    );
  }

  async reStake(): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction(
      { function: 'reStake' },
      { strict: true } // Strict mode to try dry-run first and report errors
    );
  }

  async withdraw(amount: number): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction(
      { function: 'withdraw', amount },
      { strict: true } // Strict mode to try dry-run first and report errors
    );
  }

  async currentState() {
    console.log('Getting current state from staking');
    return (await super.readState()).state;
  }

  saveNewSource(newContractSource: string): Promise<string | null> {
    return Promise.resolve(undefined);
  }
}

export async function deployStaking(
  warp: Warp,
  initialState: StakingState,
  ownerWallet: ArWallet
): Promise<[StakingState, ContractDeploy]> {
  // deploying contract using the new SDK.
  return warp.createContract
    .deploy({
      wallet: ownerWallet,
      initState: JSON.stringify(initialState),
      src: fs.readFileSync(path.join(__dirname, '../pkg/staking-contract_bg.wasm')),
      wasmSrcCodeDir: path.join(__dirname, '../src'),
      wasmGlueCode: path.join(__dirname, '../pkg/staking-contract.js'),
    })
    .then((txId) => [initialState, txId]);
}

export async function connectStaking(warp: Warp, contractTxId: string, wallet: ArWallet): Promise<StakingContract> {
  let contract = new StakingContractImpl(contractTxId, warp).setEvaluationOptions({
    internalWrites: true,
  }) as StakingContract;

  return contract.connect(wallet) as StakingContract;
}

const contractSrc = fs.readFileSync(path.join(__dirname, '../pkg/staking-contract_bg.wasm'));
const wasmSrcCodeDir = path.join(__dirname, '../src');
const wasmGlueCode = path.join(__dirname, '../pkg/staking-contract.js');
export { contractSrc, wasmSrcCodeDir, wasmGlueCode };
