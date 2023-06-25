import { KLAY } from './klay'

describe('JEWEL', () => {
    it('static constructor uses cache', () => {
        expect(KLAY.onChain(8217) === KLAY.onChain(8217)).toEqual(true)
    })
})