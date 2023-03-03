import { ContractError, SmartWeaveGlobal } from "warp-contracts";

declare global {
    var SmartWeave: SmartWeaveGlobal;
    var ContractError: typeof ContractError;
}