import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const todoSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        done: { type: Boolean, default: false },
    },
    { toJSON: { virtuals: true } }
);

const Todos = mongoose.model("Todos", todoSchema);

app.get("/", (req, res) => {
    res.json({ Hello: "world" });
});

// GET /todos - 목록 조회
app.get("/todos", async (req, res) => {
    try {
        const todos = await Todos.find();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /todos - 새 todo 생성
app.post("/todos", async (req, res) => {
    try {
        if (!req.body.content) {
            return res.status(400).json({ error: "content is required" });
        }
        const todo = new Todos({ content: req.body.content, done: false });
        await todo.save();
        res.status(201).json(todo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /todos/:id - todo 수정 (완료 토글 등)
app.put("/todos/:id", async (req, res) => {
    try {
        const todo = await Todos.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!todo) return res.status(404).json({ error: "Todo not found" });
        res.json(todo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /todos/:id - todo 삭제
app.delete("/todos/:id", async (req, res) => {
    try {
        const todo = await Todos.findByIdAndDelete(req.params.id);
        if (!todo) return res.status(404).json({ error: "Todo not found" });
        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

mongoose.connect(process.env.URI)
    .then(() => {
        console.log("✅ MongoDB 연결 성공! (DB: todo-db)");
        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB 연결 실패:", err.message);
        process.exit(1);
    });
