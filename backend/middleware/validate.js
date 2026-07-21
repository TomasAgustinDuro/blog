export const validateSchema = (schema, data = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[data])

        if (!result.success){
            return res.status(400).json({
                error: "Validation failed",
                details: result.error.issues
            })
        }

        req.validated = result.data
        next()
    }

}