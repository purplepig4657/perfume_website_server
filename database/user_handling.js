const { User } = require("./models/user");
const { Order } = require("./models/order");
const { Product } = require("./models/product");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const userHandling = {

    findid: (req, res) => {
        User.findOne({phone_number: req.body.phoneNumber}, (err, user) => {
            if (err || !user) {
                return res.json({
                    message: "회원 정보가 없습니다.",
                });
            }
            return res.json({email: user.email});
        });
    },

    findpw: (req, res) => {
        User.findOne({email: req.body.email}, (err, user) => {
            if (err || !user) {
                return res.json({
                    message: "회원 정보가 없습니다.",
                });
            }
            
            return res.json({password: user.password});
        });
    },

    info: (req, res) => {
        return res.status(200).json(req.user);
    },

    update: async (req, res) => {
        if (req.body.password) {
            req.body.password = await genBcrypt(req.body.password);
        }
        User.updateOne({ email: req.user.email }, {
            $set: {
                "name": req.body.name ? req.body.name : req.user.name,
                "password": req.body.password ? req.body.password : req.user.password,
                "phone_number": req.body.phone_number ? req.body.phone_number : req.user.phone_number,
            },
        }, (err) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    },

    delete: (req, res) => {
        User.deleteOne({ email: req.user.email }, (err) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    },

    cartView: async (req, res) => {
        User.findOne({ _id: req.user._id }, async (err, user) => {
            if (err) return res.json({ success: false, err });

            selectedProduct = await Product.findOne({_id: req.body.productId});
            if (!selectedProduct) return res.json({ success: false });

            User.updateOne({ _id: req.user._id }, {
                $push: {
                    "cart_view": {
                        "productId": req.body.productId,
                        "productImage": selectedProduct.image_link.main_image,
                        "name": selectedProduct.name,
                        "count": req.body.count,
                        "price": selectedProduct.price * req.body.count,
                        "cartViewId": Date.now(),
                    },
                },
            }, (err) => {
                if (err) return res.json({ success: false, err });
                return res.status(200).json({ success: true });
            });
        });
    },

    cartViewDelete: (req, res) => {
        User.updateOne({ _id: req.user._id }, {
            $pull: {
                "cart_view": {
                    "cartViewId": req.body.cartViewId,
                },
            },
        }, (err) => {
            if (err) return res.json({ success: false, err });
                return res.status(200).json({ success: true });
        });
    },

    purchase: (req, res) => {
        const order = new Order(req.body);

        if ((!req.user.address && req.body.address) ||
             (req.body.address && req.user.address != req.body.address)) {
            User.updateOne({ email: req.user.email }, {
                $set: {
                    "address": req.body.address,
                },
            }, (err) => {
                // if (err) return res.json({ success: false, err });
                // return res.status(200).json({ success: true });
            });
        }

        order.save((err) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    },
};

async function genBcrypt(password) {
    let hashForPassword;
    await new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return reject(err);
            bcrypt.hash(password, salt, function (err, hash) {
                if (err) return reject(err);
                hashForPassword = hash;
                resolve();
            });
        });
    });
    return hashForPassword;
}

module.exports = { userHandling };
