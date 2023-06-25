import invariant from 'tiny-invariant'
import { Currency, NativeCurrency, Token } from '@uniswap/sdk-core'
import { WJEWEL } from './wjewel'

export class JEWEL extends NativeCurrency {
    protected constructor(chainId: number) {
        super(chainId, 18, 'JEWEL', 'JEWEL')
    }

    public get wrapped(): Token {
        const wjewel = WJEWEL[this.chainId]
        invariant(!!wjewel, 'WRAPPED')
        return wjewel
    }

    private static _jewelCache: { [chainId: number]: JEWEL } = {}

    public static onChain(chainId: number): JEWEL {
        return this._jewelCache[chainId] ?? (this._jewelCache[chainId] = new JEWEL(chainId))
    }

    public equals(other: Currency): boolean {
        return other.isNative && other.chainId === this.chainId
    }
}