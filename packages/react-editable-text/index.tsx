import classNames from 'classnames';
import * as React from 'react';
import './react-editable-text.scss';
import { useState } from 'react';

interface StyleProps {
  className?: string;
  style?: React.CSSProperties;
}
type InputComponent = React.FC<StyleProps>;
type TextComponent = React.FC<StyleProps & { withTooltip?: boolean }>;

type TextEditableInputComponent = React.FC<{ InputComponent: InputComponent }>;
type TextEditableTextComponent = React.FC<{ TextComponent: TextComponent }>;

export type EditState = 'edit' | 'text';

interface Props {
  initialState?: EditState;
  text: string;
  onSetText: (newText: string) => void;
  onChangeText?: (newText?: string) => void;
  onClick?: (v: string) => void;
  RenderText: TextEditableTextComponent;
  RenderInput: TextEditableInputComponent;
}

let clickTriggers: number[] = [];

/**
 * @description EditableText will only rerender if the "text" property changes.
 */
const EditableText: React.FunctionComponent<Props> = React.memo(
  ({ RenderInput, RenderText, initialState, onSetText, onChangeText, onClick, text }) => {
    const [editState, setEditState] = useState(initialState ?? 'text');
    const inputEl = React.useRef<HTMLInputElement | null>(null);

    const InputComponent: InputComponent = ({ className, style }) => (
      <input
        className={classNames('react-editable-text', className)}
        style={style}
        onChange={(e) => onChangeText?.(e.target.value)}
        defaultValue={text}
        ref={inputEl}
        type="text"
        autoFocus={true}
        onFocus={(e) => e.target.select()}
        onBlur={() => {
          // TODO(quality) this is not the best api...
          onChangeText?.(undefined);
          setEditState('text');
        }}
        onKeyDown={(e) => {
          if (inputEl.current === null) {
            return;
          }
          if (e.key === 'Enter' || e.keyCode === 9 /* Tab */) {
            onSetText(inputEl.current.value);
            setEditState('text');
          }
          if (e.key === 'Escape') {
            // TODO(quality) this is not the best api...
            onChangeText?.(undefined);
            setEditState('text');
          }
        }}
      />
    );

    const TextComponent: TextComponent = ({ className, style }) => (
      <div
        className={className}
        ref={() => {}}
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          // this is needed to avoid running onClick handlers on doubleClick
          const trigger = window.setTimeout(() => onClick?.(text), 200);
          clickTriggers.push(trigger);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          clickTriggers.map(clearTimeout);
          clickTriggers = [];
          setEditState('edit');
        }}
      >
        {text}
      </div>
    );

    return editState === 'edit' ? (
      <RenderInput InputComponent={InputComponent} />
    ) : (
      <RenderText TextComponent={TextComponent} />
    );
  },
  (oldProps, newProps) => oldProps.text === newProps.text
);

export default EditableText;
