# FIS typography system

## Font roles

Unbounded is the primary reading and display family. It is used for hero and page titles, longer headings, paragraphs, descriptions, form values, helper text, validation, legal copy and modal or sheet instructions.

Press Start 2P is the compact retro accent. It is reserved for navigation, kickers, short labels, buttons, status badges, selected table headings and values, and the established fixture, result and league-table presentation. It must not be used for paragraphs, long instructions or validation copy.

## Responsive scale

| Role | Token or class | Responsive size | Line height |
| --- | --- | --- | --- |
| Display or hero | `--type-display`, `.type-display` | 32-48px | 1.3 |
| Page title | `--type-page-title`, `.type-page-title` | 26.4-40px | 1.45 |
| Section heading | `--type-section-title`, `.type-section-title` | 20-28px | 1.45 |
| Card heading | `--type-card-title`, `.type-card-title` | 16-20px | 1.45 |
| Subheading | `--type-subheading`, `.type-subheading` | 14-16px | 1.45 |
| Body | `--type-body`, `.type-body` | 13-14.4px | 1.85 |
| Compact body | `--type-body-compact`, `.type-body-compact` | 12-13px | 1.65 |
| Pixel label | `--type-label`, `.type-label` | 8-9px | 1.65 |
| Form value | `--type-input` | 13-14px | 1.55-1.6 |
| Helper | `--type-helper`, `.type-helper` | 11-12px | 1.65 |
| Validation | `--type-validation`, `.type-validation` | 11-12px | 1.65 |
| Pixel action | `--type-action`, `.type-action` | 8-9px | 1.65 |
| Navigation | `--type-nav` | 8-9px | 1.7 |
| Table heading | `--type-table-heading` | 7-8px | component-defined |
| Table value | `--type-table-value` | 8-10px | component-defined |
| Status badge | `--type-status` | 7-8px | 1.5 |
| Caption or metadata | `--type-caption`, `.type-caption` | 10-11px | 1.65 |

The `clamp()` tokens reduce type gradually instead of changing abruptly at a breakpoint. Layout media queries may tighten line height on phones, but should not replace the shared scale with isolated viewport-specific font sizes.

## Usage rules

- Use `.type-page-title` for prominent readable headings and `.type-section-title` or `.type-card-title` as hierarchy descends.
- Use `.type-body` for normal prose and `.type-body-compact` for supporting copy in cards, banners, dialogs and sheets.
- Use `.type-helper`, `.type-validation` and `.type-caption` for their named supporting roles. These always use Unbounded and normal casing.
- Use `.type-label` and `.type-action` only for short text. Keep Press Start 2P labels concise and avoid letter spacing beyond the established brand treatment.
- Keep line lengths constrained by the existing containers. Legal pages retain a narrower prose measure and generous body line height.
- All text must wrap safely. Do not use fixed heights around variable copy.

## Forms and validation

Labels are compact and visually distinct. Input values and placeholders use Unbounded at the input token size. Helper text is smaller than normal body copy. Inline validation uses Unbounded at the validation size, sits close to its field and remains associated through `aria-invalid` and `aria-describedby`.

Do not repeat field errors in a large summary. A form-level alert should contain one concise instruction, such as `Please correct the highlighted fields.` Success and failure notices use compact body or validation typography rather than heading styles.

## Retro exceptions

League tables, fixtures, results, knockout match codes, round metadata and compact status badges retain Press Start 2P because rapid scanning and the approved football-game presentation are core to those components. Their sizes use the table and status tokens where CSS controls them. Score numerals may remain larger Unbounded display values. Long team names must wrap and keep their kit aligned.

## Responsive review

Review typography at 1440, 1254, 1024, 768, 390 and 360 pixels. Check zoom and text resizing as well as the nominal viewport. No heading, button, table value, field error, legal paragraph or sticky-panel copy may be clipped or covered.
