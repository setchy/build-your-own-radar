const config = require('../src/config')

describe('Config Test', () => {
  it('should return all env when no env defined', () => {
    const actual = config()
    expect(actual).toStrictEqual({
      production: { featureToggles: { UIRefresh2022: true, normalizeRingNameHoldToCaution: true } },
      development: { featureToggles: { UIRefresh2022: true, normalizeRingNameHoldToCaution: true } },
    })
  })

  it('should return the given env', () => {
    const oldEnv = process.env
    process.env.ENVIRONMENT = 'development'
    const actual = config()
    expect(actual).toStrictEqual({
      featureToggles: { UIRefresh2022: true, normalizeRingNameHoldToCaution: true },
    })

    process.env = oldEnv
  })
})
