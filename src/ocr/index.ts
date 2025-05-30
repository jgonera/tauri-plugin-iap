import * as mockOCR from "@/ocr/mock"
import * as remoteOCR from "@/ocr/remote"

const { performOCR, warmUpOCR } = import.meta.env.DEV ? mockOCR : remoteOCR

export { performOCR, warmUpOCR }
