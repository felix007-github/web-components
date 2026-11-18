import { WtIcon } from '@mache-hangar/components/react';
import { Dropdown, Popover, Tooltip } from 'antd';
import { forwardRef, useRef, useId, useState, type ButtonHTMLAttributes, type KeyboardEvent, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useTableOverlay } from './useTableOverlay';
import { CellProperties, TableProperties } from './TableProperties';
import type { MenuProps } from 'antd';
import type { TableCommand, TableState } from '../table/commands';

export type TableUiProps = {
  state: TableState;
  disabled?: boolean;
  onCommand: (command: TableCommand) => void;
};
export type TableToolbarProps = TableUiProps & { rootRef: RefObject<HTMLElement | null> };
type Props = TableUiProps;

export function InsertTableButton({ state, disabled = false, onCommand }: Props) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({ rows: '3', columns: '3' });
  const [hover, setHover] = useState({ rows: 0, columns: 0 });
  const insert = (rows: number, columns: number) => {
    onCommand({ action: 'insert', rows, columns });
    setOpen(false);
  };
  return (
    <Popover
      classNames={{ root: 'lunar-table-popover' }}
      trigger="click"
      placement="bottomRight"
      open={open && !disabled}
      onOpenChange={setOpen}
      content={
        <div className="lunar-table-picker" aria-label="Insert table dimensions">
          <strong>Insert table</strong>
          <span className="lunar-table-picker__dimensions" aria-live="polite">
            {hover.columns || size.columns} × {hover.rows || size.rows}
          </span>
          <div className="lunar-table-picker__grid" onMouseLeave={() => setHover({ rows: 0, columns: 0 })}>
            {Array.from({ length: 64 }, (_, i) => {
              const rows = Math.floor(i / 8) + 1,
                columns = (i % 8) + 1;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Insert ${rows} rows and ${columns} columns`}
                  className={rows <= hover.rows && columns <= hover.columns ? 'lunar-table-picker__cell is-active' : 'lunar-table-picker__cell'}
                  onFocus={() => setHover({ rows, columns })}
                  onMouseEnter={() => setHover({ rows, columns })}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => insert(rows, columns)}
                />
              );
            })}
          </div>
          <form
            className="lunar-table-picker__custom"
            onSubmit={e => {
              e.preventDefault();
              insert(Number(size.rows), Number(size.columns));
            }}
          >
            <label>
              Rows
              <input type="number" min="1" max="50" required value={size.rows} onChange={e => setSize({ ...size, rows: e.target.value })} />
            </label>
            <label>
              Columns
              <input type="number" min="1" max="50" required value={size.columns} onChange={e => setSize({ ...size, columns: e.target.value })} />
            </label>
            <button type="submit">Insert</button>
          </form>
        </div>
      }
    >
      <button
        className="lunar-table-button"
        type="button"
        disabled={disabled || !state.available}
        title="Insert table"
        aria-label="Insert table"
        onMouseDown={e => e.preventDefault()}
      >
        <WtIcon name="table" size="18" />
      </button>
    </Popover>
  );
}

type ToolButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: string;
  dropdown?: boolean;
  settingsBadge?: boolean;
  cellIndicator?: boolean;
};
const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(function ToolButton({ label, icon, dropdown, settingsBadge, cellIndicator, onMouseDown, ...props }, ref) {
  return (
    <Tooltip title={label} mouseEnterDelay={0.35}>
      <button
        {...props}
        ref={ref}
        type="button"
        className="lunar-table-button lunar-table-toolbar__tool"
        aria-label={label}
        onMouseDown={event => {
          event.preventDefault();
          onMouseDown?.(event);
        }}
      >
        <span className={`lunar-table-toolbar__icon${cellIndicator ? ' lunar-table-toolbar__icon--cell' : ''}`} aria-hidden="true">
          <WtIcon name={icon} size="19" />
          {settingsBadge ? <WtIcon className="lunar-table-toolbar__property-mark" name="settings" size="10" /> : null}
        </span>
        {dropdown ? <WtIcon className="lunar-table-toolbar__chevron" name="keyboard_arrow_down" size="12" aria-hidden="true" /> : null}
      </button>
    </Tooltip>
  );
});

const menuCommands: Record<string, TableCommand> = {
  row_before: { action: 'row_before' },
  row_after: { action: 'row_after' },
  delete_rows: { action: 'delete_rows' },
  column_before: { action: 'column_before' },
  column_after: { action: 'column_after' },
  delete_columns: { action: 'delete_columns' },
  header_row: { action: 'header_row' },
  header_column: { action: 'header_column' },
  merge: { action: 'merge' },
  split: { action: 'split' },
  clear_cells: { action: 'clear_cells' },
};

export function TableToolbar({ state, disabled = false, onCommand, rootRef }: TableToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const overlay = useTableOverlay(rootRef, toolbarRef, state, !disabled);
  if (!overlay) return null;
  return <FloatingTableTools state={state} disabled={disabled} onCommand={onCommand} rootRef={rootRef} toolbarRef={toolbarRef} overlay={overlay} />;
}

function FloatingTableTools({
  state,
  disabled = false,
  onCommand,
  rootRef,
  toolbarRef,
  overlay,
}: Props & {
  rootRef: RefObject<HTMLElement | null>;
  toolbarRef: RefObject<HTMLDivElement | null>;
  overlay: NonNullable<ReturnType<typeof useTableOverlay>>;
}) {
  const helpId = useId();
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const popup = (name: string) => ({
    open: openPanel === name,
    onOpenChange: (open: boolean) => setOpenPanel(current => (open ? name : current === name ? null : current)),
  });
  const invalid = disabled || !state.valid || !state.available;
  const cellUnavailable = invalid || !state.inCell;
  const menu = (items: NonNullable<MenuProps['items']>, selectedKeys: string[] = []) => ({
    items,
    selectedKeys,
    onClick: ({ key }: { key: string }) => {
      if (menuCommands[key]) {
        setOpenPanel(null);
        onCommand(menuCommands[key]);
      }
    },
  });
  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!toolbarRef.current?.contains(event.target as Node)) return;
    const buttons = [...toolbarRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      rootRef.current?.querySelector<HTMLElement>('.ProseMirror')?.focus({ preventScroll: true });
    } else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length;
      buttons[next]?.focus();
    }
  };
  const border = (box: typeof overlay.table, expand = 0) => ({
    left: box.left - overlay.visible.left + 2 - expand,
    top: box.top - overlay.visible.top + 2 - expand,
    width: box.width + expand * 2,
    height: box.height + expand * 2,
  });
  return createPortal(
    <>
      <div
        className="lunar-table-selection"
        aria-hidden="true"
        style={{
          left: overlay.visible.left - 2,
          top: overlay.visible.top - 2,
          width: overlay.visible.width + 4,
          height: overlay.visible.height + 4,
        }}
      >
        <div className="lunar-table-selection__frame" style={border(overlay.table, 2)} />
        {overlay.cell && state.inCell && state.selectedCells === 1 ? <div className="lunar-table-selection__cell" style={border(overlay.cell)} /> : null}
      </div>
      <div
        className="lunar-table-toolbar"
        ref={toolbarRef}
        role="toolbar"
        aria-label="Table tools"
        aria-describedby={helpId}
        data-placement={overlay.placement}
        style={overlay.toolbar}
        onKeyDown={keydown}
      >
        <span id={helpId} className="lunar-table-toolbar__help">
          {state.rows} rows, {state.columns} columns. {state.selectedCells} cells selected. Drag across cells or Shift + click to select cells. Alt + F10 to focus table tools.
        </span>
        <Dropdown
          {...popup('columns')}
          overlayClassName="lunar-table-popover"
          trigger={['click']}
          disabled={cellUnavailable}
          menu={menu(
            [
              {
                key: 'header_column',
                label: state.headerColumn ? 'Remove heading column' : 'Set heading column',
              },
              { type: 'divider' },
              { key: 'column_before', label: 'Insert column left' },
              { key: 'column_after', label: 'Insert column right' },
              { type: 'divider' },
              {
                key: 'delete_columns',
                label: 'Delete selected columns',
                danger: true,
              },
            ],
            state.headerColumn ? ['header_column'] : [],
          )}
        >
          <ToolButton label="Columns" icon="table_column" dropdown disabled={cellUnavailable} />
        </Dropdown>
        <Dropdown
          {...popup('rows')}
          overlayClassName="lunar-table-popover"
          trigger={['click']}
          disabled={cellUnavailable}
          menu={menu(
            [
              {
                key: 'header_row',
                label: state.headerRow ? 'Remove heading row' : 'Set heading row',
              },
              { type: 'divider' },
              { key: 'row_before', label: 'Insert row above' },
              { key: 'row_after', label: 'Insert row below' },
              { type: 'divider' },
              {
                key: 'delete_rows',
                label: 'Delete selected rows',
                danger: true,
              },
            ],
            state.headerRow ? ['header_row'] : [],
          )}
        >
          <ToolButton label="Rows" icon="table_row" dropdown disabled={cellUnavailable} />
        </Dropdown>
        <Dropdown
          {...popup('cells')}
          overlayClassName="lunar-table-popover"
          trigger={['click']}
          disabled={cellUnavailable}
          popupRender={menus => (
            <div className="lunar-table-cell-menu">
              <div className="lunar-table-cell-menu__hint" role="status">
                {state.selectedCells < 2 ? (
                  <>
                    <strong>Select cells to merge</strong>
                    <span>Drag across cells, or hold Shift and click the last cell.</span>
                  </>
                ) : (
                  <>
                    <strong>{state.selectedCells} cells selected</strong>
                    {!state.canMerge ? <span>Cells in different table sections cannot be merged.</span> : null}
                  </>
                )}
                {!state.canSplit ? <span>Split is available on merged cells.</span> : null}
              </div>
              {menus}
            </div>
          )}
          menu={menu([
            {
              key: 'merge',
              label: 'Merge cells',
              disabled: !state.canMerge,
              icon: <WtIcon name="merge_cell" size="17" />,
            },
            {
              key: 'split',
              label: 'Split cell',
              disabled: !state.canSplit,
              icon: <WtIcon name="unmerge_cell" size="17" />,
            },
            { type: 'divider' },
            { key: 'clear_cells', label: 'Clear cell contents' },
          ])}
        >
          <ToolButton label="Merge and split cells" icon="merge_cell" dropdown disabled={cellUnavailable} />
        </Dropdown>
        <span className="lunar-table-toolbar__divider" aria-hidden="true" />
        <Popover
          {...popup('table')}
          trigger="click"
          placement="bottom"
          classNames={{ root: 'lunar-table-popover' }}
          content={<TableProperties state={state} disabled={disabled || !state.available} onCommand={onCommand} />}
        >
          <ToolButton label="Table properties" icon="table" settingsBadge />
        </Popover>
        <Popover
          {...popup('cell')}
          trigger="click"
          placement="bottom"
          classNames={{ root: 'lunar-table-popover' }}
          content={<CellProperties state={state} disabled={cellUnavailable} onCommand={onCommand} />}
        >
          <ToolButton label="Cell properties" icon="table" settingsBadge cellIndicator disabled={cellUnavailable} />
        </Popover>
        <ToolButton
          label="Table caption"
          icon="tag_title"
          disabled={invalid}
          aria-pressed={state.caption}
          onClick={() => {
            setOpenPanel(null);
            onCommand({ action: 'caption' });
          }}
        />
      </div>
    </>,
    document.body,
  );
}
