import { cn } from '../ui/utils';

type ConversationBubbleProps = {
  className?: string;
} & (
  | { editable?: false; children: React.ReactNode }
  | {
      editable: true;
      value: string;
      onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
      rows?: number;
    }
);

const BASE = 'bg-[#F3F4F6] rounded-xl px-4 py-2.5 text-sm text-[#1A1D2E]';

export function ConversationBubble(props: ConversationBubbleProps) {
  if (props.editable) {
    return (
      <textarea
        value={props.value}
        onChange={props.onChange}
        rows={props.rows}
        className={cn(
          BASE,
          'w-full resize-none border-2 border-transparent focus:border-[#5B5FF5]/30 outline-none transition-colors',
          props.className,
        )}
      />
    );
  }

  return <div className={cn(BASE, props.className)}>{props.children}</div>;
}
