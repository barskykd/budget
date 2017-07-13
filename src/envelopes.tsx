import * as React from "react";
import { connect, Provider } from 'react-redux'
import * as ReactModal from "react-modal";
import * as moment from 'moment';
import * as Decimal from 'decimal.js'
import InplaceInput from './inplaceinput'
import {MoneyInput} from './inplaceinput'
import InlineConfirmation from './InlineConfirmation'
import * as Model from './model';
import * as Actions from './actions';

function dateToDateCode(d: Date) {
    return d.toISOString().split('T')[0];
}

function getCurrentMonthEnvelopeDates() {
    const currentMonth = moment().month();
    const start = moment().date(1).day(1);
    let result = []
    for (let d = start; d.month() <= currentMonth; d.add(7, 'days')) {
        result.push(d.format('YYYY-MM-DD'))
    }
    return result;
}

type EnvelopeItemProps = {
    envelope: Envelope,    
    onChange: (envelope: Partial<Envelope>) => void,
    onDelete: () => void
}

class EnvelopeItem extends React.Component<EnvelopeItemProps, {}> {
    render() {
        const envDate = moment(this.props.envelope.date)
        const startOfWeek = moment().startOf('week');
        const endOfWeek = moment().endOf('week');
        let daysLeft;
        if (envDate.isBefore(startOfWeek, 'days')) {
            daysLeft = 0;
        } else if (envDate.isAfter(endOfWeek, 'days')) {
            daysLeft = 7;
        } else {
            daysLeft = 8 - moment().diff(startOfWeek, 'days')
        }    
        let amountValue = this.props.envelope.amount;
       
        let displayAmount = (daysLeft && this.props.envelope.amount) 
                    ? new Decimal(this.props.envelope.amount).div(daysLeft).toFixed(2) 
                    : '--';
        let deleteButton = null;
        if (this.props.envelope.deletable) {
            deleteButton = <button onClick={() => this.props.onDelete()}>&times;</button>;
        }
        return <tr>
            <td>{moment(this.props.envelope.date).format('D MMMM')}</td>        
            <td><MoneyInput value={amountValue} onChange={v => this.onChangeValue(v)}/></td>
            <td>{displayAmount}</td>            
            <td>{deleteButton}</td>
        </tr>
    }    

    onChangeValue(amount:string) {        
        this.props.onChange({amount});
    }
}


type Envelope = Model.Envelope & {deletable: boolean}

type EnvelopeListProps = {
    envelopes: Model.Envelope[],
    updateEnvelope: (envelope: Partial<Model.Envelope>) => void,
    removeEnvelope: (date: string) => void
}

type EnvByDate = {
    [key: string]: Model.Envelope
};

class EnvelopeList extends React.Component<EnvelopeListProps, {}>{
    render() {
        const current_envelopes = getCurrentMonthEnvelopeDates();        
        const env_by_date: EnvByDate = this.props.envelopes.reduce((pv: EnvByDate, cv) => {
            pv[cv.date] = cv;
            return pv;
        }, {})        

        const env_before: Envelope[] = this.props.envelopes.filter(x => x.date < current_envelopes[0]).map(x=>({...x, deletable: true}));
        const env_current: Envelope[] = current_envelopes.map(x => ({...env_by_date[x] || {date:x, amount: '0.00'}, deletable: false}));
        const env_after: Envelope[] = this.props.envelopes.filter(x => x.date > current_envelopes[current_envelopes.length - 1]).map(x=> ({...x, deletable: true}));
        const envelopes: Envelope[] = env_before.concat(env_current).concat(env_after);

        return <div className="envelopes">
                <div className="header">Weekly budgets</div>
                <table className="envelopes-table">
                    <colgroup>
                        <col className="envelopes-table-date"/>
                        <col className="envelopes-table-amount"/>
                        <col className="envelopes-table-daily"/>
                        <col className="envelopes-table-buttons"/>
                    </colgroup>
                    <thead>
                        <tr>
                            <td>Week</td>
                            <td>Assigned</td>
                            <td>Daily</td>
                            <td></td>                            
                        </tr>
                    </thead>
                    <tbody>
                        {envelopes.map(x => 
                            <EnvelopeItem key={x.date} 
                                envelope={x} 
                                onChange={e => this.onEnvelopeChange({...e, date: x.date})}
                                onDelete={() => this.onEnvelopeDelete(x.date)}/>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="envelopes-table-total">
                            <td>Total</td>
                            <td>{this.props.envelopes.reduce((pv, cv)=>pv.plus(cv.amount), new Decimal(0)).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
    }

    onEnvelopeChange(envelope: Partial<Envelope>) {
        this.props.updateEnvelope(envelope);        
    }

    onEnvelopeDelete(d: string) {
        this.props.removeEnvelope(d);
    }
}

export default connect((state: Model.State) => ({
    envelopes: state.envelopes
}), (dispatch: (action:Actions.Action) => void) => ({        
        updateEnvelope(envelope: Partial<Model.Envelope>) {
            dispatch({type: 'UPDATE_ENVELOPE', envelope});
        },
        removeEnvelope(date: string) {
            dispatch({type: 'REMOVE_ENVELOPE', date})
        }
    }))(EnvelopeList)