import React from "react";
import { useRouteError } from "react-router-dom";

// ---- Shared fallback UI -----------------------------------------------------

type ErrorFallbackProps = {
  error: Error;
  componentStack?: string;
  title?: string;
  // Omitted when the error is unrecoverable without a reload (router errors),
  // in which case only "Reload page" is offered.
  onRetry?: () => void;
};

export function ErrorFallback({
  error,
  componentStack,
  title = "Something went wrong",
  onRetry,
}: ErrorFallbackProps) {
  const isDev = import.meta.env.DEV;

  return (
    <div
      role="alert"
      aria-live="assertive"
      data-testid="errorboundary"
      className="flex min-h-[60vh] w-full items-center justify-center p-4"
    >
      {/* text-left resists the global centering applied to #root. */}
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-300 bg-white text-left shadow-sm dark:border-gray-700 dark:bg-[#1d2a2e]">
        <div className="flex items-start gap-3 border-b border-gray-200 p-5 dark:border-gray-700">
          <svg
            className="mt-0.5 h-6 w-6 shrink-0 text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 0 1 .894.553l7 14A1 1 0 0 1 17 18H3a1 1 0 0 1-.894-1.447l7-14A1 1 0 0 1 10 2Zm0 5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          <div className="min-w-0">
            <h2
              data-testid="errorboundarytitle"
              className="text-base font-semibold text-gray-900 dark:text-gray-100"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {isDev
                ? "This page crashed while rendering. The details below are shown in development only."
                : "This page ran into an unexpected problem. You can try again or reload."}
            </p>
          </div>
        </div>

        {isDev && (
          <div className="space-y-3 p-5">
            <p
              data-testid="errorboundarymessage"
              className="rounded-md bg-red-50 p-3 font-mono text-sm break-words text-red-900"
            >
              {error.name}: {error.message}
            </p>

            {error.stack && (
              <details open>
                <summary className="cursor-pointer text-sm font-medium text-[#55a8c2]">
                  Stack trace
                </summary>
                <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-gray-100 p-3 text-xs whitespace-pre-wrap text-gray-800 dark:bg-[#0e1517] dark:text-gray-300">
                  {error.stack}
                </pre>
              </details>
            )}

            {componentStack && (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-[#55a8c2]">
                  Component stack
                </summary>
                <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-gray-100 p-3 text-xs whitespace-pre-wrap text-gray-800 dark:bg-[#0e1517] dark:text-gray-300">
                  {componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-gray-200 p-5 dark:border-gray-700">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              data-testid="errorboundaryretry"
              className="rounded-lg bg-[#55a8c2] px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:ring-2 focus:ring-[#55a8c2] focus:outline-none"
            >
              Try again
            </button>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            data-testid="errorboundaryreload"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:outline-none dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Router error element ---------------------------------------------------

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value ?? "Unknown error"));

// react-router renders its own (unstyled, dev-branded) fallback for anything
// thrown inside a route element, and it gets there before any React boundary
// mounted above RouterProvider. Registering this as the route's `errorElement`
// is the only way to own that UI.
export function RouteErrorElement() {
  const error = useRouteError();

  return (
    <ErrorFallback error={toError(error)} title="This page failed to load" />
  );
}

// ---- React error boundary ---------------------------------------------------

type ErrorBoundaryProps = React.PropsWithChildren<{
  title?: string;
  // When this changes, a boundary currently showing an error resets itself.
  // Pass the route pathname so navigating away from a broken page recovers.
  resetKey?: string;
}>;

type ErrorBoundaryState = {
  error: Error | undefined;
  componentStack: string | undefined;
};

const INITIAL_STATE: ErrorBoundaryState = {
  error: undefined,
  componentStack: undefined,
};

// Only render errors reach a boundary — errors thrown in event handlers, in
// timers, or from rejected promises never do. Those still surface in the console.
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = INITIAL_STATE;

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack ?? undefined });
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey)
      this.reset();
  }

  reset = () => this.setState(INITIAL_STATE);

  render() {
    const { error, componentStack } = this.state;
    const { children, title } = this.props;

    if (!error) return children;

    return (
      <ErrorFallback
        error={error}
        componentStack={componentStack}
        title={title}
        onRetry={this.reset}
      />
    );
  }
}
