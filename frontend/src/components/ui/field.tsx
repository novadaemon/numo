import * as React from "react"
import { cn } from "@/lib/utils"

interface FieldContextValue {
  isInvalid?: boolean
  id?: string
}

const FieldContext = React.createContext<FieldContextValue | undefined>(undefined)

function useField() {
  const context = React.useContext(FieldContext)
  if (!context) {
    throw new Error("Field components must be used within a Field provider")
  }
  return context
}

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  invalid?: boolean
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, invalid, ...props }, ref) => (
    <FieldContext.Provider value={{ isInvalid: invalid }}>
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        data-invalid={invalid}
        {...props}
      />
    </FieldContext.Provider>
  )
)
Field.displayName = "Field"

interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4 @container/field-group", className)}
      {...props}
    />
  )
)
FieldGroup.displayName = "FieldGroup"

interface FieldSetProps extends React.FieldSetHTMLAttributes<HTMLFieldSetElement> {}

const FieldSet = React.forwardRef<HTMLFieldSetElement, FieldSetProps>(
  ({ className, ...props }, ref) => (
    <fieldset
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    />
  )
)
FieldSet.displayName = "FieldSet"

interface FieldLegendProps extends React.LegendHTMLAttributes<HTMLLegendElement> {
  variant?: "legend" | "label"
}

const FieldLegend = React.forwardRef<HTMLLegendElement, FieldLegendProps>(
  ({ className, variant = "legend", ...props }, ref) => (
    <legend
      ref={ref}
      className={cn(
        variant === "legend" && "text-base font-semibold leading-7 text-foreground",
        variant === "label" && "text-sm font-medium leading-6 text-foreground",
        className
      )}
      {...props}
    />
  )
)
FieldLegend.displayName = "FieldLegend"

interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-6 text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
)
FieldLabel.displayName = "FieldLabel"

interface FieldContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldContent = React.forwardRef<HTMLDivElement, FieldContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
)
FieldContent.displayName = "FieldContent"

interface FieldDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldDescription = React.forwardRef<HTMLDivElement, FieldDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
FieldDescription.displayName = "FieldDescription"

interface FieldErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  errors?: Array<{ message?: string } | undefined> | undefined
}

const FieldError = React.forwardRef<HTMLDivElement, FieldErrorProps>(
  ({ className, errors, children, ...props }, ref) => {
    // Handle both children and errors array
    if (!children && !errors) {
      return null
    }

    const errorMessages =
      errors
        ?.filter((error) => error?.message)
        ?.map((error) => error?.message as string) || []

    if (children) {
      return (
        <div
          ref={ref}
          className={cn("text-sm font-medium text-destructive", className)}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (errorMessages.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {errorMessages.length === 1 ? (
          <p>{errorMessages[0]}</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    )
  }
)
FieldError.displayName = "FieldError"

interface FieldSeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

const FieldSeparator = React.forwardRef<HTMLHRElement, FieldSeparatorProps>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={cn("my-4 border-border", className)}
      {...props}
    />
  )
)
FieldSeparator.displayName = "FieldSeparator"

interface FieldTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldTitle = React.forwardRef<HTMLDivElement, FieldTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm font-medium leading-6 text-foreground", className)}
      {...props}
    />
  )
)
FieldTitle.displayName = "FieldTitle"

export {
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldSeparator,
  FieldTitle,
}
