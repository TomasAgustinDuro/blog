export const requireLogin = (req, res, next) => {
    if (req.session?.authenticated){
        next()
    } else {
        res.status(401).json({message: 'No autorizado'})
    }
}