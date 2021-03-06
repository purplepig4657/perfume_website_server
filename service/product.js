const { productHandling } = require('../database/product_hadling')
const { auth } = require("./middleware/auth");
const multer = require('multer');
const url = require('url');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static/images');
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
    }
});

const upload = multer({
    storage: storage,
});

const fileFields = upload.fields([
    {name: 'intro_image', maxCount: 1},
    {name: 'main_image', maxCount: 1},
    {name: 'sub_images', maxCount: 8},
]);


const productRouteConfig = (app) => {
    app.post("/product/upload", fileFields, auth, (req, res) => {
        productHandling.upload(req, res);
    });

    app.get("/product", (req, res) => {
        productHandling.find(req, res);
    });

    app.get("/allproduct", (req, res) => {
        productHandling.findAll(req, res);
    });

    app.post("/product/delete", auth, (req, res) => {
        if (req.user.name == "admin") productHandling.delete(req, res);
        else return res.status(401).json({ success: false, err: "Not an admin" });
    });

    app.post("/product/update", fileFields, auth, (req, res) => {
        if (req.user.name == "admin") productHandling.update(req, res);
        else return res.status(401).json({ success: false, err: "Not an admin" });
    });

    app.post("/product/review", auth, (req, res) => {
        productHandling.review(req, res);
    });
}

module.exports = { productRouteConfig };
