import { commonComponentProps } from "@tscircuit/props"
import { z } from "zod"

export const storedDatasheetResponseSchema = z.object({
  datasheet: z.object({
    datasheet_id: z.string().uuid(),
    chip_name: z.string(),
    datasheet_pdf_urls: z.array(z.string()).nullish(),
    pin_information: z
      .array(
        z.object({
          pin_number: z.string(),
          name: z.array(z.string()),
          description: z.string(),
          capabilities: z.array(z.string()),
        }),
      )
      .nullish(),
    pin_attributes: commonComponentProps.shape.pinAttributes.nullable(),
    footprinter_string: z.string().nullish(),
    generated_tsx: z.string().nullish(),
  }),
})
