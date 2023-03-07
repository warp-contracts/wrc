export const ContractErrors = {
    RuntimeError: (message: string) => new ContractError(`[RE:RE] ${message}`,),
    CallerBalanceNotEnough: (amount: number) => new ContractError(`[CE:CallerBalanceNotEnough ${amount}]`),
    CallerAllowanceNotEnough: (amount: number) => new ContractError(`[CE:CallerAllowanceNotEnough ${amount}]`),
    AllowanceHasToGtThenZero: () => new ContractError(`[CE:AllowanceHasToGtThenZero]`),
}