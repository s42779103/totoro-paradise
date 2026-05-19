import type FreeRunPaperResponse from '~~/src/types/responseTypes/FreeRunPaperResponse'

const useFreeRunPaper = () => useState<FreeRunPaperResponse | null>('freeRunPaper')

export default useFreeRunPaper
