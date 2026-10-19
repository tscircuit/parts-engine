import ts from "typescript"
import type { DatasheetComponentData } from "./component-data"
import { getDatasheetSchematicSource } from "./schematic-source"

const parse = (source: string) =>
  ts.createSourceFile(
    "component.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

const findChip = (source: ts.SourceFile) => {
  let chip: ts.JsxSelfClosingElement | ts.JsxOpeningElement | undefined
  const visit = (node: ts.Node) => {
    if (chip) return
    if (
      (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) &&
      ["chip", "pushbutton"].includes(node.tagName.getText(source))
    )
      chip = node
    else ts.forEachChild(node, visit)
  }
  visit(source)
  return chip
}

type Edit = { start: number; end: number; text: string }
const editSource = (source: string, edits: Edit[]) =>
  edits
    .sort((a, b) => b.start - a.start)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      source,
    )

const literal = (value: unknown) =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029")

/** Merge current datasheet metadata into its published component, without evaluating it. */
export const getDatasheetComponentTsx = (
  datasheet: DatasheetComponentData,
): string | null => {
  const preview = getDatasheetSchematicSource(datasheet)
  let source = datasheet.generated_tsx?.trim() || preview
  if (
    !source &&
    !datasheet.footprinter_string?.trim() &&
    !datasheet.pin_attributes &&
    !datasheet.internally_connected_pins
  )
    return null
  const builtin =
    !datasheet.symbol_tsx?.trim() &&
    Boolean(datasheet.builtin_symbol_name?.trim())
  if (!source || (!datasheet.generated_tsx?.trim() && builtin))
    source = 'export default () => <chip name="U1" />'
  const file = parse(source)
  const chip = findChip(file)
  if (!chip) return source
  const updates = new Map<string, string>()
  const existing = new Map(
    chip.attributes.properties
      .filter(ts.isJsxAttribute)
      .map((attr) => [attr.name.getText(file), attr]),
  )
  if (datasheet.internally_connected_pins !== undefined) {
    updates.set(
      "internallyConnectedPins",
      `internallyConnectedPins={${literal(datasheet.internally_connected_pins ?? [])}}`,
    )
  }
  if (datasheet.supplier_part_numbers !== undefined) {
    updates.set(
      "supplierPartNumbers",
      `supplierPartNumbers={${literal(datasheet.supplier_part_numbers ?? {})}}`,
    )
  }
  if (preview && !builtin) {
    const previewFile = parse(preview)
    const previewChip = findChip(previewFile)
    for (const attr of previewChip?.attributes.properties ?? []) {
      if (!ts.isJsxAttribute(attr)) continue
      const name = attr.name.getText(previewFile)
      if (
        ["symbol", "schPinArrangement", "schWidth", "schHeight"].includes(
          name,
        ) ||
        (name === "pinLabels" && !existing.has(name))
      )
        updates.set(name, attr.getText(previewFile))
    }
  }
  if (datasheet.footprinter_string?.trim())
    updates.set(
      "footprint",
      `footprint={${literal(datasheet.footprinter_string)}}`,
    )
  if (datasheet.pin_attributes) {
    const namedPins = new Set(
      (datasheet.pin_information ?? [])
        .map((pin) => pin.pin_number)
        .filter((pin) => !/^\d+$/.test(pin)),
    )
    const attributes = Object.fromEntries(
      Object.entries(datasheet.pin_attributes).map(([name, value]) => [
        name.startsWith("pin") && namedPins.has(name.slice(3))
          ? name.slice(3)
          : name,
        value,
      ]),
    )
    updates.set("pinAttributes", `pinAttributes={${literal(attributes)}}`)
  }
  if (builtin)
    updates.set("noSchematicRepresentation", "noSchematicRepresentation")

  const edits: Edit[] = []
  const inactive = builtin
    ? ["symbol", "schPinArrangement", "schWidth", "schHeight"]
    : datasheet.symbol_tsx?.trim()
      ? ["schPinArrangement", "noSchematicRepresentation"]
      : datasheet.sch_pin_arrangement
        ? ["symbol", "noSchematicRepresentation"]
        : []
  for (const name of inactive) {
    const previous = existing.get(name)
    if (previous)
      edits.push({
        start: previous.getStart(file),
        end: previous.end,
        text: "",
      })
  }
  const additions: string[] = []
  for (const [name, text] of updates) {
    const previous = existing.get(name)
    if (previous)
      edits.push({ start: previous.getStart(file), end: previous.end, text })
    else additions.push(text)
  }
  if (additions.length) {
    // Keep the component's final props spread last so callers can override defaults.
    const position =
      chip.attributes.properties
        .find(ts.isJsxSpreadAttribute)
        ?.getStart(file) ?? chip.attributes.end
    edits.push({
      start: position,
      end: position,
      text: `\n    ${additions.join("\n    ")}\n    `,
    })
  }
  source = editSource(source, edits)
  if (builtin && preview) {
    const updated = parse(source)
    const updatedChip = findChip(updated)!
    const element = ts.isJsxOpeningElement(updatedChip)
      ? updatedChip.parent
      : updatedChip
    const symbolFile = parse(preview)
    let symbol: ts.JsxSelfClosingElement | undefined
    const visit = (node: ts.Node) => {
      if (
        ts.isJsxSelfClosingElement(node) &&
        node.tagName.getText(symbolFile) === "schematicsymbol"
      )
        symbol = node
      ts.forEachChild(node, visit)
    }
    visit(symbolFile)
    if (symbol)
      source = editSource(source, [
        {
          start: element.getStart(updated),
          end: element.end,
          text: `<group subcircuit>\n${element.getText(updated)}\n${symbol.getText(symbolFile).replace('name="U1"', 'name="A"')}\n</group>`,
        },
      ])
  }
  return source
}

export { getDatasheetSchematicSource } from "./schematic-source"
export type { DatasheetComponentData } from "./component-data"
