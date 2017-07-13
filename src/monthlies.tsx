import * as React from "react";
import { connect, Provider } from 'react-redux'
import * as ReactModal from "react-modal";
import * as moment from 'moment';
import * as Decimal from 'decimal.js'
import * as uuid from 'node-uuid';

import InplaceInput from './inplaceinput'
import {MoneyInput} from './inplaceinput'
import ButtonWithConfirmation from './ButtonWithConfirmation'

import * as Model from './model'
import * as Actions from './actions';

type MonthlyItemProps = {
    monthly: Model.Monthly,
    onChange: (m: Partial<Model.Monthly>) => void,
    onDelete: () => void
}

function MonthlyItem(props: MonthlyItemProps) {
    let onSpentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        let checked: boolean = e.target.checked;
        let spentIn = checked ? Model.formatYearMonth(new Date()) : null;
        props.onChange({spentIn})
    }
    return <tr>
        <td>
            <InplaceInput value={props.monthly.title} onChange={v => props.onChange({title: v})}/>            
        </td>        
        <td>
            <MoneyInput value={props.monthly.amount} onChange={v => props.onChange({amount: v})} crossed={Model.isMonthlyPaidInCurrentMonth(props.monthly)}/> 
        </td>        
        <td><input className="monthlies-table-spentbox" type="checkbox" checked={Model.isMonthlyPaidInCurrentMonth(props.monthly)} onChange={onSpentToggle} /></td>        
        <td><ButtonWithConfirmation
            buttonText="&times;"
            confirmMessage={"Delete spending: " + props.monthly.title + "?"}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={() => props.onDelete()}
        /></td>
    </tr>
}

type MonthliesProps = {
    monthlies: Model.Monthly[],
    monthliesTotals: Model.MonthliesTotals,
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
                <col className="monthlies-table-paid"/>
                <col className="monthlies-table-delete-button"/>
            </colgroup>
            <thead>
                <tr>
                    <td>Monthly spending</td>
                    <td>Amount</td>
                    <td>Paid this month</td>
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
                    <td>{props.monthliesTotals.remainingAmount} of {props.monthliesTotals.fullAmount}</td>
                </tr>
            </tfoot>
        </table>
        <button onClick={() => props.addMonthly({
            id: uuid.v4(),
            title: "Unnamed bill",
            amount: '0.0',
            spentIn: null
            })}>+ Monthly spending</button>
    </div>
}

export default connect(
            (state: Model.State)=> ({
                monthlies: state.monthlies,
                monthliesTotals: Model.getMonthliesTotals(state)
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