import { SmartWeaveError } from 'warp-contracts';
import { ContractResult, DexAction, DexState } from '../types/types';

declare const ContractError;

/**
 * Currently, for the simplicity case we don't tokenize liqidity
 * Therefore, the liquidity could be provided by a single wallet
 * In order to change the liquidity, the provider will need to withdraw all the funds
 * and redeploy them
 */
export const mint = async (
  state: DexState,
  { caller, input: { amountIn0, amountIn1 } }: DexAction
): Promise<ContractResult> => {

    //TODO: Check if there is no liquidity

    //TODO: Record liquidity provider


    //TODO: Throw if the external calls fail
    if (amountIn0 > 0) {
        await SmartWeave.contracts.write(state.token0, {
            function: 'transferFrom',
            from: caller,
            to: SmartWeave.contract.id,
            amount: amountIn0
        });
        state.reserve0 += amountIn0;
    }

    if (amountIn1 > 0) {
        await SmartWeave.contracts.write(state.token1, {
            function: 'transferFrom',
            from: caller,
            to: SmartWeave.contract.id,
            amount: amountIn1
        });
        state.reserve1 += amountIn1;
    }

    return { state };
};

export const burn = async (
    state: DexState,
    { caller, input: { amountIn0, amountIn1 } }: DexAction
  ): Promise<ContractResult> => {

    //TODO: Could be called only by liq provider
  
    await SmartWeave.contracts.write(state.token0, {
        function: 'transfer',
        to: caller,
        amount: state.reserve0
    });
    state.reserve0 = 0;
      
    await SmartWeave.contracts.write(state.token1, {
        function: 'transfer',
         to: caller,
        amount: state.reserve1
    });
    state.reserve1 = 0 ;

  
    return { state };
  };