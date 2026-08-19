"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const thumbSpring = { type: "spring", duration: 0.3, bounce: 0.2 } as const
const thumbInstant = { duration: 0 } as const

function Switch({
  className,
  size = "default",
  checked,
  defaultChecked = false,
  onCheckedChange,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  const shouldReduceMotion = useReducedMotion()
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : uncontrolledChecked

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(next) => {
        if (!isControlled) {
          setUncontrolledChecked(next)
        }
        onCheckedChange?.(next)
      }}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border-2 transition-[color,background-color,border-color] duration-150 ease-out-quad outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-5 data-[size=default]:w-11 data-[size=sm]:h-4 data-[size=sm]:w-7 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-unchecked:border-transparent data-unchecked:bg-input/90 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          data-slot="switch-thumb"
          className="pointer-events-none block rounded-full bg-background shadow-sm ring-0 not-dark:bg-clip-padding group-data-[size=default]/switch:h-4 group-data-[size=default]/switch:w-6 group-data-[size=sm]/switch:h-3 group-data-[size=sm]/switch:w-4 dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground"
          initial={false}
          animate={{ x: isChecked ? "calc(100% - 8px)" : 0 }}
          transition={shouldReduceMotion ? thumbInstant : thumbSpring}
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch }
