import { LoggerService } from '@nestjs/common';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';

export class OtelLoggerService implements LoggerService {
  private readonly otelLogger = logs.getLogger('nestjs');

  log(message: any, context?: string) {
    this.emit(SeverityNumber.INFO, 'INFO', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.emit(SeverityNumber.ERROR, 'ERROR', message, context, trace);
  }

  warn(message: any, context?: string) {
    this.emit(SeverityNumber.WARN, 'WARN', message, context);
  }

  debug(message: any, context?: string) {
    this.emit(SeverityNumber.DEBUG, 'DEBUG', message, context);
  }

  verbose(message: any, context?: string) {
    this.emit(SeverityNumber.TRACE, 'VERBOSE', message, context);
  }

  private emit(
    severityNumber: SeverityNumber,
    severityText: string,
    message: any,
    context?: string,
    trace?: string,
  ) {
    const body = typeof message === 'object' ? JSON.stringify(message) : String(message);

    // Log aussi en console pour que Promtail puisse récupérer les logs stdout
    const prefix = context ? `[${context}]` : '';
    console[severityNumber >= SeverityNumber.ERROR ? 'error' : severityNumber >= SeverityNumber.WARN ? 'warn' : 'log'](
      `${severityText} ${prefix} ${body}`,
    );

    this.otelLogger.emit({
      severityNumber,
      severityText,
      body,
      attributes: {
        ...(context && { 'nestjs.context': context }),
        ...(trace && { 'exception.stacktrace': trace }),
      },
    });
  }
}
