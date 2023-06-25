import { Token, Price, CurrencyAmount } from '@uniswap/sdk-core'
import { InsufficientInputAmountError } from '../errors'
import { computePairAddress, Pair } from './pair'
import { WJEWEL } from './wjewel'
import { INIT_CODE_HASH, FACTORY_ADDRESS } from '../constants'

const CHAIN_ID = 53935

describe('computePairAddress', () => {
  it('should correctly compute the pool address', () => {
    const tokenA = new Token(
      CHAIN_ID,
      '0xB57B60DeBDB0b8172bb6316a9164bd3C695F133a',
      18,
      'AVAX',
      'Avalanche'
    )
    const tokenB = new Token(
      CHAIN_ID,
      '0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260',
      18,
      'WJEWEL',
      'Wrapped JEWEL'
    )

    const result = computePairAddress({
      tokenA,
      tokenB,
      factoryAddress: FACTORY_ADDRESS,
      initHashCode: INIT_CODE_HASH
    })

    expect(result).toEqual('0xF3EabeD6Bd905e0FcD68FC3dBCd6e3A4aEE55E98')
  })

  it('should give same result regardless of token order', () => {
    const USDC = new Token(CHAIN_ID, '0x3AD9DFE640E1A9Cc1D9B0948620820D975c3803a', 18, 'USDC', 'USD Coin')
    const CRYSTAL = new Token(CHAIN_ID, '0x04b9dA42306B023f3572e106B11D82aAd9D32EBb', 18, 'CRYSTAL', 'Crystals')

    let tokenA = USDC
    let tokenB = CRYSTAL
    const resultA = computePairAddress({
      tokenA,
      tokenB,
      factoryAddress: FACTORY_ADDRESS,
      initHashCode: INIT_CODE_HASH
    })

    tokenA = CRYSTAL
    tokenB = USDC
    const resultB = computePairAddress({
      tokenA,
      tokenB,
      factoryAddress: FACTORY_ADDRESS,
      initHashCode: INIT_CODE_HASH
    })

    expect(resultA).toEqual(resultB)
  })
})

