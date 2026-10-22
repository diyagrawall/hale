# Proof of progress: PASS/FAIL check, before and after the fix

Same inputs, same app. BEFORE is commit `8938d32`, AFTER is commit `3a19a26` and later.

| # | Test | Input | BEFORE | AFTER |
| --- | --- | --- | --- | --- |
| 1 | Test 1: red alert | `cat struggling to breathe near Saket` | **FAIL**: card says CRITICAL but no red "Go to a vet now" alert (`1-BEFORE…jpg`) | **PASS**: red alert shows, "Safety rule triggered by your words: breathing trouble" (`2-AFTER…jpg`) |
| 2 | Test 2: gap stays correct | Calculate 8000 / 2000, then change the estimate to 20000 | **FAIL**: estimate box says 20000 but the page still shows "Funding gap: ₹6,000" and an appeal quoting ₹8,000 (`3-BEFORE…jpg`) | **PASS**: the old gap, appeal and confirm button disappear until you recalculate (`4-AFTER…jpg`) |
| 3 | Test 2: case page | 8000 / 2000, then "Clinic confirmed (simulated)" | n/a | **PASS**: "₹6,000 still needed", 25% progress bar, simulated badge (`5-AFTER…jpg`) |

Root causes fixed: the danger-word list was too narrow and the alert ignored the AI; results were not cleared when the inputs changed.
See the git history (`3a19a26`) for the full list of 5 fixes.
