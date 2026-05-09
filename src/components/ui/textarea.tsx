import {
  type ChangeEvent,
  forwardRef,
  type CSSProperties,
  useState,
} from "react";
import clsx from "clsx";
import { Error } from "@/components/ui/error";

export interface TextareaProps {
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  size?: "xSmall" | "small" | "mediumSmall" | "large";
  style?: CSSProperties;
  value?: string;
  onChange?: (value?: string) => void;
  className?: string;
  "aria-label"?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      defaultValue,
      placeholder,
      disabled,
      error,
      size,
      style,
      value,
      onChange,
      className,
      "aria-label": ariaLabel,
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState(defaultValue ?? "");

    const current = isControlled ? (value ?? "") : internal;

    const _onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      if (!isControlled) setInternal(next);
      onChange?.(next);
    };

    return (
      <div className="flex w-full flex-col gap-2">
        <textarea
          ref={ref}
          className={clsx(
            "rounded-md resize-none font-sans bg-background-100 text-geist-foreground placeholder:text-gray-900 outline-none w-full duration-150 border border-gray-alpha-400 hover:border-gray-alpha-500 hover:ring-0",
            size === "large"
              ? "h-12 py-2.5 px-3 text-base"
              : "h-10 p-2.5 text-sm",
            disabled &&
              "bg-gray-100 text-gray-700 placeholder:text-gray-700 placeholder:opacity-50 cursor-not-allowed",
            error
              ? "ring-red-300 ring-4 border-red-900 text-error"
              : "focus:border-gray-alpha-600 focus:shadow-focus-input",
            className,
          )}
          defaultValue={isControlled ? undefined : defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          style={style}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={current}
          onChange={_onChange}
          aria-label={ariaLabel}
        />
        {error ? (
          <Error size={size === "large" ? "large" : "small"}>{error}</Error>
        ) : null}
      </div>
    );
  },
);
