
import {
  Contract,
  ContractError,
  HandlerBasedContract,
  WriteInteractionOptions,
  WriteInteractionResponse,
} from 'warp-contracts';

/**
 * The result from the "balanceOf" view method on the Atomic Asset Contract.
 */
export interface BalanceResult {
  balance: number;
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
  owner: string;
  spender: string;
  allowance: number;
}

/**
 * The result from the "owner" view method on the Atomic Asset Contract.
 */
export interface OwnerResult {
  owner?: string;
}

/**
 * Interface describing base state for all atomic-asset contracts.
 */
export interface AtomicAssetState {
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
   * return the owner of atomic assets if exists
   */
  owner(): Promise<OwnerResult>;

  /**
   * returns the current contract state
   */
  currentState(): Promise<AtomicAssetState>;
  /**
   * allows to transfer tokens between wallets
   * @param transfer - data required to perform a transfer, see {@link transfer}
   */
  transfer(transfer: TransferInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null>;

  /**
   * allows transferring tokens using the allowance mechanism
   * @param transfer - data required to perform a transfer, see {@link transfer}
   */
  transferFrom(transfer: TransferFromInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null>;

  /**
   * approve tokens to be spent by another account between wallets
   * @param input - data required to perform a approve, see {@link input}
   */
  approve(input: ApproveInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null>;

  /**
   * atomically increase allowance
   * @param input - data required to increase allowance, see {@link input}
   */
  increaseAllowance(input: IncreaseAllowanceInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null>;

  /**
  * atomically decrease allowance
  * @param input - data required to decrease allowance, see {@link input}
  */
  decreaseAllowance(input: DecreaseAllowanceInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null>;
}

export class AtomicAssetContractImpl extends HandlerBasedContract<AtomicAssetState> implements AtomicAssetContract {
  async increaseAllowance(input: IncreaseAllowanceInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse> {
    return await this.writeInteraction({ function: 'increaseAllowance', ...input }, options);
  }

  async decreaseAllowance(input: DecreaseAllowanceInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse> {
    return await this.writeInteraction({ function: 'decreaseAllowance', ...input }, options);
  }

  async balanceOf(target: string): Promise<BalanceResult> {
    const interactionResult = await this.viewState({ function: 'balanceOf', target });
    if (interactionResult.type == 'error') {
      throw new ContractError(interactionResult.error);
    } else if (interactionResult.type == 'exception') {
      throw Error(interactionResult.errorMessage);
    }
    return interactionResult.result as BalanceResult;
  }

  async totalSupply(): Promise<TotalSupplyResult> {
    const interactionResult = await this.viewState({ function: 'totalSupply' });

    if (interactionResult.type == 'error') {
      throw new ContractError(interactionResult.error);
    } else if (interactionResult.type == 'exception') {
      throw Error(interactionResult.errorMessage);
    }
    return interactionResult.result as TotalSupplyResult;
  }

  async allowance(owner: string, spender: string): Promise<AllowanceResult> {
    const interactionResult = await this.viewState({ function: 'allowance', owner, spender });

    if (interactionResult.type == 'error') {
      throw new ContractError(interactionResult.error);
    } else if (interactionResult.type == 'exception') {
      throw Error(interactionResult.errorMessage);
    }
    return interactionResult.result as AllowanceResult;
  }

  async owner(): Promise<OwnerResult> {
    const ownerResult = await this.viewState({ function: 'owner' });

    if (ownerResult.type == 'error') {
      throw new ContractError(ownerResult.error);
    } else if (ownerResult.type == 'exception') {
      throw Error(ownerResult.errorMessage);
    }
    return ownerResult.result as OwnerResult;
  }

  async currentState() {
    return (await super.readState()).cachedValue.state;
  }

  async transfer(transfer: TransferInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction({ function: 'transfer', ...transfer }, options);
  }

  async transferFrom(transfer: TransferFromInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction({ function: 'transferFrom', ...transfer }, options);
  }

  async approve(approve: ApproveInput, options?: WriteInteractionOptions): Promise<WriteInteractionResponse | null> {
    return await this.writeInteraction({ function: 'approve', ...approve }, options);
  }

}