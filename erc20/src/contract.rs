use crate::action::{Action, ActionResult};
use crate::actions::transfers::transfer;
use crate::actions::transfers::transfer_from;
use crate::actions::balance::balance;
use crate::actions::allowances::approve;
use crate::actions::allowances::allowance;
use crate::actions::evolve::evolve;
use crate::contract_utils::js_imports::{Block, Contract, log, SmartWeave, Transaction};
use crate::state::State;

pub async fn handle(current_state: State, action: Action) -> ActionResult {

    //Example of accessing functions imported from js:
    log("log from contract");
    log(&("Transaction::id()".to_owned() + &Transaction::id()));
    log(&("Transaction::owner()".to_owned() + &Transaction::owner()));
    log(&("Transaction::target()".to_owned() + &Transaction::target()));

    log(&("Block::height()".to_owned() + &Block::height().to_string()));
    log(&("Block::indep_hash()".to_owned() + &Block::indep_hash()));
    log(&("Block::timestamp()".to_owned() + &Block::timestamp().to_string()));

    log(&("Contract::id()".to_owned() + &Contract::id()));
    log(&("Contract::owner()".to_owned() + &Contract::owner()));

    log(&("SmartWeave::caller()".to_owned() + &SmartWeave::caller()));

    match action {
        /*
        just couple of questions regarding the standard

        1. are we sure we want to not include `name`, `symbol` and `decimals` method from the standard? (I know they 
        are optional but can be useful, especially decimals - we've already experienced the need of having that one)

        2. what about `tokenSupply` method? it seems obligatory

        3. not really sure but maybe i'm not seeing a bigger picture - how the tokens will be minted?
        */
        Action::Transfer { to, amount } => transfer(current_state, to, amount),
        Action::TransferFrom { from, to, amount } => transfer_from(current_state, from, to, amount),
        Action::Balance { target } => balance(current_state, target),
        Action::Approve { spender, amount } => approve(current_state, spender, amount),
        Action::Allowance { owner, spender } => allowance(current_state, owner, spender),
        Action::Evolve { value } => evolve(current_state, value),
    }
}
