const { constructSheetUrl, getDocumentOrSheetId, getSheetName } = require('../../src/util/urlUtils')
const queryParams = require('../../src/util/queryParamProcessor')

jest.mock('../../src/util/queryParamProcessor')

function setWindowLocation(url) {
  window.history.replaceState(null, '', url)
}

describe('Url Utils', () => {
  it('should construct the sheet url', () => {
    queryParams.mockReturnValue({ documentId: 'documentId' })
    setWindowLocation('https://thoughtworks.com/radar?sheet=radar')
    const sheetUrl = constructSheetUrl('radar')

    expect(sheetUrl).toStrictEqual('https://thoughtworks.com/radar?documentId=documentId&sheetName=radar')
    expect(queryParams).toHaveBeenCalledTimes(1)
  })

  it('should construct the sheet url if sheetId is used', () => {
    queryParams.mockReturnValue({ sheetId: 'sheetId' })
    setWindowLocation('https://thoughtworks.com/radar?sheet=radar')
    const sheetUrl = constructSheetUrl('radar')

    expect(sheetUrl).toStrictEqual('https://thoughtworks.com/radar?sheetId=sheetId&sheetName=radar')
    expect(queryParams).toHaveBeenCalledTimes(1)
  })

  it('should prioritize documentId before legacy sheetId', () => {
    queryParams.mockReturnValue({ documentId: 'documentId', sheetId: 'sheetId' })
    setWindowLocation('https://thoughtworks.com/radar?documentId=documentId&sheetId=sheetId')

    const id = getDocumentOrSheetId()

    expect(id).toEqual('documentId')
  })

  it('supports documentId', () => {
    queryParams.mockReturnValue({ documentId: 'documentId' })
    setWindowLocation('https://thoughtworks.com/radar?documentId=documentId')

    const id = getDocumentOrSheetId()

    expect(id).toEqual('documentId')
  })

  it('supports sheetId', () => {
    queryParams.mockReturnValue({ sheetId: 'sheetId' })
    setWindowLocation('https://thoughtworks.com/radar?sheetId=sheetId')

    const id = getDocumentOrSheetId()

    expect(id).toEqual('sheetId')
  })

  it('supports sheetName', () => {
    queryParams.mockReturnValue({ sheetName: 'sheetName' })
    setWindowLocation('https://thoughtworks.com/radar?sheetName=sheetName')

    const sheetName = getSheetName()

    expect(sheetName).toEqual('sheetName')
  })
})
