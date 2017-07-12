import * as React from "react";
import { connect, Provider } from 'react-redux'
import * as ReactModal from "react-modal";
import * as Decimal from 'decimal.js'

import * as Model from './model';
import * as Actions from './actions';
import InplaceInput from './inplaceinput';
import InlineConfirmation from './InlineConfirmation'
import {isValidDecimal} from './decimal_ext';

type AccountProps = {
    account: Model.Account    
    onChange: (account: Partial<Model.Account>) => void
    onDelete: () => void
}

type AccountState = {    
    isDeleting?: boolean
}

class Account extends React.Component<AccountProps, AccountState>
{
    render() {
        let state = this.state || {};
        const deleteButton = state.isDeleting 
                ? <InlineConfirmation
                        message={"Delete account: " + this.props.account.title + "?"}
                        confirmLabel="Delete"
                        cancelLabel="Cancel"
                        onConfirm={()=>this.props.onDelete()}
                        onCancel={()=>{this.setState({isDeleting: false})}}
                    />                                                      
                : <button onClick={()=> this.setState({isDeleting: true})}>&times;</button>
                                            
        return <tr className="accounts_account">
            <td><InplaceInput 
                    value={this.props.account.title} 
                    onChange={(value:string)=>this.props.onChange({title: value})}
                /></td>
            <td><InplaceInput 
                    value={this.props.account.balance.toString()} 
                    onChange={(value)=>{
                        if (isValidDecimal(value)) {
                            value = new Decimal(value).toFixed(2);
                            this.props.onChange({balance: value});
                        }
                    }}
                /></td>            
            <td className="accounts-table-buttons">{deleteButton}</td>
            </tr>
    }
}

type AccountsProps = {
    accounts: Model.Account[],
    addAccount: (account: Model.AccountData) => void,
    updateAccount: (account: Partial<Model.Account>) => void,
    removeAccount: (accountId: string) => void
}

type AccountsState = {
    editingAccount: Model.Account & {isNew: boolean} | null
}

class Accounts extends React.Component<AccountsProps, AccountsState>
{
    render() {                
        let add_account_button = <button onClick={() => this.addNewAccount()}>+ Account</button>;
        if (!this.props.accounts) {
            return <div>                
                <div>No accounts.</div>
                {add_account_button}
            </div>
        }
        return <div className="accounts">
            <div className="header">Accounts</div>
            <table className="accounts-table">
                <thead><tr>
                    <td className="accounts-table-account">Account</td>
                    <td className="accounts-table-balance">Balance</td>
                    <td className="accounts-table-buttons"></td></tr></thead>
                <tbody>
                {this.props.accounts.map(x => <Account key={x.id} account={x} onChange={(account)=>{
                        this.props.updateAccount({...account, id:x.id});
                    }}
                    onDelete = {()=>{
                        this.props.removeAccount(x.id);
                    }}
                    />)}
                </tbody>            
                <tfoot>
                    <tr className="accounts-table-total">
                        <td>Total</td>
                        <td>{this.props.accounts.reduce((pv,cv)=>pv.plus(cv.balance), new Decimal(0)).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>        
            {add_account_button}
        </div>
    }

    addNewAccount() {
        this.props.addAccount({
                title: "Account",
                balance: 0
        });
    }
}


export default connect(
    (state: Model.State) => ({
        accounts: state.accounts
    }),    
    (dispatch: (action:Actions.Action) => void) => ({
        addAccount(account: Model.AccountData) {
            dispatch({type: 'ADD_ACCOUNT', account});
        },
        updateAccount(account: Model.Account) {
            dispatch({type: 'UPDATE_ACCOUNT', account});
        },
        removeAccount(account_id: string) {
            dispatch({type: 'REMOVE_ACCOUNT', account_id})
        }
    })    
) (Accounts);