
import {
  Contract,
  HandlerBasedContract,
  WriteInteractionResponse,
} from 'warp-contracts';

/**
 * The result from the "balanceOf" view method on the Atomic Asset Contract.
 */
export interface BalanceResult {
  balance: number;
  ticker: string;
  target: string;
}

/**
 * The result from the "totalSupply" view method on the Atomic Asset Contract.
 */
export interface TotalSupplyResult {
  value: number;
}

/**
 * The result from the "allowance" view method on the Atomic Asset Contract.
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
  /**
   * the owner of this contract who can initiate evolution
   */
  owner: string;
}

/**
 * Interface describing base state for all atomic-asset contracts.
 */
export interface AtomicAssetState extends Partial<EvolveState> {
  name?: string;
  description?: string;
  owner?: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  balances: Record<string, number>;
  allowances: Record<string, Record<string, number>>;
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

export interface ApproveInput {
  spender: string;
  amount: number;
}

export interface IncreaseAllowanceInput {
  spender: string;
  amountToAdd: number;
}

export interface DecreaseAllowanceInput {
  spender: string;
  amountToSubtract: number;
}

/**
 * A type of {@link Contract} designed specifically for the interaction with
 * atomic-asset contract.
 */
export interface AtomicAssetContract extends Contract<AtomicAssetState> {
  /**
   * return the current balance for the given wallet
   * @param target - wallet address
   */
  balanceOf(target: string): Promise<BalanceResult>;

  /**
   * return the total supply of tokens
   */
  totalSupply(): Promise<TotalSupplyResult>;

  /**
   * return the amount which spender is allowed to withdraw from owner.
   * @param owner - wallet address from which spender can withdraw the tokens
   * @param spender - wallet address allowed to withdraw tokens from owner
   */
  allowance(owner: string, spender: string): Promise<AllowanceResult>;

  /**
   * returns the current contract state
   */
  currentState(): Promise<AtomicAssetState>;
  /**
   * allows to transfer tokens between wallets
   * @param transfer - data required to perform a transfer, see {@link transfer}
   */
  transfer(transfer: TransferInput): Promise<WriteInteractionResponse | null>;

  /**
   * allows transferring tokens using the allowance mechanism
   * @param transfer - data required to perform a transfer, see {@link transfer}
   */
  transferFrom(transfer: TransferFromInput): Promise<WriteInteractionResponse | null>;

  /**
   * approve tokens to be spent by another account between wallets
   * @param input - data required to perform a approve, see {@link input}
   */
  approve(input: ApproveInput): Promise<WriteInteractionResponse | null>;

  /**
   * atomically increase allowance
   * @param input - data required to increase allowance, see {@link input}
   */
  increaseAllowance(input: IncreaseAllowanceInput): Promise<WriteInteractionResponse | null>;

  /**
  * atomically decrease allowance
  * @param input - data required to decrease allowance, see {@link input}
  */
  decreaseAllowance(input: DecreaseAllowanceInput): Promise<WriteInteractionResponse | null>;
}

export class AtomicAssetContractImpl extends HandlerBasedContract<AtomicAssetState> implements AtomicAssetContract {

  async increaseAllowance(input: IncreaseAllowanceInput): Promise<WriteInteractionResponse> {
    return await this.writeInteraction({ function: 'increaseAllowance', ...input }, { strict: true });
  }

  async decreaseAllowance(input: DecreaseAllowanceInput): Promise<WriteInteractionResponse> {
    return await this.writeInteraction({ function: 'decreaseAllowance', ...input }, { strict: true });
  }

  async balanceOf(target: string): Promise<BalanceResult> {
    const interactionResult = await this.viewState({ function: 'balanceOf', target });

    if (interactionResult.type !== 'ok') {
      throw Error(interactionResult.errorMessage);
    }

    return interactionResult.result as BalanceResult;
  }

  async totalSupply(): Promise<TotalSupplyResult> {
    const interactionResult = await this.viewState({ function: 'totalSupply' });

    if (interactionResult.type !== 'ok') {
      throw Error(interactionResult.errorMessage);
    }

    return interactionResult.result as TotalSupplyResult;
  }

  async allowance(owner: string, spender: string): Promise<AllowanceResult> {
    const interactionResult = await this.viewState({ function: 'allowance', owner, spender });

    if (interactionResult.type !== 'ok') {
      throw Error(interactionResult.errorMessage);
    }

    return interactionResult.result as AllowanceResult;
  }

  async currentState() {
    return (await super.readState()).cachedValue.state;
  }

  async evolve(newSrcTxId: string): Promise<WriteInteractionResponse | null> {
    throw new Error("Not implemented!")
  }

  saveNewSource(newContractSource: string): Promise<string | null> {
    throw new Error("Not implemented!")
  }

  async transfer(transfer: TransferInput): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction({ function: 'transfer', ...transfer }, { strict: true });
  }

  async transferFrom(transfer: TransferFromInput): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction({ function: 'transferFrom', ...transfer }, { strict: true });
  }

  async approve(approve: ApproveInput): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction({ function: 'approve', ...approve }, { strict: true });
  }
}