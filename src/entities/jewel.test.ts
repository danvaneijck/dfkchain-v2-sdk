import { JEWEL } from './jewel'

describe('JEWEL', () => {
    it('static constructor uses cache', () => {
        expect(JEWEL.onChain(53935) === JEWEL.onChain(53935)).toEqual(true)
    })
})