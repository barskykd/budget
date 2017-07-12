import * as React from "react";
import { connect, Provider } from 'react-redux'
import * as ReactModal from "react-modal";
import * as moment from 'moment';
import * as Decimal from 'decimal.js'

import * as Model from './model'

type MonthlyItemProps = {
    monthly: Model.Monthly
}

function MonthlyItem(props: MonthlyItemProps) {
    return <tr>
        <td>{props.monthly.title}</td>
        <td>{props.monthly.defaultAmount}</td>
        <td>{props.monthly.amount}</td>
        <td><button>Assign default</button></td>
        <td><button>Spent</button></td>
        <td><button>...</button></td>
        <td><button>&times;</button></td>
    </tr>
}

type MonthliesProps = {
    monthlies: Model.Monthly[]
}

function Monthlies (props: MonthliesProps) {
    return <div className="monthilies">
        <div className="header">Montly spendings</div>
        <table>
            <thead>
                <tr>
                    <td>Monthly spending</td>
                    <td>Amount</td>
                    <td>Assigned</td>
                </tr>
            </thead>
            <tbody>
                {props.monthlies.map(x => <MonthlyItem key={x.id} monthly={x}/>)}            
            </tbody>
            <tfoot>
                <tr>
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
            })
    )(Monthlies);