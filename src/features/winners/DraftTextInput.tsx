import React, { useRef, useState } from 'react';

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onFocus' | 'onBlur'>;

/**
 * A text field for a value that lives on the stage. Typing edits a local draft (the controller
 * window only sees the value again when the stage sends it back, so a directly bound field would
 * jump back while typing); the draft is sent on blur or Enter. Escape drops it.
 */
export const DraftTextInput: React.FC<InputProps & { value: string; onCommit: (value: string) => void }> = ({
  value,
  onCommit,
  onKeyDown,
  ...rest
}) => {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  // Escape blurs the field; the blur that follows must not send the dropped draft.
  const cancelled = useRef(false);

  return (
    <input
      {...rest}
      type="text"
      value={editing ? draft : value}
      onFocus={() => {
        setDraft(value);
        setEditing(true);
      }}
      onChange={e => {
        setEditing(true);
        setDraft(e.target.value);
      }}
      onBlur={() => {
        setEditing(false);
        if (cancelled.current) {
          cancelled.current = false;
          return;
        }
        if (draft !== value) onCommit(draft);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          cancelled.current = true;
          e.currentTarget.blur();
        }
        onKeyDown?.(e);
      }}
    />
  );
};
