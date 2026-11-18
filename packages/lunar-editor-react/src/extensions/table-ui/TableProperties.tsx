import { WtIcon } from '@mache-hangar/components/react';
import { Tooltip } from 'antd';
import type { TableCommand, TableState } from '../table/commands';

type Props = {
  state: TableState;
  disabled: boolean;
  onCommand: (command: TableCommand) => void;
};

export function CellProperties({ state, disabled, onCommand }: Props) {
  const blocked = disabled || !state.inCell;
  return (
    <div className="lunar-table-properties">
      <strong>Cell properties</strong>
      <label>
        Text alignment
        <select
          aria-label="Cell text alignment"
          disabled={blocked}
          value={state.textAlign}
          onChange={event =>
            onCommand({
              action: 'cell_style',
              textAlign: event.target.value as 'left' | 'center' | 'right' | 'justify',
            })
          }
        >
          {['left', 'center', 'right', 'justify'].map(value => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Vertical alignment
        <select
          aria-label="Cell vertical alignment"
          disabled={blocked}
          value={state.verticalAlign}
          onChange={event =>
            onCommand({
              action: 'cell_style',
              verticalAlign: event.target.value as 'top' | 'middle' | 'bottom',
            })
          }
        >
          {['top', 'middle', 'bottom'].map(value => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <span className="lunar-table-properties__label">Background</span>
      <div className="lunar-table-properties__colors" role="group" aria-label="Cell background color">
        {['#ffffff', '#f1f4f8', '#fff0b3', '#d9f5e5', '#dde7ff', '#fce0e0'].map(color => (
          <Tooltip title={color} key={color}>
            <button
              type="button"
              aria-label={`Cell background ${color}`}
              style={{ backgroundColor: color }}
              disabled={blocked}
              onMouseDown={event => event.preventDefault()}
              onClick={() => onCommand({ action: 'cell_style', backgroundColor: color })}
            />
          </Tooltip>
        ))}
      </div>
      <button
        type="button"
        className="lunar-table-button lunar-table-properties__reset"
        disabled={blocked}
        onMouseDown={event => event.preventDefault()}
        onClick={() => onCommand({ action: 'cell_style', backgroundColor: 'transparent' })}
      >
        Clear background
      </button>
    </div>
  );
}

export function TableProperties({ state, disabled, onCommand }: Props) {
  return (
    <div className="lunar-table-properties">
      <strong>Table properties</strong>
      {state.valid ? (
        <>
          <span className="lunar-table-properties__label">Alignment</span>
          <div className="lunar-table-properties__row" role="group" aria-label="Table alignment">
            {(['left', 'center', 'right'] as const).map(align => (
              <Tooltip title={`Align ${align}`} key={align}>
                <button
                  type="button"
                  className="lunar-table-button"
                  disabled={disabled}
                  aria-label={`Align ${align}`}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => onCommand({ action: 'table_style', align })}
                >
                  <WtIcon name={`align_${align}`} size="18" />
                </button>
              </Tooltip>
            ))}
          </div>
          <span className="lunar-table-properties__label">Width</span>
          <div className="lunar-table-properties__row" role="group" aria-label="Table width">
            {(['25%', '50%', '75%', '100%'] as const).map(width => (
              <button
                key={width}
                type="button"
                className="lunar-table-button"
                disabled={disabled}
                aria-label={width}
                onMouseDown={event => event.preventDefault()}
                onClick={() => onCommand({ action: 'table_style', width })}
              >
                {width}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="lunar-table-properties__notice">This table has an irregular structure. Row and cell tools are unavailable.</p>
      )}
      <div className="lunar-table-properties__footer">
        <button
          type="button"
          className="lunar-table-button lunar-table-button--danger"
          disabled={disabled}
          aria-label="Delete table"
          onMouseDown={event => event.preventDefault()}
          onClick={() => onCommand({ action: 'delete_table' })}
        >
          <WtIcon name="delete_outline" size="16" />
          Delete table
        </button>
      </div>
    </div>
  );
}
