/**
 * Manejador global de errores.
 *
 * Expone el mensaje solo para errores controlados (status < 500) y oculta
 * los detalles internos en errores inesperados.
 */
export const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const isClientError = status >= 400 && status < 500;

    if (!isClientError) {
        console.error(err.stack);
    }

    res.status(status).json({
        error: isClientError ? err.message : "Internal server error",
        code: isClientError ? "REQUEST_ERROR" : "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
    });
}
