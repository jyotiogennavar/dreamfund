"use client"

import * as React from "react"
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

const easeOutExpo = [0.19, 1, 0.22, 1] as const
const dialogSpring = { type: "spring", duration: 0.3, bounce: 0 } as const
const dialogExit = { duration: 0.15, ease: easeOutExpo } as const
const dialogShown = "translate(-50%, -50%)"

const DialogOpenContext = React.createContext(false)

function Dialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = openProp !== undefined
  const open = isControlled ? openProp : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next)
      }
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  return (
    <DialogOpenContext.Provider value={open}>
      <DialogPrimitive.Root
        data-slot="dialog"
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </DialogOpenContext.Provider>
  )
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay asChild forceMount {...props}>
      <motion.div
        data-slot="dialog-overlay"
        className={cn(
          "fixed inset-0 isolate z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm",
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: dialogExit }}
        transition={{ duration: 0.2, ease: easeOutExpo }}
      />
    </DialogPrimitive.Overlay>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const open = React.useContext(DialogOpenContext)
  const shouldReduceMotion = useReducedMotion()
  const hiddenTransform = shouldReduceMotion
    ? dialogShown
    : "translate(-50%, -50%) scale(0.96)"

  return (
    <MotionConfig reducedMotion="user" transition={dialogSpring}>
      <AnimatePresence>
        {open ? (
          <DialogPortal forceMount key="dialog">
            <DialogOverlay />
            <DialogPrimitive.Content
              asChild
              forceMount
              data-slot="dialog-content"
              {...props}
            >
              <motion.div
                className={cn(
                  "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[min(var(--dialog-max-width,28rem),calc(100%-2rem))] gap-6 rounded-4xl bg-popover p-6 text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/5 outline-none dark:ring-foreground/10",
                  className
                )}
                initial={{ opacity: 0, transform: hiddenTransform }}
                animate={{ opacity: 1, transform: dialogShown }}
                exit={{
                  opacity: 0,
                  transform: hiddenTransform,
                  transition: dialogExit,
                }}
              >
                {children}
                {showCloseButton && (
                  <DialogPrimitive.Close data-slot="dialog-close" asChild>
                    <Button
                      variant="ghost"
                      className="absolute top-4 right-4 bg-secondary"
                      size="icon-sm"
                    >
                      <XIcon />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogPrimitive.Close>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPortal>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
