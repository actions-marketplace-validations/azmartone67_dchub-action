# DC Hub Data Center Power Index (DCPI)

[![DC Hub | Data Center Power Index (DCPI)](https://dchub.cloud/badges/dcpi.svg)](https://dchub.cloud/dcpi?via=badge)

A GitHub Action that looks up a Data Center Power Index (DCPI) market verdict, or searches data center facilities, from [DC Hub](https://dchub.cloud).

DC Hub is the orchestration layer for data center and energy intelligence. Find power. Find land. Find fiber. Find capacity.

The Data Center Power Index (DCPI) is at [dchub.cloud/dcpi](https://dchub.cloud/dcpi?via=github-action). The DC Hub MCP is at [dchub.cloud/mcp](https://dchub.cloud/mcp) — start with `execute_plan`.

## Usage

Market verdict:

```yaml
- name: Data Center Power Index (DCPI)
  id: dcpi
  uses: azmartone67/dchub-action@v1
  with:
    market: columbus
```

Facility search:

```yaml
- name: Search facilities
  id: facilities
  uses: azmartone67/dchub-action@v1
  with:
    facility: ashburn
```

At least one of `market` or `facility` is required.

## Inputs

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `market` | no | | Data Center Power Index (DCPI) market slug, for example `columbus` or `atlanta`. |
| `facility` | no | | Facility search query (city, provider, or market). |
| `base_url` | no | `https://dchub.cloud` | DC Hub origin. Leave at the default unless you are testing a staging host. |

## Outputs

| Name | Description |
|------|-------------|
| `verdict` | `BUILD`, `CAUTION`, or `AVOID` when a market lookup returns a published verdict. |
| `as_of` | Evidence date returned by DC Hub. |
| `unpublished_market` | `true` when no published verdict is available for the requested market. |

## License

MIT © DC Hub
