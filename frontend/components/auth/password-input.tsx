"use client";

import { cn } from "@/lib/utils";
import React, { JSX, useState } from "react";
import { Field, FieldError, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface PasswordInputProps extends React.ComponentProps<
  typeof InputGroupInput
> {
  label?: string;
  error?: string;
  containerClassName?: string;
  forgetPasswordRequired?: boolean;
}
/**
 * A password input component with show/hide toggle functionality
 *
 * @param className - Additional CSS classes for the input element
 * @param containerClassName - Additional CSS classes for the container Field element
 * @param label - Label text for the password input (defaults to "Password")
 * @param error - Error message to display below the input
 * @param forgetPasswordRequired - Whether to show the "Forgot your password?" link
 * @param props - Additional props passed to InputGroupInput component
 * @returns A password input field with toggle visibility button
 */

export function PasswordInput({
  className,
  containerClassName,
  label = "Password",
  error,
  forgetPasswordRequired = false,
  ...props
}: PasswordInputProps): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;
  return (
    <Field
      className={cn("max-w-sm", containerClassName)}
      data-invalid={hasError ? "true" : undefined}
    >
      <div className="flex items-center">
        <FieldLabel htmlFor={`${label.toLowerCase()}-input`}>
          {label}
        </FieldLabel>
        {forgetPasswordRequired == true ? (
          <Link
            href="/forgot-password"
            className="ml-auto text-sm underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        ) : (
          <></>
        )}
      </div>
      <InputGroup>
        <InputGroupInput
          id={`${label.toLowerCase()}-input`}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          aria-invalid={hasError}
          placeholder={`Enter ${label.toLowerCase()}`}
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      {hasError && <FieldError>{error}</FieldError>}
    </Field>
  );
}
