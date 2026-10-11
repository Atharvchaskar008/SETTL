# Sample Deals Harness

This folder contains test datasets for MilestoneVault's deal checker. All individuals, organizations, and agreements are entirely fictional.

## Contents & File Naming
Deals live in `samples/deals/` using two paired files per scenario:
- `NN-short-name.txt`: Deal agreement written in conversational plain English (80–160 words).
- `NN-short-name.expected.json`: Canonical checklist expected from the parser.

## Checklist Schema
Each JSON file contains:
- `title`: Short deal title.
- `payers`: List of `{ "name": string, "share": number }`.
- `judge`: Single dispute arbitrator `{ "name": string }`.
- `stages`: List of `{ "title": string, "payee": string, "amount": number, "condition": string, "source": string }`.
- `unclear`: List of `{ "issue": string, "question": string, "source": string }`.
- `total`: Total deal value.

## The Nine Rules
1. **Whole Rupees**: All amounts are integers without decimals or symbols.
2. **Balanced Sums**: Payer shares equal stage amounts, which equal `total` in clean deals.
3. **Exact Source**: Every `source` string must match the deal text character for character.
4. **Distinct Roles**: The judge cannot be a payer or payee; payees cannot be payers.
5. **Split Payees**: "Each of N people gets X" becomes one separate stage per person.
6. **Periodic Payments**: Recurring milestones are titled "Month 1", "Month 2", and so on.
7. **Missing Data**: Missing names or amounts stay `""` or `0`, with an entry added to `unclear`.
8. **Vague Phrases**: Subjective terms ("satisfactory", "reasonable time", "about") trigger an `unclear` entry.
9. **Clean Deals**: Clear agreements contain an empty `unclear` array.

## How to Test
1. Paste text from `samples/deals/NN-short-name.txt` into the deal checker.
2. Compare the checker's output against `samples/deals/NN-short-name.expected.json`.
