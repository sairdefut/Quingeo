import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", borderRadius: "5px", margin: "20px" }}>
          <h2>Oops, hubo un error renderizando esta pantalla.</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: "10px" }}>
            {this.state.error?.toString()}
          </pre>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: "10px", marginTop: "10px", fontSize: "0.8em" }}>
              {this.state.error?.stack}
            </pre>
          )}
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-3">Recargar</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
