// /routes/todos.router.js

import express from "express";
import Todo from "../schemas/todo.schema.js";
import joi from "joi";

const router = express.Router();

const createdTodoSchema = joi.object({
     value: joi.string().min(1).max(50).required(),
});

// 할일 등록 API

router.post("/todos", async (req, res, next) => {
     // 에러를 따로 try catch 로 관리
     try {
          const validation = await createdTodoSchema.validateAsync(req.body);
          // 1. 클라이언트로 부터 받아온 value 데이터를 가져온다.
          const { value } = validation;

          if (!value) {
               return res.status(400).json({
                    errorMessage:
                         "해야 할 일(value) 데이터가 존재하지 않습니다.",
               });
          }

          // 2. 해당하는 마지막 order 데이터를 조회한다.
          const todoMaxOrder = await Todo.findOne().sort("-order").exec();

          // 3. 만약 존재한다면 현재 해야 할 일은 +1 하고 order 데이터가 존재하지 않다면, 1로 할당한다

          const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;
          // 4. 해야할 일 등록

          const todo = new Todo({ value, order });
          await todo.save();
          // 5. 해야할 일을 클라이언트에게 반환한다.

          return res.status(201).json({ todo: todo });
     } catch (error) {
          next(error);
     }
});

// 해야할 일 목록 조회 API
router.get("/todos", async (req, res, next) => {
     // 1. 해야할 일 목록 조회를 진행한다.
     const todos = await Todo.find().sort("-order").exec();
     // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
     return res.status(200).json({ todos });
});

// 해야할 일 순서 변경 완료 해제 내용변경 API
router.patch("/todos/:todoId", async (req, res, next) => {
     const { todoId } = req.params;
     const { order, done, value } = req.body;

     // 현재 나의 order 를 알아야
     const currentTodo = await Todo.findById(todoId).exec();
     if (!currentTodo) {
          return res
               .status(404)
               .json({ errorMessage: "존재하지 않는 해야할 일 입니다." });
     }

     if (order) {
          const targetTodo = await Todo.findOne({ order }).exec();
          if (targetTodo) {
               targetTodo.order = currentTodo.order;
               await targetTodo.save();
          }

          currentTodo.order = order;
     }
     if (done !== undefined) {
          currentTodo.doneAt = done ? new Date() : null;
     }

     // 해야할 일 변경
     if (value) {
          currentTodo.value = value;
     }

     await currentTodo.save();

     return res.status(200).json({});
});

//해야할 일 삭제
router.delete("/todos/:todoId", async (req, res, next) => {
     const { todoId } = req.params;

     const todo = await Todo.findById(todoId).exec();
     if (!todo) {
          return res
               .status(404)
               .json({ errorMessage: "존재하지 않는 해야할 일 정보입니다." });
     }

     await Todo.deleteOne({ _id: todoId });

     return res.status(200).json({});
});

export default router;
