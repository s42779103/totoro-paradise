import type MornSignPaperResponse from '~~/src/types/responseTypes/MornSignPaperResponse'

const useMornSignPaper = () => useState<MornSignPaperResponse | null>('mornSignPaper')

export default useMornSignPaper
