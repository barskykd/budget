import * as React from "react";
import { connect, Provider } from 'react-redux'
import * as ReactModal from "react-modal";
import * as moment from 'moment';
import * as Decimal from 'decimal.js'

import InplaceInput from './inplaceinput'
import {MoneyInput} from './inplaceinput'

import * as Model from './model'
import * as Actions from './actions';

type MonthlyItemProps = {
    monthly: Model.Monthly,
    onChange: (m: Partial<Model.Monthly>) => void,
    onDelete: () => void
}

function MonthlyItem(props: MonthlyItemProps) {
    return <tr>
        <td>
            <InplaceInput value={props.monthly.title} onChange={v => props.onChange({title: v})}/>            
        </td>
        <td>
            <MoneyInput value={props.monthly.defaultAmount} onChange={v => props.onChange({defaultAmount: v})}/> 
        </td>
        <td>
            <MoneyInput value={props.monthly.amount} onChange={v => props.onChange({amount: v})}/> 
        </td>
        <td><button>Assign default</button></td>
        <td><button>Spent</button></td>        
        <td><button>&times;</button></td>
    </tr>
}

type MonthliesProps = {
    monthlies: Model.Monthly[],
    addMonthly: (m: Model.Monthly) => void,
    updateMonthly: (m: Partial<Model.Monthly>) => void,
    removeMonthly: (m_id: string) => void
}

function Monthlies (props: MonthliesProps) {
    return <div className="monthlies">
        <div className="header">Montly spendings</div>
        <table className="monthlies-table">
            <colgroup>
                <col className="monthlies-table-name"/>
                <col className="monthlies-table-amount"/>
                <col className="monthlies-table-assigned"/>
                <col className="monthlies-table-assign-default-button"/>
                <col className="monthlies-table-spend-button"/>            
                <col className="monthlies-table-delete-button"/>
            </colgroup>
            <thead>
                <tr>
                    <td>Monthly spending</td>
                    <td>Amount</td>
                    <td>Assigned</td>
                </tr>
            </thead>
            <tbody>
                {props.monthlies.map(x => <MonthlyItem key={x.id} monthly={x}
                            onChange={m => props.updateMonthly({...m, id: x.id})} 
                            onDelete={() => props.removeMonthly(x.id)}/>)}
            </tbody>
            <tfoot>
                <tr className="monthlies-table-total">
                    <td>Total</td>
                    <td>{props.monthlies.reduce((pv, cv)=>pv.plus(cv.defaultAmount), new Decimal(0)).toFixed(2)}</td>
                    <td>{props.monthlies.reduce((pv, cv)=>pv.plus(cv.amount), new Decimal(0)).toFixed(2)}</td></tr>
            </tfoot>
        </table>
        <button>+ Monthly spending</button>
    </div>
}

export default connect(
            (state: Model.State)=> ({
                monthlies: state.monthlies
            }),
            (dispatch: (action:Actions.Action) => void) => ({
                addMonthly(monthly: Model.Monthly) {
                    dispatch({type: 'ADD_MONTHLY', monthly});
                },
                updateMonthly(monthly: Partial<Model.Monthly>) {
                    dispatch({type: 'UPDATE_MONTHLY', monthly});
                },
                removeMonthly(monthly_id: string) {
                    dispatch({type: 'REMOVE_MONTHLY', monthly_id})
                }
            })
    )(Monthlies);