describe('Pair', () => {
  const USDC = new Token(CHAIN_ID, '0x3AD9DFE640E1A9Cc1D9B0948620820D975c3803a', 18, 'USDC', 'USD Coin')
  const CRYSTAL = new Token(CHAIN_ID, '0x04b9dA42306B023f3572e106B11D82aAd9D32EBb', 18, 'CRYSTAL', 'Crystals')

  describe('#getAddress', () => {
    it('returns the correct address', () => {
      expect(Pair.getAddress(USDC, CRYSTAL)).toEqual('0x04Dec678825b8DfD2D0d9bD83B538bE3fbDA2926')
    })
  })

  describe('#token0', () => {
    it('always is the token that sorts before', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '100')).token0
      ).toEqual(CRYSTAL)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '100'), CurrencyAmount.fromRawAmount(USDC, '100')).token0
      ).toEqual(CRYSTAL)
    })
  })

  describe('#token1', () => {
    it('always is the token that sorts after', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '100')).token1
      ).toEqual(USDC)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '100'), CurrencyAmount.fromRawAmount(USDC, '100')).token1
      ).toEqual(USDC)
    })
  })
  describe('#reserve0', () => {
    it('always comes from the token that sorts before', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '101')).reserve0
      ).toEqual(CurrencyAmount.fromRawAmount(CRYSTAL, '101'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '101'), CurrencyAmount.fromRawAmount(USDC, '100')).reserve0
      ).toEqual(CurrencyAmount.fromRawAmount(CRYSTAL, '101'))
    })
  })
  describe('#reserve1', () => {
    it('always comes from the token that sorts after', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '101')).reserve1
      ).toEqual(CurrencyAmount.fromRawAmount(USDC, '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '101'), CurrencyAmount.fromRawAmount(USDC, '100')).reserve1
      ).toEqual(CurrencyAmount.fromRawAmount(USDC, '100'))
    })
  })

  describe('#token0Price', () => {
    it('returns price of token0 in terms of token1', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '101'), CurrencyAmount.fromRawAmount(CRYSTAL, '100')).token0Price
      ).toEqual(new Price(CRYSTAL, USDC, '100', '101'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '100'), CurrencyAmount.fromRawAmount(USDC, '101')).token0Price
      ).toEqual(new Price(CRYSTAL, USDC, '100', '101'))
    })
  })

  describe('#token1Price', () => {
    it('returns price of token1 in terms of token0', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '101'), CurrencyAmount.fromRawAmount(CRYSTAL, '100')).token1Price
      ).toEqual(new Price(USDC, CRYSTAL, '101', '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '100'), CurrencyAmount.fromRawAmount(USDC, '101')).token1Price
      ).toEqual(new Price(USDC, CRYSTAL, '101', '100'))
    })
  })

  describe('#priceOf', () => {
    const pair = new Pair(CurrencyAmount.fromRawAmount(USDC, '101'), CurrencyAmount.fromRawAmount(CRYSTAL, '100'))
    it('returns price of token in terms of other token', () => {
      expect(pair.priceOf(CRYSTAL)).toEqual(pair.token0Price)
      expect(pair.priceOf(USDC)).toEqual(pair.token1Price)
    })

    it('throws if invalid token', () => {
      expect(() => pair.priceOf(WJEWEL[CHAIN_ID])).toThrow('TOKEN')
    })
  })

  describe('#reserveOf', () => {
    it('returns reserves of the given token', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '101')).reserveOf(USDC)
      ).toEqual(CurrencyAmount.fromRawAmount(USDC, '100'))
      expect(
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '101'), CurrencyAmount.fromRawAmount(USDC, '100')).reserveOf(USDC)
      ).toEqual(CurrencyAmount.fromRawAmount(USDC, '100'))
    })

    it('throws if not in the pair', () => {
      expect(() =>
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '101'), CurrencyAmount.fromRawAmount(USDC, '100')).reserveOf(
          WJEWEL[CHAIN_ID]
        )
      ).toThrow('TOKEN')
    })
  })

  describe('#chainId', () => {
    it('returns the token0 chainId', () => {
      expect(
        new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '100')).chainId
      ).toEqual(CHAIN_ID)
      expect(
        new Pair(CurrencyAmount.fromRawAmount(CRYSTAL, '100'), CurrencyAmount.fromRawAmount(USDC, '100')).chainId
      ).toEqual(CHAIN_ID)
    })
  })
  describe('#involvesToken', () => {
    expect(
      new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '100')).involvesToken(USDC)
    ).toEqual(true)
    expect(
      new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '100')).involvesToken(CRYSTAL)
    ).toEqual(true)
    expect(
      new Pair(CurrencyAmount.fromRawAmount(USDC, '100'), CurrencyAmount.fromRawAmount(CRYSTAL, '100')).involvesToken(
        WJEWEL[CHAIN_ID]
      )
    ).toEqual(false)
  })
  describe('miscellaneous', () => {
    it('getLiquidityMinted:0', async () => {
      const tokenA = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '0'), CurrencyAmount.fromRawAmount(tokenB, '0'))

      expect(() => {
        pair.getLiquidityMinted(
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
          CurrencyAmount.fromRawAmount(tokenA, '1000'),
          CurrencyAmount.fromRawAmount(tokenB, '1000')
        )
      }).toThrow(InsufficientInputAmountError)

      expect(() => {
        pair.getLiquidityMinted(
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
          CurrencyAmount.fromRawAmount(tokenA, '1000000'),
          CurrencyAmount.fromRawAmount(tokenB, '1')
        )
      }).toThrow(InsufficientInputAmountError)

      const liquidity = pair.getLiquidityMinted(
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '0'),
        CurrencyAmount.fromRawAmount(tokenA, '1001'),
        CurrencyAmount.fromRawAmount(tokenB, '1001')
      )

      expect(liquidity.quotient.toString()).toEqual('1')
    })

    it('getLiquidityMinted:!0', async () => {
      const tokenA = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(
        CurrencyAmount.fromRawAmount(tokenA, '10000'),
        CurrencyAmount.fromRawAmount(tokenB, '10000')
      )

      expect(
        pair
          .getLiquidityMinted(
            CurrencyAmount.fromRawAmount(pair.liquidityToken, '10000'),
            CurrencyAmount.fromRawAmount(tokenA, '2000'),
            CurrencyAmount.fromRawAmount(tokenB, '2000')
          )
          .quotient.toString()
      ).toEqual('2000')
    })

    it('getLiquidityValue:!feeOn', async () => {
      const tokenA = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '1000'), CurrencyAmount.fromRawAmount(tokenB, '1000'))

      {
        const liquidityValue = pair.getLiquidityValue(
          tokenA,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          false
        )
        expect(liquidityValue.currency.equals(tokenA)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('1000')
      }

      // 500
      {
        const liquidityValue = pair.getLiquidityValue(
          tokenA,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
          false
        )
        expect(liquidityValue.currency.equals(tokenA)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('500')
      }

      // tokenB
      {
        const liquidityValue = pair.getLiquidityValue(
          tokenB,
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          CurrencyAmount.fromRawAmount(pair.liquidityToken, '1000'),
          false
        )
        expect(liquidityValue.currency.equals(tokenB)).toBe(true)
        expect(liquidityValue.quotient.toString()).toBe('1000')
      }
    })

    it('getLiquidityValue:feeOn', async () => {
      const tokenA = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000001', 18)
      const tokenB = new Token(CHAIN_ID, '0x0000000000000000000000000000000000000002', 18)
      const pair = new Pair(CurrencyAmount.fromRawAmount(tokenA, '1000'), CurrencyAmount.fromRawAmount(tokenB, '1000'))

      const liquidityValue = pair.getLiquidityValue(
        tokenA,
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
        CurrencyAmount.fromRawAmount(pair.liquidityToken, '500'),
        true,
        '250000' // 500 ** 2
      )
      expect(liquidityValue.currency.equals(tokenA)).toBe(true)
      expect(liquidityValue.quotient.toString()).toBe('917') // ceiling(1000 - (500 * (1 / 6)))
    })
  })
})
