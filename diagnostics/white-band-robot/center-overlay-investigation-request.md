# Center overlay investigation request

The user's latest Chrome screenshot confirms that the defect persists after V651.

## Corrected classification

This is **not** a uniform full-width top band. A centered opaque white rectangle masks the top-center of the wheel, while the copper frame remains visible on both sides. The earlier robot acceptance was a false positive because it searched for the first non-white pixel anywhere in each row.

## Required browser probes

1. At `x = 50%`, sample `elementsFromPoint(x, y)` for `y = 112..190` and record each element's tag, id, classes, bounding rect, computed `position`, `z-index`, `background`, `opacity`, `overflow`, `clip-path`, `mask`, and ancestor chain.
2. Repeat at `x = 25%` and `x = 75%` to isolate the element present only in the center.
3. Detect the copper edge specifically at the centerline. Do not accept side copper pixels as PASS.
4. Capture screenshots with temporary diagnostic colors applied one candidate at a time.
5. Do not apply additional wheel, canvas, stage, or viewport Y offsets until the overlay owner is proven.

## Acceptance

The copper outer frame must be continuously visible across the top center up to the toolbar clip line, with no centered white mask.
