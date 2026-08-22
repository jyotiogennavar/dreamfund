"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  caretFromDigitCount,
  countDigitsBefore,
  formatMoneyInput,
  getCurrencySymbol,
  sanitizeMoneyInput,
} from "@/utils/money";

type CurrencyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange" | "name" | "inputMode"
> & {
  name: string;
  value?: string;
  defaultValue?: string;
  currency?: string;
  onValueChange?: (rawValue: string) => void;
};

export function CurrencyInput({
  name,
  id,
  value,
  defaultValue = "",
  currency = "INR",
  onValueChange,
  onKeyDown,
  className,
  placeholder,
  ...props
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const caretDigitsRef = useRef<number | null>(null);
  const [uncontrolled, setUncontrolled] = useState(() =>
    sanitizeMoneyInput(defaultValue),
  );
  const raw = sanitizeMoneyInput(value ?? uncontrolled);
  const formatted = formatMoneyInput(raw, currency);

  function commit(nextRaw: string, caretDigits: number) {
    caretDigitsRef.current = caretDigits;
    if (value === undefined) {
      setUncontrolled(nextRaw);
    }
    onValueChange?.(nextRaw);
  }

  useLayoutEffect(() => {
    const input = inputRef.current;
    const digits = caretDigitsRef.current;
    if (!input || digits == null) {
      return;
    }

    caretDigitsRef.current = null;
    const caret = caretFromDigitCount(input.value, digits);
    input.setSelectionRange(caret, caret);
  }, [formatted]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const caret = input.selectionStart ?? input.value.length;
    const digitsBefore = countDigitsBefore(input.value, caret);
    const nextRaw = sanitizeMoneyInput(input.value);
    const nextFormatted = formatMoneyInput(nextRaw, currency);
    const nextCaretDigits = Math.min(digitsBefore, nextRaw.length);

    input.value = nextFormatted;
    commit(nextRaw, nextCaretDigits);
    input.setSelectionRange(
      caretFromDigitCount(nextFormatted, nextCaretDigits),
      caretFromDigitCount(nextFormatted, nextCaretDigits),
    );
  }

  function handleSeparatorKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Backspace" && event.key !== "Delete") {
      return;
    }

    const input = event.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    if (start !== end) {
      return;
    }

    if (event.key === "Backspace") {
      const previous = input.value[start - 1];
      if (previous === undefined || isAsciiDigit(previous)) {
        return;
      }

      event.preventDefault();
      const digitsBefore = countDigitsBefore(input.value, start);
      if (digitsBefore === 0) {
        const caret = caretFromDigitCount(input.value, 0);
        input.setSelectionRange(caret, caret);
        return;
      }

      applyRaw(
        input,
        raw.slice(0, digitsBefore - 1) + raw.slice(digitsBefore),
        digitsBefore - 1,
      );
      return;
    }

    const next = input.value[start];
    if (next === undefined || isAsciiDigit(next)) {
      return;
    }

    event.preventDefault();
    const digitsBefore = countDigitsBefore(input.value, start);
    if (digitsBefore >= raw.length) {
      return;
    }

    applyRaw(
      input,
      raw.slice(0, digitsBefore) + raw.slice(digitsBefore + 1),
      digitsBefore,
    );
  }

  function applyRaw(
    input: HTMLInputElement,
    nextRaw: string,
    caretDigits: number,
  ) {
    const nextFormatted = formatMoneyInput(nextRaw, currency);
    input.value = nextFormatted;
    commit(nextRaw, caretDigits);
    const caret = caretFromDigitCount(nextFormatted, caretDigits);
    input.setSelectionRange(caret, caret);
  }

  return (
    <>
      <input type="hidden" name={name} value={raw} />
      <Input
        {...props}
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={formatted}
        placeholder={placeholder ?? `${getCurrencySymbol(currency)} 0`}
        className={cn("tabular-nums", className)}
        onChange={handleChange}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) {
            handleSeparatorKeyDown(event);
          }
        }}
      />
    </>
  );
}

function isAsciiDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}
