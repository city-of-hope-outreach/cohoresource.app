const express = require('express');
const cors = require('cors');

const admin = require('./firebaseadmin');

const app = express();
app.use(cors({origin: true}));


app.post('/',  async (req, resp) => {
    const categories = admin.db.ref('/categories');

    let ids = [];

    await categories.orderByKey().once("value", (snapshot) => {
        snapshot.forEach((childSnap) => {
            ids.push(childSnap.val().id);
        });
    });

    ids.sort();

    console.log(ids);

    let newId;

    if (ids.length > 0) {
        newId = ids[ids.length - 1] + 1;
    } else {
        newId = 0;
    }

    resp.json({data: {"id": newId}});
});

exports.expressApp = app;
