const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require('mongoose');
const ExpressError = require("./ExpressError");
const chat = require("./models/chat.js");

// Middleware & Settings
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Database Connection
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fakewhatsapp');
}

// 1. Root Route
app.get("/", async (req, res) => {
    const allchat = await chat.find({});
    res.render("show.ejs", { allchat }); // Yeh pure chats dikhane ke liye hai
});

// 2. All Chats Route
app.get("/chat", async (req, res) => {
    const allchat = await chat.find({});
    res.render("chat.ejs", { allchat });
});

// 3. New Route (Form display)
app.get("/chat/new", (req, res) => {
    res.render("new.ejs");
});

// 4. Post Route (Create)
app.post("/chat", async (req, res) => {
    let { from, msg, to } = req.body;
    let newchat = new chat({
        from: from,
        to: to,
        msg: msg,
        created_at: new Date()
    });
    await newchat.save(); 
    res.redirect("/chat");
});

// 5. Specific Chat Show Route (Fixed image_635336.png error)
app.get("/chat/:id/show", async (req, res, next) => {
    try {
        let { id } = req.params;
        const individualChat = await chat.findById(id);
        
        if (!individualChat) {
            return next(new ExpressError(404, "Chat not found with this ID"));
        }
        
        // Iske liye aapke paas ek ejs file honi chahiye jo single chat dikhaye
        res.render("singleChat.ejs", { chat: individualChat }); 
    } catch (err) {
        next(err); 
    }
});

// 6. Edit Route (Display Form)
app.get("/chat/:id/edit", async (req, res, next) => {
    try {
        let { id } = req.params;
        const newchat = await chat.findById(id);
        
        if (!newchat) {
            return next(new ExpressError(404, "Chat not found with this ID"));
        }
        
        res.render("edit.ejs", { newchat });
    } catch (err) {
        next(err); 
    }
});

// 7. Update Route
app.put("/chat/:id", async (req, res) => {
    let { id } = req.params;
    let { from, msg, to } = req.body;
    await chat.findByIdAndUpdate(id, {
        from: from,
        to: to,
        msg: msg,
        created_at: new Date()
    });
    res.redirect("/chat");
});

// 8. Destroy Route (Delete)
app.delete("/chat/:id", async (req, res) => {
    let { id } = req.params;
    await chat.findByIdAndDelete(id);
    res.redirect("/chat");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    let { status = 500, message = "some error occured" } = err;
    res.status(status).send(message); 
});

// Server Start
const port = 9451;
app.listen(port, () => {
    console.log("server is started on port 8080");
});