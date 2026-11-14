# Source-Aware HTML Mutation Engine RFC

> Architecture update (2026-11-03): this design history was moved from the removed
> html-editor package. Current implementation, test commands and package boundaries
> are documented in [Editor Core](../README.md), [Lunar Editor React](../../lunar-editor-react/README.md)
> and [App composition](../../../app/src/editor/README.md). Review, AI, PDF pages
> and product UI belong to App; generic math/table extensions belong to the React
> package. Text pieces and projectionChanges below are historical designs replaced
> by SourceUnit compilation. See the [current data flow](../../../LUNAR_EDITOR_DATA_FLOW.md).

Status: Accepted; original scope delivered. Preserved as design history, not the current implementation specification.

## Goal

Preserve untouched HTML source exactly while allowing ProseMirror transactions,
including structural edits, review resolutions, Undo, and Redo, to update the
same authoritative HTML document.

## Problem

The current Rich export records review resolutions and IDs of dirty blocks.
Replacing a serialized dirty block works for local text edits, but cannot safely
represent deleted IDs, merged blocks, edits spanning intermediate blocks, or
arbitrary unknown markup. Falling back to full ProseMirror serialization also
normalizes unrelated HTML.

## Source Of Truth

The source engine owns an immutable `SourceDocument`. ProseMirror is a visual
projection of that document, and CodeMirror edits the same source document.
Neither editor's serialized DOM is the source of truth.

## Core Invariants

1. `serialize(parse(html)) === html` when no mutation has been applied.
2. Applying a mutation and its inverse restores the previous source document.
3. Every ProseMirror transaction that changes the document must carry exactly
   one source-mutation batch before it is applied.
4. Source mutation failure is explicit and blocks export; it must never silently
   discard a Rich edit.
5. Stable source keys are internal and are never emitted into saved HTML.

## Model

The lossless tree contains document, element, text, comment, and doctype nodes.
Each parsed node records an internal key, parent/child relationships, semantic
content, and source offsets. Unchanged nodes serialize directly from their
original source slice. Changed parents serialize recursively so unchanged
descendants and inter-node whitespace still retain their original slices.

Elements with an HTML `id` receive an ID-derived internal key. Other parsed
nodes receive deterministic source-location keys. Inserted nodes receive
session-generated keys.

## Mutation Contract

The initial mutation set is:

- `replace-text`
- `insert-node`
- `delete-node`
- `move-node`
- `set-attribute`
- `remove-attribute`
- `unwrap-node`
- `replace-children`

Every mutation batch stores enough previous state to produce an exact inverse.
Mutations target source keys and relative offsets, never absolute offsets in a
continually changing output string.

## ProseMirror Integration

A `SourceMutationStep` is appended to the same transaction as the ordinary
ProseMirror steps before `EditorState.apply`. The step is a no-op for the
ProseMirror document but updates source-plugin state. Its `invert()` method
swaps the forward and inverse mutation batches, binding source state to the
exact ProseMirror Undo/Redo event.

Native input, commands, input rules, paste, and review actions must all pass
through the same dispatch interception point. History transactions already
contain the inverted source step and are not compiled again.

## Cross-Node Compilation

The mutation compiler uses the pre-transaction and post-transaction documents,
transaction step maps, and a ProseMirror-to-source map. It first attempts text
mutations. Structural changes are diffed at the smallest stable common source
ancestor. Deleted or merged elements are represented explicitly instead of
assuming every previous ID still exists after serialization.

## Code Mode

Switching modes without a Code edit preserves the ProseMirror state and its
history. A Code edit is parsed into a new source tree and diffed into source
mutations. A committed Code edit creates a bounded full-source session
checkpoint and rebuilds the Rich projection at an explicit history boundary.
The CodeMirror history is reset at that boundary. Rich and Code local history
handle their own edits first; only an unhandled Undo/Redo shortcut crosses a
source checkpoint. A new Code or Rich branch clears checkpoint Redo.

## Delivery Phases

### Phase 1: Lossless Core

- Lossless fragment parser and serializer.
- Immutable source model and indexes.
- Reversible text and basic structural mutations.
- Round-trip and inverse-property tests.

### Phase 2: ProseMirror Source Mapping

- Internal source keys on element nodes.
- Text span mapping outside ProseMirror text attrs.
- Mapping through transaction step maps.

### Phase 3: Transaction Compiler And History

- Compile all document-changing transactions.
- General `SourceMutationStep` and plugin state.
- Cross-paragraph delete, merge, split, paste, and Undo/Redo tests.

### Phase 4: Review And Export Migration

- Express Accept/Reject as source mutations.
- Replace dirty-block export and review string patches.
- Make export failures explicit.

Implementation status: Accept/Reject carries ordered source targets and a
reversible `SourceMutationStep` in the same history event. Rich export now
serializes only synchronized `SourceDocument` state; the legacy dirty-block and
review string patch path has been removed. Source conflicts emit structured
events, block Rich-to-Code switching, recover automatically after an exact Undo,
and have an explicit restore-to-source action. Phase 4 is complete.

### Phase 5: Code/Rich Session Unification

- Code edits update the source document.
- Preserve mode switches without rebuilding Rich history.
- Add session checkpoints and cross-editor diagnostics.

Implementation status: complete. The host HTML session owns the authoritative
full-document `SourceDocument`. Code mode displays that source without automatic
whole-document formatting and reparses only actual Code edits into a new source
revision. Rich mode keeps separate display and source baselines, then writes its
lossless exported body back into the same session. Zero-edit switches preserve
the source revision and mounted Rich state. Code commits create reversible,
bounded checkpoints; checkpoint Undo/Redo verifies exact source endpoints,
rebuilds the active projection, and rejects unsynchronized local edits.

## Non-Goals For Phase 1

- Changing the current editor runtime path.
- Replacing `patch/` before source-core tests pass.
- Preserving ProseMirror history across arbitrary Code edits.
- Canonically formatting newly inserted complex HTML.
