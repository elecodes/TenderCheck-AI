/**
 * Genkit Telemetry Integration with Sentry
 *
 * This module configures Genkit's telemetry to integrate with Sentry
 * for comprehensive observability and error tracking.
 */

import * as Sentry from "@sentry/node";

/**
 * Custom telemetry logger that forwards Genkit events to Sentry
 */
export class GenkitSentryTelemetry {
  /**
   * Log a Genkit flow start event
   */
  logFlowStart(flowName: string, input: any): void {
    Sentry.addBreadcrumb({
      category: "genkit.flow",
      message: `Flow ${flowName} started`,
      level: "info",
      data: {
        flow_name: flowName,
        input: this.sanitizeInput(input),
      },
    });
  }

  /**
   * Log a Genkit flow completion event
   */
  logFlowComplete(flowName: string, output: any, durationMs: number): void {
    Sentry.addBreadcrumb({
      category: "genkit.flow",
      message: `Flow ${flowName} completed`,
      level: "info",
      data: {
        flow_name: flowName,
        duration_ms: durationMs,
        output: this.sanitizeOutput(output),
      },
    });
  }

  /**
   * Log a Genkit flow error event
   */
  logFlowError(flowName: string, error: Error): void {
    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        flow_name: flowName,
        component: "genkit",
      },
    });
  }

  /**
   * Log model inference metrics
   */
  logModelInference(
    modelName: string,
    tokensUsed: number,
    latencyMs: number,
  ): void {
    Sentry.addBreadcrumb({
      category: "genkit.model",
      message: `Model inference: ${modelName}`,
      level: "info",
      data: {
        model: modelName,
        tokens_used: tokensUsed,
        latency_ms: latencyMs,
      },
    });
  }

  /**
   * Log vector search metrics
   */
  logVectorSearch(
    queryText: string,
    resultsCount: number,
    latencyMs: number,
  ): void {
    Sentry.addBreadcrumb({
      category: "genkit.vector_search",
      message: "Vector similarity search",
      level: "info",
      data: {
        query_length: queryText.length,
        results_count: resultsCount,
        latency_ms: latencyMs,
      },
    });
  }

  /**
   * Sanitize input data to avoid logging sensitive information
   */
  private sanitizeInput(input: any): any {
    if (typeof input === "string") {
      return input.length > 200 ? `${input.substring(0, 200)}...` : input;
    }
    return { type: typeof input };
  }

  /**
   * Sanitize output data to avoid logging sensitive information
   */
  private sanitizeOutput(output: any): any {
    if (typeof output === "string") {
      return output.length > 200 ? `${output.substring(0, 200)}...` : output;
    }
    if (Array.isArray(output)) {
      return { count: output.length };
    }
    return { type: typeof output };
  }
}

// Singleton instance
export const genkitTelemetry = new GenkitSentryTelemetry();
