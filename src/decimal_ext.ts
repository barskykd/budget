import * as Decimal from 'decimal.js'

export function isValidDecimal(v: number|string|decimal.Decimal) {
    try {
        new Decimal(v);
        return true;
    } catch (e) {
        if ( e instanceof Error && /DecimalError/.test(e.message) ) {
            return false;
        }
    }
}